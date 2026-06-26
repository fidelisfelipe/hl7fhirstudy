# Guia de Estudo — Módulo 2: Modelo e Implementação de Recursos
**Certificação HL7 FHIR Foundational · Material de Apoio PT-BR**

> **Peso no exame:** Este é o módulo mais pesado da prova — **36–51% das questões** vêm daqui. Divide-se em duas competências: *Resource Model and Structure* (21–29%) e *Resource Implementation* (15–21%). Dominar este módulo é a diferença entre passar e não passar.

---

## 1. O que é um recurso FHIR e como ele é organizado

**Analogia de entrada:** Pense em um recurso FHIR como um formulário médico padronizado. Assim como um prontuário tem campos obrigatórios (nome, data de nascimento) e campos opcionais (foto, alergias conhecidas), cada recurso FHIR tem uma estrutura definida com elementos obrigatórios e opcionais, tipos de dados específicos e regras de preenchimento.

**Definição formal:** Um recurso é a unidade lógica mínima de troca no FHIR. Cada instância carrega um tipo (`resourceType`), um identificador lógico (`id`) e dados específicos do domínio.

### A hierarquia de herança

```
Resource (base de tudo)
├── Bundle  ←── herda DIRETO de Resource (não de DomainResource)
└── DomainResource
    ├── Patient
    ├── Observation
    ├── Condition
    └── ... (a maioria dos recursos clínicos)
```

A distinção entre Bundle e DomainResource é uma armadilha frequente. Bundle **não tem** `text`, `contained`, `extension` nem `modifierExtension` — pois herda de Resource, não de DomainResource. Todo recurso que herda de DomainResource tem narrativa (`text`), suporte a extensões e recursos contained.

### Características comuns a todos os recursos

Todo recurso FHIR — independentemente do tipo — possui:

1. **`resourceType`** — string case-sensitive (`"Patient"`, não `"patient"`)
2. **`id`** — identificador lógico atribuído pelo servidor (string, não array)
3. **`meta`** — metadados: `versionId`, `lastUpdated`, `security`, `tag`
4. **`language`** — idioma do conteúdo do recurso (não o idioma falado pelo paciente)
5. **`implicitRules`** — URL de regras adicionais que o receptor deve conhecer

---

## 2. Recursos do exame — o mapa clínico que você precisa memorizar

O exame cobra a escolha do recurso certo para cada cenário. A tabela a seguir mapeia o recurso ao seu propósito exato.

| Recurso | Quando usar |
|---------|-------------|
| **Patient** | Dados demográficos do paciente |
| **Practitioner** | Profissional de saúde (médico, enfermeiro, técnico de lab) |
| **PractitionerRole** | Papel de um Practitioner numa organização (especialidade, localização) |
| **RelatedPerson** | Familiar ou cuidador com relação ao paciente (não é profissional) |
| **Person** | Identidade genérica que pode vincular Patient, Practitioner, RelatedPerson |
| **Condition** | Diagnóstico ou problema clínico |
| **Observation** | Medição ou observação clínica (sinais vitais, resultados de lab) |
| **DiagnosticReport** | Relatório completo de exame (agrega múltiplas Observations + PDF) |
| **ServiceRequest** | Pedido/ordem de exame ou serviço — enviado ao LIS/RIS |
| **Procedure** | Procedimento já realizado no paciente |
| **MedicationRequest** | Prescrição médica — enviada à farmácia |
| **MedicationAdministration** | Medicamento já administrado clinicamente |
| **MedicationStatement** | Medicação relatada pelo paciente (automedicação) |
| **MedicationDispense** | Medicamento dispensado pela farmácia |
| **Immunization** | Vacina efetivamente administrada |
| **ImmunizationRecommendation** | Cronograma futuro de vacinação |
| **Encounter** | Visita/internação (requer `status` e `class` obrigatórios) |
| **Appointment** | Agendamento de consulta (antes de ocorrer) |
| **AppointmentResponse** | Resposta do participante ao agendamento |
| **DocumentReference** | Aponta para um documento clínico (PDF via Binary) |
| **Composition** | Estrutura de documento clínico FHIR |
| **Claim** | Solicitação de reembolso do prestador à seguradora |
| **ClaimResponse** | Resposta da seguradora com resultado de adjudicação |
| **Coverage** | Cobertura/elegibilidade do seguro do paciente |
| **Account** | Controle de saldo e cobranças |
| **Task** | Rastreia estado de uma atividade (pendente, em andamento, concluído) |
| **Goal** | Meta de tratamento ou resultado desejado |
| **CarePlan** | Plano de cuidados com atividades para atingir Goals |
| **FamilyMemberHistory** | Histórico de saúde dos familiares do paciente |
| **Provenance** | Registra quem criou/atualizou uma versão de um recurso |
| **AuditEvent** | Log de segurança e acesso (mais amplo que Provenance) |
| **OperationOutcome** | Erros e avisos de validação retornados pelo servidor |
| **CapabilityStatement** | Declara o que um servidor FHIR suporta |
| **StructureDefinition** | Define perfis e extensões |
| **MessageDefinition** | Define evento, recursos e respostas de uma mensagem FHIR |
| **Binary** | Bytes de um artefato único (PDF, imagem, ZIP) |

**Distinções críticas que caem no exame:**

- **ServiceRequest vs DiagnosticReport:** ServiceRequest é o *pedido* do médico; DiagnosticReport é o *resultado* que volta do laboratório. Confundir os dois é o erro mais comum nesta área.
- **Provenance vs AuditEvent:** Provenance rastreia a linhagem de versões de recursos (quem fez o quê em qual versão). AuditEvent é para logs de segurança/acesso e é mais amplo. Quando a questão fala em "criou/atualizou versão", use Provenance.
- **Immunization vs MedicationAdministration:** vacinas usam Immunization. Medicamentos usam MedicationAdministration. ImmunizationRecommendation é apenas para calendários futuros.
- **Task vs ClaimResponse:** para verificar o *status* de um claim ainda sem resposta, use Task. ClaimResponse é o documento formal da seguradora após adjudicação.
- **FamilyMemberHistory vs Condition vs RelatedPerson:** a mãe que teve AVC aos 56 anos e o irmão diabético ficam em FamilyMemberHistory. Condition é para a condição do próprio paciente. RelatedPerson descreve o familiar como pessoa, não sua condição de saúde.

---

## 3. Cardinalidade — as 4 regras que você não pode errar

Todo elemento FHIR tem cardinalidade na forma `min..max`:

| Notação | Significado |
|---------|-------------|
| **0..1** | Opcional, no máximo uma ocorrência |
| **0..*** | Opcional, pode repetir |
| **1..1** | Obrigatório, exatamente uma ocorrência |
| **1..*** | Obrigatório, pode repetir |

**Regra do pai opcional com filho obrigatório:** se o elemento pai tem cardinalidade `0..1` (opcional), o filho marcado como `1..1` (obrigatório) só é exigido SE o pai estiver presente. Por exemplo, em Encounter, `classHistory` é opcional (`0..*`). Se você incluir `classHistory`, então `classHistory.class` e `classHistory.period` (ambos `1..1`) tornam-se obrigatórios.

**O que pode e não pode mudar num perfil:**

A cardinalidade mínima nunca pode ser reduzida em um perfil (se o base é `1..1`, o perfil não pode mudar para `0..1`). A cardinalidade máxima nunca pode ser aumentada além do base (se o base é `0..1`, o perfil não pode mudar para `0..*`). O que pode: apertar os limites — aumentar o mínimo ou reduzir o máximo.

---

## 4. Tipos de dados — primitivos e complexos

### Primitivos

| Tipo | JSON | Armadilha |
|------|------|-----------|
| `string` | `"texto"` | — |
| `boolean` | `true` / `false` | **Nunca** `"true"` (com aspas) |
| `integer` | `42` | Sem aspas |
| `decimal` | `6.3` | Sem aspas |
| `code` | `"final"` | String simples, **nunca** objeto com `coding` |
| `uri` | `"http://..."` | — |
| `date` | `"2024-10-07"` | — |
| `dateTime` | `"2024-10-07T14:30:00Z"` | ISO 8601 + timezone |
| `instant` | igual ao dateTime | — |

O tipo `code` é a armadilha mais frequente. `Observation.status` é um `code` — seu valor JSON é `"status": "final"`, não um objeto com array `coding`. Quando você ver um campo `code` com binding `required`, use string simples com o código exato do ValueSet.

### Complexos

| Tipo | Estrutura | Quando usar |
|------|-----------|-------------|
| **Coding** | `{ "system": "...", "code": "...", "display": "..." }` | Um único código com sistema |
| **CodeableConcept** | `{ "coding": [ {...}, {...} ], "text": "..." }` | Vários códigos + texto livre |
| **Quantity** | `{ "value": 6.3, "unit": "mmol/L", "system": "http://unitsofmeasure.org", "code": "mmol/L" }` | Valor numérico com unidade |
| **HumanName** | `{ "family": "...", "given": ["..."] }` | Nome de pessoa |
| **Address** | array `[ { "type": "postal", "line": ["..."] } ]` | Endereço — sempre array |
| **Identifier** | `{ "use": "official", "system": "...", "value": "..." }` | Identificador de negócio |
| **ContactPoint** | `{ "system": "phone", "value": "+55...", "use": "home" }` | Telefone, email |
| **Reference** | `{ "reference": "Patient/123" }` ou `{ "identifier": {...} }` | Aponta para outro recurso |
| **Attachment** | `{ "contentType": "application/pdf", "data": "base64..." }` | Binário embutido (PDF, imagem) |

**Coding vs CodeableConcept:** Coding é um único código com sistema. CodeableConcept é um array de Codings mais texto livre. `Observation.status` é `code` (mais simples que Coding). `Condition.clinicalStatus` é `CodeableConcept` (usa array `coding`). `Encounter.class` é `Coding` (não CodeableConcept — não tem array no nível do elemento). Confundir esses três é a armadilha mais recorrente nos quizzes de serialização.

---

## 5. Flags — o que os ícones da especificação significam

| Flag | Símbolo | Significado | Impacto prático |
|------|---------|-------------|-----------------|
| **isSummary** | Σ | Elemento incluído em buscas com `_summary=true` | O cliente que usa `?_summary=true` recebe apenas esses campos |
| **Is-Modifier** | ! | Muda o significado do recurso inteiro | Sistemas que não entendem devem rejeitar o recurso |
| **Must Support** | S | O receptor **deve** processar esse elemento | Definido em perfis; não ignorar |
| **Constraint** | I | Regra invariante que deve ser satisfeita | Violação = instância inválida |

`verificationStatus` em Condition é um Is-Modifier. Se um sistema ignora esse campo, pode exibir diagnósticos refutados como se fossem ativos — exatamente o cenário de erro descrito nos quizzes. `modifierExtension` tem o mesmo comportamento: se o sistema receptor não conhece a definição, deve rejeitar o recurso inteiro, não apenas ignorar o campo.

---

## 6. Terminologia — binding strength e a hierarquia de restrição

O binding determina quão rígido é o conjunto de códigos permitidos para um elemento.

| Força | Regra | Quando usar código fora do VS |
|-------|-------|-------------------------------|
| **required** | Somente códigos do ValueSet são válidos | Nunca — é erro de validação |
| **extensible** | Usar os códigos do VS se houver equivalente | Só se não existir equivalente no VS |
| **preferred** | Recomendado, mas não obrigatório | Quando o sistema tem razão para usar outro |
| **example** | Apenas ilustrativo | Qualquer código |

**Mnemônico (do mais ao menos restritivo):** REPE — Required, Extensible, Preferred, Example.

**Regra do `required` com binding customizado:** quando `clinicalStatus` de AllergyIntolerance tem binding `required` para o VS da HL7, pelo menos um `Coding` do array deve usar o sistema canônico da HL7. Códigos customizados do cliente podem ser adicionados como `Coding` extra — mas o código HL7 padrão precisa estar presente. Usar apenas o sistema customizado sem o código padrão é erro de validação.

**CodeSystem vs ValueSet:** CodeSystem define os códigos e seus significados. ValueSet seleciona subconjuntos de códigos de um ou mais CodeSystems. Ao preencher `coding.system`, use a URL canônica do **CodeSystem** (`http://terminology.hl7.org/CodeSystem/condition-clinical`), nunca a URL do ValueSet (`http://hl7.org/fhir/ValueSet/condition-clinical`). Esse erro de URL é a armadilha mais comum nas questões de terminologia.

---

## 7. Extensões — como criar, onde colocar, o que não ignorar

### Anatomia de uma extensão simples

```json
{
  "extension": [
    {
      "url": "http://hl7.org/fhir/StructureDefinition/patient-interpreterRequired",
      "valueBoolean": true
    }
  ]
}
```

- A `url` é obrigatória e única — identifica a extensão canonicamente.
- O valor é `value[x]` — o tipo é definido pela StructureDefinition da extensão.
- Extensão simples: um único `value[x]`. Extensão complexa: sub-extensões com `url` próprias e sem `value[x]` na raiz.

### Extensão em elemento primitivo (shadow property)

Para estender um primitivo como `HumanName.family` em JSON, use a propriedade "sombra" com prefixo `_`:

```json
{
  "family": "Joshi",
  "_family": {
    "extension": [{
      "url": "http://hl7.org/fhir/StructureDefinition/humanname-partner-name",
      "valueString": "Sharma"
    }]
  }
}
```

O campo `family` mantém seu valor string. A propriedade `_family` carrega as extensões. Nunca transforme o primitivo em objeto — o tipo original deve ser preservado.

### Onde ficam as extensões em XML

Em XML FHIR, a extensão usa o nome curto da StructureDefinition como tag externa, e dentro dela o elemento `<extension url="...">` com o valor. A URL é um atributo XML (não elemento filho).

### modifierExtension — a extensão que não pode ser ignorada

`modifierExtension` muda o significado do elemento pai. Se o sistema receptor não encontra a definição da `modifierExtension`, deve descartar o recurso inteiro e retornar erro. Nunca ignora, nunca processa parcialmente.

### O que define e o que usa a extensão

`StructureDefinition` é o recurso que define a extensão (não existe tipo de recurso chamado "Extension" para publicação). A instância da extensão referencia essa `StructureDefinition` pela URL canônica. Para buscar extensões existentes antes de criar novas: `http://hl7.org/fhir/extensions/`.

---

## 8. Referenciamento de recursos

| Tipo | Sintaxe | Quando usar |
|------|---------|-------------|
| **Literal relativa** | `"reference": "Patient/123"` | Quando o `id` lógico é conhecido |
| **Literal absoluta** | `"reference": "https://server.org/fhir/Patient/123"` | Referência a servidor externo |
| **Lógica** | `"identifier": { "system": "...", "value": "..." }` | Quando só o identificador de negócio é conhecido |
| **Contained** | `"reference": "#id-local"` | Recurso embutido sem id no servidor |
| **Canônica** | `"url": "http://hl7.org/fhir/StructureDefinition/..."` | Para recursos de conformidade |

**Regra de ouro:** quando o `id` lógico do recurso de destino é conhecido, use referência literal (`reference`). Quando só o identificador de negócio é conhecido, use referência lógica (`identifier`). Recursos contained ficam no array `contained` do recurso pai e são referenciados com `#id-local`.

---

## 9. Serialização JSON e XML — regras críticas

### JSON

- **Boolean:** `"active": true` — nunca `"active": "true"` (string) nem `"activeBoolean": true` (nome incorreto)
- **Code:** `"status": "final"` — nunca objeto com `coding`
- **Array para 0..*** — `"address": [{...}]` mesmo com um único elemento; nunca objeto `{}`
- **Chave duplicada:** JSON inválido — duas chaves `"extension"` no mesmo objeto quebram tudo
- **choice type (value[x]):** use o nome tipado diretamente na raiz — `"performedDateTime": "..."`, não aninhado sob `"performed": { "performedDateTime": "..." }`
- **Números sem aspas:** `"duration": 2` (number), nunca `"duration": "2"` (string)

### XML

- Todos os valores primitivos ficam no atributo `value`: `<status value="final"/>`, nunca `<status>final</status>`
- Namespace obrigatório na raiz: `<Patient xmlns="http://hl7.org/fhir">`
- A ordenação dos elementos é significativa — `<id>` vem antes de `<extension>`
- Para boolean em XML: `<active value="true"/>` — o valor é string entre aspas no atributo

### Identifier lógico vs identificador de negócio

`id` é o identificador lógico atribuído pelo servidor — string única, nunca array. O número do prontuário (MRN) vai em `identifier` como elemento de negócio. Se o `id` lógico é 90112 e o MRN é 789099, então: `"id": "90112"` e `"identifier": [{"value": "789099"}]`.

---

## Checkpoint Final — 10 Perguntas de Autoteste

Responda sem consultar o material. Depois compare com o gabarito.

---

**Q1.** Um médico solicita um lipidograma para o paciente. Qual recurso o sistema de entrada de pedidos deve usar para enviar a ordem ao sistema laboratorial?

(A) DiagnosticReport  
(B) Observation  
(C) ServiceRequest  
(D) Specimen  

**Q2.** A seguradora recebeu a solicitação de reembolso e definiu os valores a serem pagos. Qual recurso deve ser usado para enviar o resultado de adjudicação ao prestador?

(A) Claim  
(B) ClaimResponse  
(C) Coverage  
(D) Task  

**Q3.** Um sistema precisa verificar se um claim enviado anteriormente foi processado, usando apenas o identificador comercial do claim. Qual recurso é o mais adequado?

(A) ClaimResponse  
(B) Claim  
(C) Task  
(D) Account  

**Q4.** Um sistema deve registrar que o paciente recebeu 2 doses da vacina TT2. Qual recurso deve ser usado?

(A) ImmunizationRecommendation  
(B) MedicationAdministration  
(C) MedicationStatement  
(D) Immunization  

**Q5.** A mãe do paciente faleceu de AVC aos 56 anos. O irmão tem diabetes. Qual recurso representa essas informações?

(A) Condition  
(B) RelatedPerson  
(C) FamilyMemberHistory  
(D) Group  

**Q6.** Um implementador quer publicar uma extensão no servidor FHIR para que outros sistemas possam buscá-la e reutilizá-la. Qual recurso deve ser usado?

(A) Extension  
(B) Patient  
(C) CapabilityStatement  
(D) StructureDefinition  

**Q7.** Uma extensão que referencia um recurso RelatedPerson deve usar qual tipo de valor?

(A) `valueString`  
(B) `valueContactDetail`  
(C) `valueHumanName`  
(D) `valueReference`  

**Q8.** O elemento `Observation.status` é do tipo `code` com binding `required`. Qual é a forma correta em JSON para indicar status "final"?

(A) `"status": final`  
(B) `"status": { "code": "final" }`  
(C) `"status": { "coding": [{ "code": "final" }] }`  
(D) `"status": "final"`  

**Q9.** Um cliente envia um Patient com `Patient.gender = "other"`. O servidor tem binding `required` para um ValueSet que aceita apenas "male" e "female". Qual recurso o servidor usa para informar o erro ao cliente?

(A) ValueSet  
(B) CodeSystem  
(C) OperationOutcome  
(D) Patient  

**Q10.** Um sistema receptor encontra uma `modifierExtension` num recurso Patient cuja definição não está disponível no sistema receptor. O que ele deve fazer?

(A) Ignorar a `modifierExtension` e processar o restante do recurso  
(B) Ignorar tanto a `modifierExtension` quanto quaisquer extensões e processar o recurso  
(C) Descartar o recurso inteiro e enviar um erro ao sistema remetente  
(D) Processar o recurso e enviar um aviso ao sistema remetente  

---

### Gabarito

| Q | Resp. | Conceito-chave |
|---|-------|----------------|
| 1 | **C** | ServiceRequest = pedido de exame; DiagnosticReport = resultado |
| 2 | **B** | ClaimResponse = adjudicação da seguradora; Claim = pedido do prestador |
| 3 | **C** | Task rastreia status de atividades pendentes (não ClaimResponse, que é a resposta formal) |
| 4 | **D** | Immunization = vacina administrada; ImmunizationRecommendation = calendário futuro |
| 5 | **C** | FamilyMemberHistory = saúde dos familiares; Condition = condição do próprio paciente |
| 6 | **D** | StructureDefinition publica extensões e perfis; não existe recurso tipo "Extension" |
| 7 | **D** | valueReference para referência a outro recurso; nunca valueString para uma referência |
| 8 | **D** | code é primitivo string simples; nunca objeto, nunca sem aspas |
| 9 | **C** | OperationOutcome = erros e avisos de validação retornados pelo servidor |
| 10 | **C** | modifierExtension desconhecida = rejeitar o recurso inteiro; nunca ignorar |

---

> **Próximo passo:** Execute todos os quizzes `module2_q1`, `module2_q2`, `module2_q3`, `module2a_q1` e `module2a_q2` no app. Como este módulo tem mais de 50 questões, divida em sessões de 15–20 por vez. Marque no calendário para revisar este guia em **2 dias** (recência) e novamente em **1 semana** (intervalo de retenção). Use o botão "Revisar Fracos" para focar nas questões com badge vermelho — especialmente as de serialização JSON/XML e seleção de recurso.
