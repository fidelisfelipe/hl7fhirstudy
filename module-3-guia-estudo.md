# Guia de Estudo — Módulo 3: REST API, Search, Bundles e Operações FHIR
**Certificação HL7 FHIR Foundational · Material de Apoio PT-BR**

> **Peso no exame:** ~25% das questões — o módulo mais cobrado do exame. O instrutor alerta: *HTTP status codes, sintaxe de search e os tipos de Bundle são os pontos com maior densidade de distratores. Uma questão errada aqui custa caro.*

---

## 1. REST API FHIR — verbos, operações e respostas HTTP

**Analogia de entrada:** Pense na API FHIR como um protocolo de correio padronizado. Cada tipo de envelope (verbo HTTP) tem uma finalidade definida e gera um recibo específico (status code). Misturar o envelope errado com a operação errada é o erro mais cobrado neste módulo.

### Mapeamento verbo → operação → código de sucesso

| Verbo HTTP | URL | Operação FHIR | Código de sucesso |
|---|---|---|---|
| `POST` | `[base]/[Recurso]` | create | **201 Created** + header `Location` com novo ID |
| `GET` | `[base]/[Recurso]/[id]` | read | **200 OK** |
| `GET` | `[base]/[Recurso]/[id]/_history/[vid]` | vread | **200 OK** |
| `PUT` | `[base]/[Recurso]/[id]` | update | **200 OK** (atualiza) ou **201** (cria, se servidor aceitar) |
| `DELETE` | `[base]/[Recurso]/[id]` | delete | **200 OK** + OperationOutcome, ou **204 No Content** |
| `GET` | `[base]/[Recurso]` | search | **200 OK** + Bundle searchset |
| `GET` | `[base]/[Recurso]/[id]/_history` | history-instance | **200 OK** |
| `GET` | `[base]/[Recurso]/_history` | history-type | **200 OK** |
| `POST` | `[base]/[Recurso]/[id]/$operacao` | operation | varia por operação |

**Detalhe crítico do create:** o servidor retorna `201 Created` e popula o header `Location` com a URL do novo recurso — incluindo o ID gerado. O corpo da resposta pode estar vazio ou conter o recurso criado.

**Detalhe crítico do delete:** o servidor pode retornar `200 OK` com um `OperationOutcome` explicando o resultado, ou simplesmente `204 No Content` sem corpo. Ambos são corretos; o exame pode perguntar qual dos dois é retornado — a resposta é "depende do servidor".

### Códigos de erro que o exame cobra

| Código | Significado FHIR |
|---|---|
| 400 Bad Request | Query ou recurso mal formado (JSON/XML inválido, parâmetro desconhecido obrigatório) |
| 404 Not Found | Recurso com esse ID não existe no servidor |
| 405 Method Not Allowed | Verbo HTTP não suportado para esse tipo de recurso |
| 409 Conflict | Conflito de versão (ex.: update tentando sobrescrever com versão desatualizada) |
| 412 Precondition Failed | Condição de operação condicional não satisfeita |
| 422 Unprocessable Entity | Recurso bem formado sintaticamente, mas inválido semanticamente (viola regra de negócio ou perfil) |

A diferença entre 400 e 422 é frequente nos distratores: **400 = problema sintático** (JSON quebrado, parâmetro fora do lugar); **422 = problema semântico** (recurso estruturalmente correto, mas viola uma regra de validação).

### Operações condicionais — sem ID na URL

Operações condicionais usam parâmetros de busca no lugar do ID lógico:

- **Create condicional:** `POST [base]/[Recurso]` com header `If-None-Exist: [query]` — cria apenas se nenhum recurso existente satisfizer a query.
- **Update condicional:** `PUT [base]/[Recurso]?param=valor` — atualiza o recurso que satisfaz a query.
- **Delete condicional:** `DELETE [base]/[Recurso]?param=valor` — deleta o recurso que satisfaz a query.

A busca que não encontra nada retorna `200 OK` com Bundle vazio — nunca `404`. Este é o distrator mais frequente: o exame oferece `404 Not Found` como resposta para "o que o servidor retorna quando a busca não encontra nenhum resultado", e a resposta correta é `200 OK` com `Bundle.total = 0`.

---

## 2. FHIR Search — construindo queries

**Formato base:** `GET [base]/[Recurso]?parametro=valor&parametro2=valor2`

Múltiplos pares `parametro=valor` dentro de uma URL correspondem a um **AND lógico** — todos os critérios precisam ser satisfeitos. Para OR dentro de um mesmo parâmetro, usar vírgula: `name=João,Maria` (retorna recursos onde name é João OU Maria).

### Tipos de parâmetros de busca

```
Tipo        Sintaxe                         Comportamento
─────────────────────────────────────────────────────────
string      name=John                       Busca parcial — "John" retorna "Johnson" também
token       code=system|code               Busca exata — pipe separa sistema do código
reference   patient=Patient/123            Referência a outro recurso
date        birthdate=ge1990-01-01         Com prefixo de comparação
quantity    value-quantity=6.3||mmol/L     Valor + unidade; dois pipes antes da unidade
number      probability=gt0.8              Comparação numérica direta
```

**Armadilha do token:** o separador entre sistema e código é o pipe (`|`), não a barra (`/`). `code=http://loinc.org|8867-4` está correto; `code=http://loinc.org/8867-4` é uma URL, não um token de busca — busca pelo código `http://loinc.org/8867-4` inteiro, que provavelmente não existe.

### Prefixos de comparação

Aplicam-se a parâmetros do tipo `date`, `number` e `quantity`:

| Prefixo | Significado |
|---|---|
| `eq` | igual (padrão quando nenhum prefixo é dado) |
| `ne` | diferente |
| `lt` | menor que |
| `gt` | maior que |
| `le` | menor ou igual |
| `ge` | maior ou igual |

Para representar um intervalo de datas (ex.: óbitos em 2022), são necessários **dois parâmetros separados**:

```
GET [base]/Patient?death-date=ge2022-01-01&death-date=lt2023-01-01
```

Usar vírgula (`death-date=ge2022-01-01,lt2023-01-01`) é um OR, não um AND — retornaria resultados fora do intervalo esperado. Esta é a armadilha mais comum nos distratores de search.

### Parâmetros globais (prefixo `_`)

| Parâmetro | Exemplo | Efeito |
|---|---|---|
| `_id` | `_id=123` | Busca por ID lógico (retorna Bundle, não o recurso direto) |
| `_sort` | `_sort=-date` | Ordena por data decrescente (- = decrescente) |
| `_count` | `_count=1` | Limita número de resultados por página |
| `_summary` | `_summary=true` | Retorna apenas elementos marcados com flag Σ |
| `_include` | `_include=Observation:subject` | Inclui o recurso referenciado na resposta |
| `_revinclude` | `_revinclude=Observation:subject` | Inclui recursos que referenciam o recurso atual |
| `_has` | `_has:Observation:subject:code=8867-4` | Reverse chaining — filtra pelo que referencia o recurso |

**Exemplo do exame:** "Retorne a Observation mais recente de um paciente." A query correta é:

```
GET [base]/Observation?patient=Patient/123&_sort=-date&_count=1
```

O `-` antes de `date` no `_sort` indica ordem decrescente — a mais recente primeiro. Sem o `-`, seria crescente — a mais antiga primeiro.

### Encadeamento (chaining)

Permite filtrar por propriedades de recursos referenciados:

```
GET [base]/Observation?subject:Patient.name=João
```

Retorna Observations cujo `subject` é um Patient com `name` igual a "João". O encadeamento usa ponto (`.`) para separar o tipo do parâmetro interno.

---

## 3. Bundles — tipos e casos de uso

O Bundle é o envelope FHIR que agrupa múltiplos recursos. O tipo (`Bundle.type`) determina sua semântica e quem o produz.

| Tipo | Produzido por | Finalidade |
|---|---|---|
| `searchset` | Servidor | Resposta a uma busca — inclui `total`, `link` e `entry` |
| `transaction` | Cliente | Envio atômico de múltiplos recursos — tudo ou nada |
| `transaction-response` | Servidor | Resposta ao Bundle transaction |
| `batch` | Cliente | Múltiplos recursos independentes — falhas parciais permitidas |
| `batch-response` | Servidor | Resposta ao Bundle batch |
| `history` | Servidor | Histórico de versões de um recurso ou tipo |
| `document` | Qualquer | Documento clínico (primeira entry = Composition) |
| `message` | Qualquer | Mensagem FHIR (primeira entry = MessageHeader) |
| `collection` | Qualquer | Conjunto genérico sem semântica especial |

### Transaction vs Batch

```
Bundle transaction                   Bundle batch
────────────────────────────         ────────────────────────────
Todas as entradas processadas        Cada entrada processada
como uma unidade atômica.            independentemente.
Se uma falha → tudo é revertido.     Uma falha não afeta as demais.
Retorna: transaction-response        Retorna: batch-response
```

**Exame:** se o requisito é "enviar múltiplos recursos e garantir que todos sejam persistidos ou nenhum seja" — a resposta é `Bundle.type = transaction`. Se falhas parciais são aceitáveis, use `batch`.

### Referências temporárias dentro de um Bundle transaction

Quando um Bundle cria múltiplos recursos relacionados entre si (ex.: Patient e Encounter no mesmo bundle), os IDs ainda não existem. A solução:

1. Usar `urn:uuid:XXXX` como `fullUrl` temporário na entry.
2. Outros recursos referenciam usando `{ "reference": "urn:uuid:XXXX" }`.
3. Após processar, o servidor substitui todos os `urn:uuid` pelos IDs reais e retorna o `transaction-response`.

### Regras de ordenação de entries

- **Document Bundle:** a primeira entry **obrigatoriamente** deve ser um recurso `Composition`.
- **Message Bundle:** a primeira entry **obrigatoriamente** deve ser um recurso `MessageHeader`.
- Outros tipos não têm restrição de ordem.

O exame oferece distratores como "a primeira entry de um Document Bundle é Patient" ou "MessageHeader pode aparecer em qualquer posição". Ambos são falsos.

---

## 4. Operações FHIR

Operações estendem o CRUD padrão para ações que não se encaixam nos verbos HTTP. A sintaxe usa `$` antes do nome da operação.

```
Nível base:     POST [base]/$operacao
Nível de tipo:  POST [base]/[Recurso]/$operacao
Nível instância: POST [base]/[Recurso]/[id]/$operacao
```

### Operações que o exame cobra

| Operação | Nível | Para quê |
|---|---|---|
| `Patient/[id]/$everything` | instância | Retorna todos os recursos relacionados ao paciente |
| `Group/[id]/$everything` | instância | Retorna tudo relacionado a um grupo clínico (ex.: ensaio clínico) |
| `$validate` ou `[Recurso]/$validate` | base / tipo | Valida um recurso sem persistir no servidor |
| `ValueSet/$expand` | tipo | Expande um ValueSet em lista de códigos |
| `ValueSet/$validate-code` | tipo | Valida se um código pertence a um ValueSet |
| `CodeSystem/$validate-code` | tipo | Valida um código diretamente contra um CodeSystem |
| `CodeSystem/$lookup` | tipo | Busca informações sobre um código específico |
| `ConceptMap/$translate` | tipo | Traduz um código entre sistemas (ex.: SNOMED CT → ICD-10) |
| `$process-message` | base | Processa um Bundle do tipo message |

**Armadilha de `$everything`:** a operação correta é `$everything`. A variante `$all-resources` **não existe** no padrão FHIR. O exame oferece ambas como opções — somente `$everything` é válida.

**Armadilha de `$process-message`:** o endpoint correto é `POST [base]/$process-message` — nível base, não `Bundle/$process-message`. Usar o tipo `Bundle` como prefixo é um distrator.

**Armadilha de `Group/$everything`:** quando o cenário descreve um ensaio clínico com vários pacientes e pede "como obter todos os recursos clínicos do grupo", a resposta é `Group/[id]/$everything`, não múltiplas chamadas a `Patient/[id]/$everything`.

**Distinção `ValueSet/$validate-code` vs `CodeSystem/$validate-code`:** use `ValueSet` quando a pergunta é "este código faz parte deste conjunto de valores permitidos?". Use `CodeSystem` quando a pergunta é "este código existe neste sistema de codificação?". São operações distintas com propósitos diferentes.

---

## 5. CapabilityStatement — lendo a documentação do servidor

O CapabilityStatement é o documento de conformidade que descreve o que um servidor FHIR suporta.

**Como obter:** `GET [base]/metadata`

**Campos principais:**

```
kind:
  - instance     → servidor real em produção
  - capability   → declaração abstrata do que o software suporta
  - requirements → requisitos mínimos que um sistema deve atender

rest[].resource[].interaction[].code → interações suportadas por recurso:
  read, vread, create, update, delete, search-type,
  history-instance, history-type

rest[].resource[].searchParam → parâmetros de busca aceitos para o recurso

rest[].interaction → interações a nível de sistema:
  transaction, batch, search-system, history-system
```

**Armadilha de `history-instance` vs `history-type`:**
- `history-instance`: histórico de versões de **um recurso específico** — `GET [base]/Patient/123/_history`
- `history-type`: histórico de **todos os recursos** daquele tipo — `GET [base]/Patient/_history`

São interações distintas no CapabilityStatement. Um servidor pode suportar uma sem suportar a outra.

---

## 6. Segurança FHIR

### Camada de transporte

- **TLS** é obrigatório para toda comunicação HTTP que envolva dados clínicos.
- **OAuth 2.0 + SMART-on-FHIR** é o padrão de autorização e autenticação recomendado para aplicações FHIR.

### Security Labels (em `meta.security`)

| Código | Significado |
|---|---|
| `HTEST` | Dados de teste ou sintéticos — sistemas reais devem ignorar |
| `NOREUSE` | Dados não devem ser compartilhados com outros sistemas |
| `RESTRICTED` | Acesso restrito |
| `VHIGH` | Dados altamente confidenciais (HIV, saúde mental, substâncias) |

**PurposeOfUse:** codifica a finalidade do acesso ao dado — tratamento, pesquisa, faturamento, auditoria.

### AuditEvent vs Provenance

```
AuditEvent                          Provenance
──────────────────────────────      ──────────────────────────────
Registra: quem acessou,             Registra: quem criou ou
quando, de onde e qual ação         modificou um recurso e como
(segurança e compliance)            (rastreabilidade clínica)
```

O exame distingue os dois: **AuditEvent** é log de segurança (acesso, tentativa, falha); **Provenance** rastreia a origem e cadeia de custódia de um recurso clínico.

### Resposta a acesso negado

Quando um servidor recusa o acesso a um recurso por questões de autorização, o comportamento padrão **não é `403 Forbidden`**. O servidor retorna **`200 OK` com Bundle vazio** para não revelar a existência de recursos que o solicitante não tem permissão de ver. Este é um distrator frequente — o exame oferece `403` como opção, mas a resposta correta é `200 OK` com Bundle vazio.

### Checklist de segurança funcional

- **Narrativa FHIR:** validar o conteúdo da narrativa contra XSS antes de renderizar em interfaces web.
- **Sincronização de relógio:** usar NTP para garantir precisão de timestamps em AuditEvent e assinaturas digitais.
- **Referências absolutas vs relativas:** resolver corretamente para evitar que uma referência relativa aponte para o recurso errado em contextos federados.

---

## Checkpoint Final — 10 Perguntas de Autoteste

Responda sem consultar o material. Depois compare com o gabarito.

---

**Q1.** Um cliente FHIR faz `POST [base]/Patient` e o servidor cria o recurso com sucesso. Qual é o código HTTP retornado e o que o servidor inclui obrigatoriamente na resposta?

(A) 200 OK com o recurso no corpo  
(B) 201 Created com header `Location` apontando para o novo recurso  
(C) 201 Created com header `ETag` apenas  
(D) 200 OK com Bundle contendo o novo recurso  

---

**Q2.** Uma busca FHIR é executada e nenhum recurso satisfaz os critérios. O que o servidor retorna?

(A) 404 Not Found  
(B) 204 No Content  
(C) 200 OK com Bundle.total = 0  
(D) 200 OK com corpo vazio  

---

**Q3.** Qual query retorna corretamente todas as Observations com código LOINC `8867-4` (frequência cardíaca)?

(A) `GET [base]/Observation?code=http://loinc.org/8867-4`  
(B) `GET [base]/Observation?code=http://loinc.org|8867-4`  
(C) `GET [base]/Observation?token=loinc:8867-4`  
(D) `GET [base]/Observation?system=loinc&code=8867-4`  

---

**Q4.** Um pesquisador precisa de todos os recursos clínicos relacionados a 200 pacientes de um ensaio clínico, representados como um Group no servidor. Qual operação FHIR é mais apropriada?

(A) `GET [base]/Patient/$everything` para cada paciente individualmente  
(B) `POST [base]/$all-resources` com o Group como parâmetro  
(C) `POST [base]/Group/[id]/$everything`  
(D) `GET [base]/Group/[id]?_include=*`  

---

**Q5.** Um sistema precisa enviar um conjunto de recursos (Patient, Encounter, Observation) garantindo que todos sejam persistidos ou nenhum seja. Qual `Bundle.type` deve usar?

(A) `batch`  
(B) `collection`  
(C) `document`  
(D) `transaction`  

---

**Q6.** Qual é a operação correta para traduzir um código SNOMED CT para o equivalente ICD-10?

(A) `CodeSystem/$lookup`  
(B) `ValueSet/$translate`  
(C) `ConceptMap/$translate`  
(D) `CodeSystem/$validate-code`  

---

**Q7.** Um cliente deseja verificar se o recurso Patient que vai enviar é válido, sem persistir no servidor. Qual operação deve usar?

(A) `PUT [base]/Patient/[id]?_validate=true`  
(B) `POST [base]/Patient/$validate`  
(C) `GET [base]/Patient/$check`  
(D) `POST [base]/$process-message`  

---

**Q8.** Um servidor FHIR recebe uma requisição de busca de um cliente sem permissão para ver os dados solicitados. Qual é o comportamento correto do servidor segundo as diretrizes de segurança FHIR?

(A) Retornar 403 Forbidden  
(B) Retornar 401 Unauthorized  
(C) Retornar 200 OK com Bundle vazio  
(D) Retornar 404 Not Found  

---

**Q9.** Qual query retorna corretamente os pacientes que morreram entre 1 de janeiro de 2022 e 31 de dezembro de 2022?

(A) `GET [base]/Patient?death-date=ge2022-01-01,lt2023-01-01`  
(B) `GET [base]/Patient?death-date=2022-01-01..2022-12-31`  
(C) `GET [base]/Patient?death-date=ge2022-01-01&death-date=lt2023-01-01`  
(D) `GET [base]/Patient?death-date=between:2022-01-01:2023-01-01`  

---

**Q10.** Ao ler um CapabilityStatement, qual é a diferença entre as interações `history-instance` e `history-type` listadas em `rest[].resource[].interaction`?

(A) Não há diferença — são sinônimos no FHIR R4  
(B) `history-instance` retorna o histórico de um recurso específico; `history-type` retorna o histórico de todos os recursos daquele tipo  
(C) `history-type` retorna o histórico de um recurso específico; `history-instance` retorna o histórico de todos  
(D) Apenas `history-instance` é suportada por servidores FHIR em produção  

---

### Gabarito

| Q | Resp. | Conceito-chave |
|---|-------|----------------|
| 1 | **B** | POST create → 201 Created + header Location (não 200) |
| 2 | **C** | Search sem resultados → 200 OK + Bundle vazio (nunca 404) |
| 3 | **B** | Token LOINC usa pipe: `http://loinc.org\|8867-4` (não barra) |
| 4 | **C** | `Group/[id]/$everything` para grupo clínico; `$all-resources` não existe |
| 5 | **D** | `transaction` = atômico; `batch` = independente |
| 6 | **C** | `ConceptMap/$translate` traduz entre sistemas de codificação |
| 7 | **B** | `$validate` em nível de tipo valida sem persistir |
| 8 | **C** | Acesso negado → 200 OK com Bundle vazio (não 403) |
| 9 | **C** | Intervalo de datas = dois parâmetros com & (vírgula seria OR) |
| 10 | **B** | history-instance = um recurso; history-type = todos do tipo |

---

> **Próximo passo:** Execute os quizzes `module3_1_q1`, `module3_2_q1`, `module3_2_q2`, `module3_3_q1`, `module3_4_q1`, `module3_4_q2`, `module3_4_q3`, `module3_5_q1` e `module3_5_q2` no app. Marque no calendário para revisar este guia em **2 dias** (recência) e novamente em **1 semana** (intervalo de retenção). O app mostrará as questões com badge vermelho nas que você errar — use o botão "Revisar Fracos" para focar nelas.
