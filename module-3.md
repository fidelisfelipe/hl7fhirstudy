# Module 3 – FHIR API Behavior and Implementation

---

## Unit 1 – FHIR REST API

### Interações Básicas (CRUD)

O FHIR suporta múltiplos paradigmas de troca de dados (REST API, documentos, mensagens, serviços). A REST API é o mecanismo central para criar, ler, atualizar e deletar recursos.

- **Base URL (Endpoint)**: endereço lógico do servidor FHIR. Não há um formato padronizado pela especificação — cada implementação define o seu.
  - Exemplo: `https://hapi.fhir.org/baseR4`
- O nome do recurso é anexado ao endpoint base: `[base]/Patient`, `[base]/Observation`, etc.

| Interação (PT)     | Verbo HTTP | Nível        | Descrição                                              |
|--------------------|------------|--------------|--------------------------------------------------------|
| Criar (Create)     | POST       | Tipo         | Cria nova instância; servidor atribui o ID             |
| Ler (Read)         | GET        | Instância    | Retorna a versão mais recente pelo ID                  |
| Atualizar (Update) | PUT        | Instância    | Cria nova versão do recurso existente                  |
| Deletar (Delete)   | DELETE     | Instância    | Soft-delete; recurso não é apagado do servidor         |
| Buscar (Search)    | GET        | Tipo / Sistema | Retorna Bundle com recursos correspondentes           |
| Histórico (History)| GET        | Inst./Tipo/Sistema | Retorna todas as versões de um recurso         |

---

### POST – Criar recurso (Create)

- **URL**: `POST [base]/Patient`
- O servidor atribui um novo ID lógico ao recurso criado.
- O corpo da requisição deve conter o JSON/XML do recurso (sem o `id` se for criação nova; se `id` for enviado, o servidor o ignora e atribui o seu próprio).

**Resposta de sucesso:**
- `201 Created` — recurso criado.
- Cabeçalho `Location` contém a URL do novo recurso: `[base]/Patient/[id]/_history/1`

**Códigos de erro comuns no POST:**

| Código | Significado                                                                              |
|--------|------------------------------------------------------------------------------------------|
| 400    | Bad Request — JSON mal formado ou tipo de recurso ausente                                |
| 404    | Not Found — tipo de recurso desconhecido no servidor                                     |
| 422    | Unprocessable Entity — recurso bem formado, mas viola regras de perfil/negócio           |

> **Ponto importante:** POST **sempre cria** um novo recurso. Não verifica duplicatas.

```json
{
  "resourceType": "Patient",
  "name": [{ "family": "Smith", "given": ["John"] }],
  "gender": "male",
  "birthDate": "1980-01-15"
}
```

---

### PUT – Atualizar recurso (Update)

- **URL**: `PUT [base]/Patient/123`
- Cria uma **nova versão** do recurso existente (não substitui a versão anterior; o histórico é mantido).
- O `id` do recurso **deve estar presente na URL** e **também no corpo** do JSON.

**Resposta de sucesso:**
- `200 OK` — recurso atualizado com nova versão.
- Se o ID não existir: o servidor pode criar o recurso ("update as create") ou retornar `400 Bad Request`.

```json
{
  "resourceType": "Patient",
  "id": "123",
  "name": [{ "family": "Smith", "given": ["John"] }],
  "gender": "male"
}
```

> **PATCH** difere do PUT: atualiza a versão **existente** sem criar nova versão. Raramente suportado pelos servidores de teste.

---

### GET – Ler recurso (Read)

**Leitura por ID (Read):**
- `GET [base]/Patient/123` — retorna a versão mais recente do recurso.

**Leitura de versão específica (Version Read):**
- `GET [base]/Patient/123/_history/2` — retorna a versão 2.

**Histórico de instância (Instance History):**
- `GET [base]/Patient/123/_history` — retorna Bundle com todas as versões.

**Histórico de tipo (Type History):**
- `GET [base]/Patient/_history` — retorna todas as versões de todos os recursos do tipo.

**Resposta:**
- `200 OK` com o recurso (ou Bundle no caso de histórico/busca).
- `410 Gone` — recurso foi deletado (soft-delete).
- `404 Not Found` — recurso nunca existiu.

> **Terminologia:** "Read" = GET por ID. "Search" = GET com parâmetros de query (`?param=value`).

---

### DELETE – Remover recurso (Delete)

- **URL**: `DELETE [base]/Patient/123`
- **Soft delete**: o servidor cria uma nova versão vazia (sem conteúdo). O recurso não é removido fisicamente.
- **Resposta de sucesso**: `200 OK` ou `204 No Content`.
- **GET após DELETE**: retorna `410 Gone`.
- **Recuperação**: é possível "reviver" um recurso deletado realizando um `PUT` com o conteúdo desejado.

**Erro de integridade referencial:**
- Se outro recurso referencia o recurso que se tenta deletar, o servidor pode retornar `409 Conflict`.
- Solução: usar parâmetro `_cascade=delete` para deleção em cascata (se o servidor suportar).

---

### Conditional Interactions / Interações Condicionais

Permitem realizar operações usando parâmetros de busca em vez do ID do recurso.

**Conditional Create (Criação Condicional):**
- Cabeçalho: `If-None-Exist: identifier=system|value`
- Comportamento:
  - **Nenhuma correspondência**: cria o recurso.
  - **Uma correspondência**: não cria (retorna o existente).
  - **Múltiplas correspondências**: `412 Precondition Failed`.

**Conditional Update (Atualização Condicional):**
- **URL**: `PUT [base]/Patient?identifier=http://hospital.com/mrn|MRN123`
- Comportamento:

| Cenário                            | Resultado                                   |
|------------------------------------|---------------------------------------------|
| Nenhuma correspondência + sem ID   | Cria novo recurso                           |
| Nenhuma correspondência + com ID   | Cria ou rejeita (depende do servidor)       |
| Uma correspondência               | Atualiza — cria nova versão                 |
| Múltiplas correspondências        | `412 Precondition Failed`                   |

**Conditional Delete (Deleção Condicional):**
- `DELETE [base]/Patient?identifier=system|value`
- Exige que apenas um recurso corresponda; múltiplos → erro (a menos que suporte `multiple`).

---

## Unit 2 – FHIR Search / Pesquisa FHIR

### Abordagem de Query (Query Approach)

A busca FHIR segue **4 passos**:

1. **Identificar o tipo de recurso** (ex.: `Patient`, `Observation`).
2. **Identificar o elemento do recurso** que contém a informação desejada.
3. **Localizar o parâmetro de busca** correspondente na página de definição do recurso (os parâmetros NÃO são necessariamente iguais aos nomes dos elementos).
4. **Formatar o valor** conforme o tipo do parâmetro de busca.

**Estrutura da URL de busca:**
```
GET [base]/[ResourceType]?[param]=[value]&[param2]=[value2]
```

**Operadores lógicos:**
- **AND**: usar `&` entre parâmetros diferentes: `?family=Smith&given=John`
- **OR**: usar vírgula dentro do mesmo parâmetro: `?given=John,Jane`

**Parâmetros especiais:**
- `_sort=birthdate` — ordena por data de nascimento (crescente)
- `_sort=-birthdate` — ordena decrescente (prefixo `-`)
- `_count=25` — limita o número de resultados por página

**Paginação:**
- O resultado é um Bundle do tipo `searchset`.
- O Bundle contém um link `next` com a URL para a próxima página:
  ```json
  "link": [{ "relation": "next", "url": "https://..." }]
  ```

---

### Tipos de Parâmetros de Pesquisa (Search Parameter Types)

#### String, Token, Reference

**String:**
- Busca em campos de texto livre (ex.: `name`, `given`, `family`).
- Por padrão: case-insensitive, "starts-with" (começa com).
- Modificadores:
  - `:exact` — correspondência exata, case-sensitive: `?family:exact=Smith`
  - `:contains` — substring em qualquer posição: `?family:contains=mit`

```
GET [base]/Patient?family=Smith
GET [base]/Patient?given:exact=John
GET [base]/Patient?name:contains=ith
```

**Token:**
- Usado para identificadores, códigos (CodeableConcept, Coding, code, boolean, ContactPoint).
- Formato: `system|code`

| Formato        | Significado                                      |
|----------------|--------------------------------------------------|
| `system\|code`  | Busca pelo sistema E pelo código                 |
| `code`          | Busca pelo código em qualquer sistema            |
| `\|code`         | Busca pelo código sem sistema (sistema ausente)  |
| `system\|`       | Busca por qualquer código naquele sistema        |

```
GET [base]/Patient?identifier=http://hospital.com/mrn|MRN123
GET [base]/Condition?code=http://snomed.info/sct|195967001
```

**Reference:**
- Busca por referência a outro recurso.
- Formato: `ResourceType/id` ou apenas `id`

```
GET [base]/Observation?subject=Patient/123
GET [base]/Observation?subject=123
```

---

#### Quantity, Composite, Chaining

**Quantity:**
- Formato: `[prefixo][número]|[sistema]|[código da unidade]`
- Prefixos: `eq` (igual), `ne` (diferente), `lt` (menor), `le` (menor ou igual), `gt` (maior), `ge` (maior ou igual), `sa` (começa após), `eb` (termina antes), `ap` (aproximado)

```
GET [base]/Observation?value-quantity=lt44||http://unitsofmeasure.org|/min
GET [base]/Observation?value-quantity=ge100|http://unitsofmeasure.org|mg
```

**Chaining (Encadeamento):**
- Permite pesquisar por propriedades de recursos referenciados.
- Formato: `parametro:TipoAlvo.parametroAninhado=valor`

```
GET [base]/Observation?subject:Patient.identifier=http://hospital.com/mrn|MRN123
GET [base]/Observation?subject:Patient.family=Smith
```

**Composite:**
- Combina dois parâmetros usando `$` como separador.
- Útil quando dois parâmetros devem corresponder à **mesma repetição** de um elemento.

```
GET [base]/Observation?component-code-value-quantity=http://loinc.org|8480-6$gt100
```

---

#### Number, Date

**Number:**
- Busca numérica com prefixos (`eq`, `ne`, `lt`, `le`, `gt`, `ge`).
- Suporta intervalos com `sa` (starts after) e `eb` (ends before).

```
GET [base]/RiskAssessment?probability=gt0.8
GET [base]/Claim?total=100
```

**Date:**
- Formatos aceitos: `YYYY`, `YYYY-MM`, `YYYY-MM-DD`, `YYYY-MM-DDThh:mm:ss+zz:zz`
- Correspondência da esquerda para a direita:
  - `birthdate=1980` → qualquer data em 1980 (abrange todo o ano)
  - `birthdate=1980-01` → qualquer data em janeiro de 1980
- Suporta todos os prefixos de quantidade.

```
GET [base]/Patient?birthdate=1980-01-15
GET [base]/Observation?date=ge2024-01-01&date=lt2025-01-01
```

---

### Parâmetros Comuns (_include, _revinclude, _has, _count, etc.)

**`_include`** — inclui recursos referenciados pelo recurso encontrado:
- Formato: `_include=RecursoFonte:parametro:TipoAlvo`
- Exemplo: busca Observation e inclui o Patient referenciado:

```
GET [base]/Observation?patient=123&_include=Observation:subject:Patient
```

No Bundle de resposta, o recurso incluído terá `search.mode = "include"`.

**`_revinclude`** — inclui recursos que **referenciam** o recurso encontrado (reverso):
- Formato: `_revinclude=RecursoFonte:parametro`
- Exemplo: busca Patient e inclui todas as Observations que o referenciam:

```
GET [base]/Patient?_id=123&_revinclude=Observation:subject
```

**`_has`** — filtro por encadeamento reverso (reverse chaining):
- Permite filtrar recursos com base em propriedades de recursos que os referenciam.
- Formato: `_has:RecursoFonte:parametro:parametroDeBusca=valor`

```
GET [base]/Patient?_has:Observation:patient:code=http://loinc.org|29463-7
GET [base]/Patient?_has:Observation:patient:value-quantity=lt44
```

**Outros parâmetros comuns:**

| Parâmetro        | Uso                                                                         |
|------------------|-----------------------------------------------------------------------------|
| `_id`            | Busca por ID lógico do recurso: `?_id=123`                                  |
| `_lastUpdated`   | Filtra por data de última atualização: `?_lastUpdated=ge2024-01-01`         |
| `_count`         | Controla número de resultados por página: `?_count=50`                      |
| `_sort`          | Ordena resultados: `?_sort=family` ou `?_sort=-birthdate`                   |
| `_summary`       | Retorna versão resumida do recurso: `?_summary=true`                        |
| `_elements`      | Retorna apenas os elementos especificados: `?_elements=id,name`             |

---

## Unit 3 – Bundles

### Estrutura e Tipos de Bundle (Bundle Structure and Types)

Bundle é um recurso FHIR especial que funciona como **contêiner** para múltiplos recursos. Herda diretamente do `Resource` base (não de `DomainResource`), portanto possui apenas 4 elementos herdados.

**Estrutura básica:**

```json
{
  "resourceType": "Bundle",
  "type": "transaction",
  "total": 3,
  "link": [{ "relation": "next", "url": "https://..." }],
  "entry": [
    {
      "fullUrl": "https://server/fhir/Patient/123",
      "resource": { "resourceType": "Patient", ... },
      "search": { "mode": "match" },
      "request": { "method": "POST", "url": "Patient" },
      "response": { "status": "201 Created", "location": "Patient/456/_history/1" }
    }
  ],
  "signature": { ... }
}
```

**Elementos do Bundle:**

| Elemento   | Cardinalidade | Descrição                                                                        |
|------------|---------------|----------------------------------------------------------------------------------|
| `type`     | 1..1 (obrig.) | Tipo do Bundle (ver tabela abaixo)                                               |
| `total`    | 0..1          | Número total de correspondências (apenas para `searchset`)                       |
| `link`     | 0..*          | Links de paginação (`self`, `next`, `prev`)                                      |
| `entry`    | 0..*          | Entradas repetíveis; cada entrada contém um recurso                              |
| `signature`| 0..1          | Assinatura digital (base64 binário; usado em documentos)                         |

**Elementos dentro de `entry`:**

| Elemento   | Quando presente                                                                   |
|------------|-----------------------------------------------------------------------------------|
| `resource` | 0..1 — qualquer recurso FHIR; presente em `searchset`, `transaction`, `document` |
| `search`   | 0..1 — apenas em `searchset`; `mode`: `match`, `include`, `outcome`              |
| `request`  | 0..1 — obrigatório em `transaction`/`batch`/`history`; contém `method` e `url`  |
| `response` | 0..1 — em resposta de `transaction`/`batch`/`history`; contém `status`, `location`, `etag` |

**Tipos de Bundle:**

| Tipo                   | Direção      | Uso principal                                                                 |
|------------------------|--------------|-------------------------------------------------------------------------------|
| `searchset`            | Servidor→Cliente | Resultado de uma busca FHIR                                              |
| `history`              | Servidor→Cliente | Histórico de versões de um recurso ou tipo                               |
| `transaction`          | Cliente→Servidor | Envio de múltiplos recursos/APIs em lote atômico                         |
| `transaction-response` | Servidor→Cliente | Resposta de uma transação                                                |
| `batch`                | Cliente→Servidor | Semelhante à transaction, mas com processamento parcial permitido        |
| `batch-response`       | Servidor→Cliente | Resposta de um batch                                                     |
| `document`             | Qualquer     | Documento clínico (Composition obrigatória como primeiro recurso)            |
| `message`              | Qualquer     | Mensagem FHIR (MessageHeader obrigatório como primeiro recurso)              |
| `collection`           | Qualquer     | Coleção simples de recursos sem regras específicas                           |

---

### Transações (transaction) e Batch

**Como enviar uma transação:**
- Verbo HTTP: `POST`
- URL: `[base]` (URL base do servidor — NÃO `/Bundle`)
- O servidor processa cada entrada e retorna um `transaction-response` Bundle.

> **Importante:** Bundle de transação NÃO é criado no servidor. O servidor processa as entradas individualmente.

**Regras de request dentro de transaction:**

```json
"entry": [
  {
    "resource": { "resourceType": "Patient", ... },
    "request": {
      "method": "POST",
      "url": "Patient",
      "ifNoneExist": "identifier=http://hospital.com/mrn|MRN123"
    }
  }
]
```

- Se `method` é `POST` ou `PUT`: `resource` é obrigatório.
- Se `method` é `GET` ou `DELETE`: `resource` não é necessário.

**Sequência de processamento dentro de transaction:**

| Ordem | Método   |
|-------|----------|
| 1º    | DELETE   |
| 2º    | POST     |
| 3º    | PUT/PATCH|
| 4º    | GET      |

> Independentemente da ordem das entradas no JSON, o servidor processa na sequência acima.

**Transaction vs. Batch:**

| Aspecto               | Transaction                            | Batch                                  |
|-----------------------|----------------------------------------|----------------------------------------|
| Atomicidade           | Tudo ou nada (se uma entrada falha, tudo é descartado) | Processamento parcial permitido        |
| Resposta              | `transaction-response`                 | `batch-response`                       |
| Uso típico            | Criação de múltiplos recursos relacionados | Envio de operações independentes       |

---

### Referenciamento de Recursos dentro de Bundle

**Referência por ID conhecido:**
Se o `id` do recurso já é conhecido, usar referência literal:
```json
"subject": { "reference": "Patient/1414" }
```

**Referência temporária (UUID temporário):**
Quando o ID do recurso ainda não é conhecido (ex.: o recurso está sendo criado no mesmo Bundle):

1. Atribuir um `fullUrl` com UUID ao entry do recurso:
```json
"entry": [
  {
    "fullUrl": "urn:uuid:a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "resource": { "resourceType": "Patient", ... },
    "request": { "method": "POST", "url": "Patient" }
  }
]
```

2. Referenciar esse UUID em outro recurso no mesmo Bundle:
```json
"subject": { "reference": "urn:uuid:a1b2c3d4-e5f6-7890-abcd-ef1234567890" }
```

3. O servidor substitui o UUID pela referência real após processar e atribuir o ID definitivo.

> **Regra:** O valor UUID deve ser **único dentro do Bundle**. Pode ser reutilizado em Bundles diferentes.

---

### Bundle de Mensagens (message)

- Tipo de Bundle para troca de mensagens baseadas em **eventos** do mundo real (trigger events).
- Inspirado no conceito de mensagens do HL7 v2, mas sem mensagens pré-definidas pela especificação FHIR.

**Características:**
- Toda a mensagem representa **uma única peça de informação** relacionada a um único evento.
- O primeiro recurso na entrada **deve ser `MessageHeader`** (1..1).
- Todos os recursos no Bundle estão relacionados entre si (diferente de `transaction`).
- Resposta é outro Bundle de tipo `message`.

**MessageHeader — elementos principais:**

| Elemento     | Descrição                                                    |
|--------------|--------------------------------------------------------------|
| `event[x]`   | Código do evento (definido pelo implementador, não pelo FHIR)|
| `destination`| Endpoint receptor                                            |
| `sender`     | Referência à organização/dispositivo remetente               |
| `source`     | Informações técnicas da aplicação remetente                  |
| `response`   | Presente apenas em mensagens de resposta; contém o ID da mensagem original |
| `focus`      | Referências aos recursos principais da mensagem              |

**MessageDefinition:**
- Recurso usado para **definir** uma mensagem: código do evento, recursos obrigatórios/opcionais, e definição de resposta esperada.
- Não faz parte do Bundle de mensagem real; é uma definição prévia.

**Como enviar:**
- Usar operação FHIR: `POST [base]/$process-message`
- Pode usar protocolos alternativos: MLLP, TCP/IP, SFTP.

---

### Bundle de Documentos (document)

- Tipo de Bundle para **documentos clínicos** (ex.: sumário de alta, notas de consulta, relatórios de procedimento).
- Representa um documento legal, assinado e autorizado.

**Características:**
- O primeiro recurso **deve ser `Composition`** (1..1).
- O Bundle pode conter assinatura no elemento `signature`.
- Toda a informação no Bundle pertence a um único contexto clínico.

**Composition — elementos principais:**

| Elemento        | Descrição                                              |
|-----------------|--------------------------------------------------------|
| `type`          | Tipo do documento (ex.: sumário de alta)               |
| `date`          | Data/hora de criação                                   |
| `author`        | Quem criou o documento                                 |
| `attester`      | Quem autenticou/assinou legalmente                     |
| `subject`       | Geralmente o paciente                                  |
| `encounter`     | Encontro associado (boa prática: 1 documento por encontro) |
| `section`       | Seções do documento com título e recursos referenciados|

---

## Unit 4 – Operations & CapabilityStatement

### FHIR Operations / Operações FHIR

As operações FHIR vão além das interações REST básicas (CRUD/Search). São usadas quando:

- O servidor precisa **formular ativamente o conteúdo da resposta** (não apenas retornar recursos existentes).
- A operação envolve **efeitos colaterais** ou modificações complexas.
- A tarefa envolve **regras de negócio** aplicadas a múltiplos recursos.
- É necessária **atualização coordenada** de múltiplos recursos.

**Exemplo de diferença:**
- REST Search: `GET [base]/ValueSet?url=...` → retorna o recurso ValueSet.
- Operação: `GET [base]/ValueSet/$validate-code?url=...&code=M` → o servidor valida se o código existe no ValueSet e retorna `true/false` (não o ValueSet inteiro).

**Formato de invocação:**
```
[base]/[ResourceType]/$[nome-da-operação]?[parâmetros]
```

O prefixo `$` distingue operações de interações REST normais.

**Níveis de aplicação:**

| Nível    | Exemplo                                     | Descrição                               |
|----------|---------------------------------------------|-----------------------------------------|
| Sistema  | `POST [base]/$process-message`              | Aplicável ao servidor inteiro           |
| Tipo     | `POST [base]/ValueSet/$expand`              | Aplicável a um tipo de recurso          |
| Instância| `POST [base]/Patient/123/$everything`       | Aplicável a uma instância específica    |

**GET vs. POST para operações:**
- **GET**: pode ser usado se os parâmetros de entrada são **simples (primitivos)** e a operação **não modifica o estado** do servidor.
- **POST**: sempre funciona; necessário quando há parâmetros complexos.

---

#### Extended Operations (Operações Estendidas)

Operações pré-definidas pelo FHIR:

| Operação             | Recurso(s)               | Descrição                                                    |
|----------------------|--------------------------|--------------------------------------------------------------|
| `$validate`          | Qualquer recurso         | Valida uma instância contra o perfil base ou um perfil específico |
| `$validate-code`     | ValueSet, CodeSystem     | Verifica se um código existe em um ValueSet/CodeSystem       |
| `$expand`            | ValueSet                 | Expande um ValueSet para mostrar todos os seus códigos       |
| `$lookup`            | CodeSystem               | Retorna detalhes de um código específico                     |
| `$translate`         | ConceptMap               | Traduz código de um sistema para outro                       |
| `$everything`        | Patient, Encounter       | Retorna todos os recursos relacionados a uma instância       |
| `$process-message`   | Sistema                  | Processa um Bundle de tipo message                           |

**Recurso Parameters (Parâmetros):**
- Recurso especial não-persistido, usado para trocar parâmetros de entrada/saída de operações.
- Não tem endpoint REST próprio.
- Estrutura:

```json
{
  "resourceType": "Parameters",
  "parameter": [
    { "name": "url", "valueUri": "http://example.org/vs/my-valueset" },
    { "name": "code", "valueCode": "M" },
    { "name": "system", "valueUri": "http://example.org/cs/my-codesystem" }
  ]
}
```

**Exemplo — validar código com GET (parâmetros simples):**
```
GET [base]/ValueSet/$validate-code?url=http://example.org/vs/my-vs&system=http://example.org/cs&code=M
```

**Exemplo — validar código com POST (parâmetros complexos / usando Parameters resource):**
```
POST [base]/ValueSet/$validate-code
Body: (Parameters resource com parâmetros de entrada)
```

**Parâmetros de saída da operação `$validate-code`:**

```json
{
  "resourceType": "Parameters",
  "parameter": [
    { "name": "result", "valueBoolean": true },
    { "name": "message", "valueString": "Code found" },
    { "name": "display", "valueString": "Mandatory" }
  ]
}
```

**Exemplo — `$everything` para um paciente:**
```
GET [base]/Patient/123/$everything
```
Retorna um Bundle com o Patient e todos os recursos relacionados (Observations, Conditions, MedicationRequests, etc.).

**OperationDefinition:**
- Recurso usado para definir formalmente uma operação em formato computável.
- Contém: `code` (nome da operação), `resource` (a qual tipo de recurso se aplica), `system/type/instance` (nível), e lista de `parameter` (in/out).

---

### CapabilityStatement

O `CapabilityStatement` é um recurso FHIR que documenta o conjunto de capacidades de um servidor ou cliente FHIR.

**Como obter o CapabilityStatement de um servidor:**
```
GET [base]/metadata
```
Retorna o recurso CapabilityStatement do servidor.

**Três tipos (kind):**

| Kind          | Descrição                                                                        |
|---------------|----------------------------------------------------------------------------------|
| `instance`    | Servidor FHIR em funcionamento; software implementado e acessível via endpoint   |
| `capability`  | Sistema de software FHIR disponível, mas ainda não implantado em endpoint        |
| `requirements`| Apenas um documento de requisitos; nenhum software envolvido                    |

---

#### kind, rest, resource, interaction, searchParam

**Elementos principais do CapabilityStatement:**

```
CapabilityStatement
├── url, version, name, title (metadados)
├── status: draft | active | retired | unknown
├── kind: instance | capability | requirements
├── fhirVersion: "4.0.1"
├── format: ["json", "xml"]  (formatos suportados)
├── rest[]
│   ├── mode: client | server
│   ├── resource[]
│   │   ├── type: "Patient" (nome do recurso)
│   │   ├── profile: (URL do perfil base)
│   │   ├── supportedProfile[]: (URLs de perfis restritos)
│   │   ├── interaction[]
│   │   │   └── code: read | vread | update | patch | delete | history-instance | history-type | create | search-type
│   │   ├── versioning: no-version | versioned | versioned-update
│   │   ├── conditionalCreate, conditionalUpdate, conditionalDelete
│   │   ├── searchParam[]: (parâmetros de busca suportados)
│   │   └── operation[]: (operações FHIR suportadas para este recurso)
│   ├── interaction[]  (interações no nível do servidor)
│   │   └── code: transaction | batch | search-system | history-system
│   └── searchParam[]: (parâmetros de busca no nível do servidor)
├── messaging[]: (suporte a mensagens)
└── document[]: (suporte a documentos)
```

**Interações de recursos — significados:**

| Código               | Equivalente HTTP  | Descrição                                     |
|----------------------|-------------------|-----------------------------------------------|
| `read`               | GET por ID        | Leitura de instância específica               |
| `vread`              | GET + `_history/n`| Leitura de versão específica                  |
| `update`             | PUT               | Atualização (nova versão)                     |
| `patch`              | PATCH             | Atualização da versão existente               |
| `delete`             | DELETE            | Soft-delete                                   |
| `history-instance`   | GET + `_history`  | Histórico de uma instância                    |
| `history-type`       | GET `/_history`   | Histórico de um tipo                          |
| `create`             | POST              | Criação de novo recurso                       |
| `search-type`        | GET + `?params`   | Busca por tipo de recurso                     |

**Versioning:**

| Valor               | Descrição                                                              |
|---------------------|------------------------------------------------------------------------|
| `no-version`        | Servidor não suporta versionamento (meta.versionId não suportado)      |
| `versioned`         | Servidor mantém versões (meta.versionId suportado)                     |
| `versioned-update`  | Clientes devem enviar a versão correta ao atualizar                    |

---

## Unit 5 – Safety & Security Checklist

### Diretrizes de Segurança (TLS, OAuth, SMART)

O FHIR **não define protocolos de segurança**, mas fornece diretrizes e recursos relacionados.

**Princípios gerais:**
- Toda comunicação de produção deve usar **TLS (Transport Layer Security)** — HTTPS.
- Todos os relógios de clientes e servidores devem ser sincronizados via **NTP** (Network Time Protocol) ou SNTP.
- Nenhum conteúdo de script ativo pode ser injetado em narrativas de recursos (elemento `text`).
- Nenhuma informação sensível deve ser vazada em mensagens de erro.
  - Exemplo ruim: erro dizendo "recurso X não encontrado, mas ID Y existe".
  - Correto: apenas `404 Not Found` sem detalhes adicionais.
- Trilhas de auditoria devem estar presentes para detectar padrões de acesso anômalos.

**Autenticação (Authentication):**
- Verificação da identidade do usuário ou sistema.
- Mecanismo recomendado: **OpenID Connect**.

**Autorização (Authorization):**
- Controle de quais recursos o sistema autenticado pode acessar.
- Mecanismo recomendado: **OAuth 2.0**.
- Implementação recomendada: **SMART on FHIR** — biblioteca que implementa OAuth 2.0 especificamente para contextos de saúde.
  - Permite autenticação do usuário, autorização do sistema cliente, e contexto de lançamento (ex.: qual paciente está sendo visualizado).

**Controle de Acesso:**

| Mecanismo                              | Descrição                                                       |
|----------------------------------------|-----------------------------------------------------------------|
| Baseado em função (RBAC)               | Papel do usuário (médico, enfermeiro, assistente) define o acesso |
| Baseado em atributos (ABAC)            | Labels de segurança + políticas definem o acesso aos dados       |
| "Break the glass" (quebra de vidro)    | Acesso de emergência a dados normalmente protegidos              |

**Tratamento de acesso negado (Access Denied Responses):**

| Código HTTP    | Significado                                                                              |
|----------------|------------------------------------------------------------------------------------------|
| `401 Unauthorized` | Muito explícito: informa ao cliente que a autenticação/autorização falhou          |
| `403 Forbidden`    | Indica falha de autorização, mas não explica como contornar                        |
| `404 Not Found`    | Esconde o fato de que o recurso existe mas não é acessível                         |
| Bundle com 0 resultados | Mais restritivo: indistinguível de "não há dados correspondentes" — máximo ocultamento |

---

### Security Labels / Rótulos de Segurança

Security Labels são metadados de segurança anexados ao elemento `meta.security` de qualquer recurso FHIR.

**Localização no recurso:**
```json
{
  "resourceType": "Patient",
  "meta": {
    "security": [
      {
        "system": "http://terminology.hl7.org/CodeSystem/v3-Confidentiality",
        "code": "R",
        "display": "Restricted"
      },
      {
        "system": "http://terminology.hl7.org/CodeSystem/v3-ActCode",
        "code": "HIV",
        "display": "HIV/AIDS Information Sensitivity"
      }
    ]
  }
}
```

**Categorias de Security Labels (6 sistemas de código):**

| Categoria                      | Exemplos de Códigos                                    |
|--------------------------------|--------------------------------------------------------|
| Códigos de Confidencialidade   | `U` (Unrestricted), `L` (Low), `M` (Moderate), `N` (Normal), `R` (Restricted), `V` (Very Restricted) |
| Sensibilidade de Informação    | `HIV`, `ETH` (uso de substâncias), `PSY` (saúde mental), `SDV` (violência sexual) |
| Controle de Fluxo (Handling)   | `DELAU` (deletar após uso), `NOREUSE` (não reutilizar) |
| Dados de Teste                 | `HTEST` (dados de teste de saúde)                      |
| Finalidade de Uso              | `TREAT` (tratamento), `HPAYMT` (pagamento), `RESEARCH` |
| Compartimento / Integridade    | Definidos por implementação                            |

**`DELAU` (Delete After Use):**
- Instrui o receptor a deletar todos os recursos após o uso imediato.
- Não reutilizar, não redistribuir.

**`HTEST`:**
- Marca a instância como dados de teste — não pertence a paciente real.

---

### AuditEvent e rastreabilidade (Traceability)

**Módulo de Segurança e Privacidade FHIR inclui:**

| Recurso       | Propósito                                                                                    |
|---------------|----------------------------------------------------------------------------------------------|
| `Consent`     | Documenta o consentimento do paciente para coleta, uso ou divulgação dos seus dados          |
| `Provenance`  | Documenta **atividades** ocorridas em uma instância de recurso (quem criou, atualizou, acessou) |
| `AuditEvent`  | Registra eventos de **acesso ao servidor** (qual usuário, qual sistema, sucesso/falha)       |
| `Signature`   | Tipo de dados para assinaturas digitais (binário Base64); presente no elemento `Bundle.signature` |

**Diferença entre Provenance e AuditEvent:**
- **Provenance**: foco em **atividades específicas de instâncias de recursos** — para qual recurso, quem fez, quando, qual ação (create/update/delete).
- **AuditEvent**: foco em **eventos de acesso de alto nível** — qual usuário tentou acessar, credenciais usadas, sucesso ou falha.

**Considerações de privacidade FHIR:**
- Preferências individuais: via OAuth (User Managed Access) ou recurso `Consent`.
- Dados de texto livre (narrativa): não deve conter scripts ativos ou referências externas.
- Desidentificação: remover ou alterar dados identificadores para que a identidade do paciente não possa ser determinada mesmo em caso de vazamento.
- Pacientes devem ser informados sobre coleta, uso e divulgação dos seus dados.

**Considerações de busca e segurança:**
- `_include` e `_revinclude` podem expor recursos que o usuário não tem permissão de acessar diretamente.
- Chaining pode revelar dados de recursos relacionados.
- Operação `$everything` retorna todos os recursos associados — atenção às permissões.
- Servidores devem implementar controle de acesso em todas essas funcionalidades.

---

## Resumo / Summary

| Tópico                    | Ponto-chave                                                                              |
|---------------------------|------------------------------------------------------------------------------------------|
| POST                      | Cria novo recurso; servidor atribui ID; resposta `201 Created`                           |
| PUT                       | Atualiza (nova versão); ID obrigatório na URL e no corpo; `200 OK`                       |
| DELETE                    | Soft-delete; `200 OK`; próximo GET retorna `410 Gone`                                    |
| Conditional Update        | PUT com parâmetros; 4 cenários: criar/atualizar/erro `412`                               |
| Search (4 passos)         | Tipo → elemento → parâmetro → formato do valor                                           |
| Tipos de parâmetro        | string, token, reference, quantity, date, number, composite, URI                         |
| _include / _revinclude    | Incluir recursos referenciados / recursos que referenciam                                |
| _has                      | Filtro reverso por propriedades de recursos que referenciam o alvo                       |
| Bundle transaction        | POST na URL base; atomicidade total; sequência DELETE→POST→PUT→GET                       |
| Bundle batch              | Como transaction, mas permite sucesso parcial                                            |
| Bundle message            | Evento do mundo real; MessageHeader obrigatório; receptor precisa de código para processar |
| Bundle document           | Documento clínico; Composition obrigatória; pode ter assinatura                          |
| Referência temporária     | `fullUrl: urn:uuid:...` → servidor substitui pelo ID real                                |
| Operações FHIR            | `$` prefixo; parâmetros in/out via Parameters resource; POST sempre funciona             |
| CapabilityStatement       | Documenta capacidades do servidor; obtido via `GET [base]/metadata`                      |
| TLS                       | Segurança de comunicação; obrigatório em produção                                        |
| OAuth 2.0 / SMART         | Autorização; SMART on FHIR é a implementação recomendada                                 |
| Security Labels           | `meta.security`; comunicam confidencialidade, sensibilidade, controle de fluxo           |
| AuditEvent / Provenance   | AuditEvent = acesso ao servidor; Provenance = atividades em instâncias de recursos       |
