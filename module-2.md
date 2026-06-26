# Module 2 - FHIR Resource Structure & Implementation

## Unit 1 – Resource & Element Definition / Definição de Recursos e Elementos

### O que é um Recurso FHIR? / What is a FHIR Resource?

- Um recurso é a unidade discreta de dados de saúde no FHIR (equivalente a segmentos no HL7 v2).
  - A resource is the discrete unit of healthcare data in FHIR (equivalent to segments in HL7 v2).
- Cada tipo de recurso foi projetado para um único propósito → `Patient` contém dados demográficos, `Observation` contém resultados clínicos, `AllergyIntolerance` contém alergias, etc.
  - Each resource type was designed for a single purpose.
- Os recursos são independentes, mutuamente exclusivos, e podem ser trocados individualmente.
  - Resources are independent, mutually exclusive, and can be exchanged individually.
- Regra 80/20: o FHIR inclui apenas os elementos usados pela maioria (80%) das implementações; dados específicos de negócio vão em extensões.
  - 80/20 rule: FHIR only includes elements used by the majority (80%) of implementations; business-specific data goes in extensions.

**Como escolher o recurso certo / How to choose the right resource:**
1. Identifique o tipo de informação (demográfico, resultado clínico, alergia, medicamento, procedimento, etc.).
   - Identify the type of information (demographic, clinical result, allergy, medication, procedure, etc.).
2. Leia a definição de cada elemento do recurso candidato.
   - Read the definition of each element in the candidate resource.
3. Mapeie seus dados para os elementos do recurso. O que não couber vai em extensão.
   - Map your data to resource elements. What does not fit goes in an extension.
4. Nunca mude o tipo de recurso depois de decidido; se falta um elemento, crie uma extensão.
   - Never change the resource type after deciding; if an element is missing, create an extension.

---

### Cardinalidade / Cardinality

A cardinalidade define quantas vezes um elemento pode aparecer.
Cardinality defines how many times an element may appear.

| Notação / Notation | Mínimo / Min | Máximo / Max | Significado / Meaning |
|---|---|---|---|
| `0..*` | 0 (opcional) | * (ilimitado) | Opcional e repetível / Optional and repeatable |
| `0..1` | 0 (opcional) | 1 | Opcional, máximo 1 / Optional, max 1 |
| `1..1` | 1 (obrigatório) | 1 | Obrigatório, apenas 1 / Mandatory, exactly 1 |
| `1..*` | 1 (obrigatório) | * (ilimitado) | Obrigatório e repetível / Mandatory and repeatable |

- Cardinalidade mínima `0` = opcional / Min cardinality `0` = optional.
- Cardinalidade mínima `1` = obrigatório / Min cardinality `1` = mandatory.
- `*` = pode repetir qualquer número de vezes / `*` = can repeat any number of times.

---

### Tipos de Dados / Data Types

**Tipos Primitivos / Primitive Types** – armazenam um único valor:
- `string` – texto livre / free text
- `boolean` – `true` ou `false` (sem aspas duplas em JSON)
- `integer` – número inteiro (sem aspas duplas em JSON)
- `decimal` – número com ponto decimal (sem aspas duplas em JSON)
- `date` – apenas data, sem hora (ex.: `"1990-01-15"`) — usado em `birthDate`
- `dateTime` – data com hora (ex.: `"2021-03-10T14:30:00Z"`)
- `instant` – timestamp preciso com fuso horário, usado em `meta.lastUpdated`
- `time` – somente hora (sem data)
- `code` – string fixa case-sensitive representando um código padrão (ex.: `"male"`, `"active"`)
- `uri` – Uniform Resource Identifier
- `OID` – Object Identifier (prefixo `urn:oid:`)
- `UUID` – Universally Unique Identifier (prefixo `urn:uuid:`)
- `base64Binary` – dado binário codificado em base64
- `canonical` – URI canônica com versão opcional

**Tipos Complexos / Complex Types** – contêm múltiplos sub-elementos:
- `HumanName` – nome (family, given, prefix, suffix, use, period)
- `Identifier` – identificador de negócio (system, value, use, type, period)
- `CodeableConcept` – conceito codificado com texto livre (coding[], text)
- `Coding` – código em um sistema (system, code, display, version)
- `ContactPoint` – telefone/email (system, value, use, rank, period)
- `Period` – intervalo de tempo (start, end)
- `Quantity` – medida com unidade (value, unit, system, code, comparator)
- `Address` – endereço (line, city, state, postalCode, country, use, type, period)
- `Reference` – referência a outro recurso (reference, identifier, display, type)
- `Narrative` – texto legível por humanos (status, div em XHTML)
- `BackboneElement` – base para elementos compostos internos ao recurso (extension, modifierExtension)

**Escolha de Tipo de Dados / Data Type Choice (X):**
- Quando um elemento aceita mais de um tipo, o nome usa sufixo `[x]` (ex.: `deceased[x]`).
  - When an element accepts more than one type, the name uses suffix `[x]` (e.g., `deceased[x]`).
- Somente uma opção pode ser usada por instância: `deceasedBoolean` OU `deceasedDateTime`.
  - Only one option can be used per instance: `deceasedBoolean` OR `deceasedDateTime`.
- O `x` é substituído pelo tipo escolhido com a primeira letra maiúscula.
  - The `x` is replaced by the chosen type with its first letter capitalized.

---

### Formato JSON / JSON Format

**Regras fundamentais / Fundamental rules:**
1. **Repetível? / Repeatable?** → Se sim, use colchetes `[]` / If yes, use square brackets `[]`.
2. **Complexo? / Complex?** → Se sim, use chaves `{}` / If yes, use curly braces `{}`.

**Regras adicionais / Additional rules:**
- Tipos primitivos `boolean`, `integer` e `decimal` NÃO levam aspas duplas.
  - Primitive types `boolean`, `integer`, and `decimal` do NOT use double quotes.
- O elemento `resourceType` deve ser declarado explicitamente em JSON.
  - The `resourceType` element must be explicitly declared in JSON.
- Elementos vazios não são permitidos / Empty elements are not allowed.
- Elementos são case-sensitive / Elements are case-sensitive.
- A ordem dos elementos em JSON não importa / Element order in JSON does not matter.

```json
{
  "resourceType": "Patient",
  "id": "example-123",
  "name": [
    {
      "use": "official",
      "family": "Silva",
      "given": ["João", "Pedro"]
    }
  ],
  "gender": "male",
  "birthDate": "1985-06-20",
  "deceasedBoolean": false,
  "identifier": [
    {
      "system": "http://hospital.example.org/mrn",
      "value": "MRN-0042"
    }
  ]
}
```

**Extensão dentro de elemento primitivo em JSON / Extension inside primitive element in JSON:**
- Use `_nomeDoElemento` (underline + mesmo nome) para abrir chaves e escrever a extensão.
  - Use `_elementName` (underscore + same name) to open curly braces and write the extension.

```json
{
  "resourceType": "Patient",
  "gender": "other",
  "_gender": {
    "extension": [
      {
        "url": "http://hospital.example.org/fhir/StructureDefinition/patient-genderIdentity",
        "valueCode": "transgender"
      }
    ]
  }
}
```

---

### Formato XML / XML Format

**Regras principais / Main rules:**
- Valores primitivos usam o atributo `value` entre aspas duplas.
  - Primitive values use the `value` attribute in double quotes.
- Tipos complexos usam hierarquia de elementos aninhados.
  - Complex types use nested element hierarchy.
- Para repetição: repete-se a tag do elemento (sem colchetes).
  - For repetition: repeat the element tag (no brackets).
- A **ordem dos elementos importa** em XML (diferente do JSON).
  - **Element order matters** in XML (unlike JSON).
- O tipo de recurso é implícito pelo nome do elemento raiz (não precisa ser declarado).
  - The resource type is implicit from the root element name (no explicit declaration needed).

```xml
<Patient xmlns="http://hl7.org/fhir">
  <id value="example-123"/>
  <name>
    <use value="official"/>
    <family value="Silva"/>
    <given value="João"/>
    <given value="Pedro"/>
  </name>
  <gender value="male"/>
  <birthDate value="1985-06-20"/>
  <deceasedBoolean value="false"/>
  <identifier>
    <system value="http://hospital.example.org/mrn"/>
    <value value="MRN-0042"/>
  </identifier>
</Patient>
```

**Extensão em elemento primitivo em XML / Extension inside primitive element in XML:**
- Mantenha a tag aberta (sem fechar), escreva a extensão dentro, depois feche.
  - Keep the tag open (don't close it), write the extension inside, then close.

```xml
<gender value="other">
  <extension url="http://hospital.example.org/fhir/StructureDefinition/patient-genderIdentity">
    <valueCode value="transgender"/>
  </extension>
</gender>
```

---

## Unit 2 – Flags / Bandeiras

As bandeiras (flags) são marcadores nas definições de elementos que indicam comportamentos especiais.
Flags are markers in element definitions indicating special behaviors.

### Conjunto de Resumo / Summary Set (Σ)

- Elemento marcado com `Σ` (sigma) faz parte do conjunto de resumo.
  - Element marked with `Σ` (sigma) is part of the summary set.
- Ao fazer uma busca com `_summary=true`, o servidor retorna apenas os elementos marcados com Σ.
  - When searching with `_summary=true`, the server returns only Σ-marked elements.
- Útil para obter uma visão rápida do recurso sem todos os detalhes.
  - Useful for getting a quick overview of the resource without all details.

### Propriedade Modificadora / Modifier Property (!)

- Elemento marcado com `!` pode alterar a interpretação de TODO o conteúdo do recurso.
  - Element marked with `!` can change the interpretation of the ENTIRE resource content.
- **Receptor NÃO pode ignorar** elementos com propriedade modificadora.
  - **Receiver MUST NOT ignore** elements with modifier property.
- Se o receptor não conseguir interpretar um elemento modificador, deve rejeitar o recurso inteiro.
  - If the receiver cannot interpret a modifier element, it must reject the entire resource.
- Exemplo: `verificationStatus` em `AllergyIntolerance`.
  - Example: `verificationStatus` in `AllergyIntolerance`.
  - `confirmed` = evidência clínica suficiente de alergia.
  - `refuted` = evidência suficiente para DESCARTAR a alergia → significado oposto ao `confirmed`.
  - `unconfirmed` = possível, mas não verificado.
  - `entered-in-error` = enviado por engano, deve ser ignorado/descartado.

### Restrições / Invariants (I em R4, C em R5)

- Regras adicionais além do esquema que os elementos devem obedecer.
  - Additional rules beyond the schema that elements must obey.
- Expressas em Schematron (XPath) ou FHIRPath.
  - Expressed in Schematron (XPath) or FHIRPath.
- Exemplo: elemento `contact` de Patient deve ter PELO MENOS um de: name, telecom, address, organization.
  - Example: Patient's `contact` element must have AT LEAST one of: name, telecom, address, organization.
- O **esquema XML/JSON** valida: nome do elemento, cardinalidade, tipo de dado.
  - **XML/JSON schema** validates: element name, cardinality, data type.
- O **Schematron** valida: invariants/restrições adicionais de negócio.
  - **Schematron** validates: additional business invariants.

### StructureDefinition

- Equivalente computável (legível por máquina) da página HTML de definição de recursos.
  - Machine-readable equivalent of the HTML resource definition page.
- Representa formalmente a estrutura, cardinalidade, tipos de dados, bindings, extensões, perfis.
  - Formally represents structure, cardinality, data types, bindings, extensions, profiles.
- Usado para validação formal de instâncias FHIR (via FHIR Validator ou HAPI).
  - Used for formal validation of FHIR instances (via FHIR Validator or HAPI).

---

## Unit 3 – Coded Values / Valores Codificados

Valores codificados garantem interoperabilidade semântica: todos usam o mesmo conjunto de termos.
Coded values ensure semantic interoperability: everyone uses the same set of terms.

### Tipos de Dados Codificados / Coded Data Types

| Tipo / Type | Primitivo/Complexo | Elementos | Uso / Use |
|---|---|---|---|
| `code` | Primitivo | Apenas o valor (string fixa) | Gênero (`"male"`), status (`"active"`) |
| `Coding` | Complexo | `system`, `code`, `display`, `version` | Código + sistema de origem |
| `CodeableConcept` | Complexo | `coding[]`, `text` | Múltiplos códigos + texto livre |

**Exemplo `code` em JSON:**
```json
"gender": "male"
```

**Exemplo `Coding` em JSON:**
```json
"coding": {
  "system": "http://snomed.info/sct",
  "code": "704238004",
  "display": "Asthma"
}
```

**Exemplo `CodeableConcept` em JSON:**
```json
"maritalStatus": {
  "coding": [
    {
      "system": "http://terminology.hl7.org/CodeSystem/v3-MaritalStatus",
      "code": "M",
      "display": "Married"
    }
  ],
  "text": "Married"
}
```

- A propriedade `system` no `Coding` é a URL do **CodeSystem**, nunca do ValueSet.
  - The `system` property in `Coding` is the URL of the **CodeSystem**, never the ValueSet.

---

### ValueSet e CodeSystem

**Relação / Relationship:**
```
Elemento de Recurso  →  ValueSet  →  CodeSystem  →  Códigos
Resource Element     →  ValueSet  →  CodeSystem  →  Codes
```

- Um **CodeSystem** define um conjunto de códigos com URL única (ex.: `http://hl7.org/fhir/administrative-gender`).
  - A **CodeSystem** defines a set of codes with a unique URL.
- Um **ValueSet** referencia 1 ou mais CodeSystems e define qual subconjunto de códigos é permitido.
  - A **ValueSet** references 1 or more CodeSystems and defines which subset of codes is allowed.
- O elemento de recurso nunca aponta diretamente para o CodeSystem — sempre passa pelo ValueSet.
  - The resource element never points directly to the CodeSystem — always goes through the ValueSet.

**URLs importantes / Important URLs:**
- `http://hl7.org/fhir/*` → códigos definidos pelo FHIR / FHIR-defined codes
- `http://terminology.hl7.org/*` → padrões HL7 v2/v3 / HL7 v2/v3 standards
- Terminologias externas estão listadas na página "Terminologies" do FHIR (SNOMED CT, LOINC, ICD, NDC, CPT).
  - External terminologies are listed on the FHIR "Terminologies" page (SNOMED CT, LOINC, ICD, NDC, CPT).

**Criando código personalizado / Creating a custom code:**
1. Crie seu próprio CodeSystem com URL única (ex.: `http://myhospital.org/fhir/CodeSystem/ethnicity`).
   - Create your own CodeSystem with a unique URL.
2. Estenda o ValueSet existente para incluir seu CodeSystem.
   - Extend the existing ValueSet to include your CodeSystem.

---

### Binding Strength / Força de Ligação

Define se é obrigatório usar os códigos do ValueSet ou se é permitido usar códigos personalizados.
Defines whether it is mandatory to use ValueSet codes or whether custom codes are allowed.

| Força / Strength | Código padrão disponível / Standard code available | Pode usar código personalizado? |
|---|---|---|
| **required** | Sim / Yes | NÃO. Use somente os códigos definidos. Se não houver código para seu conceito, use extensão. |
| **extensible** | Sim / Yes | NÃO. Use o código padrão equivalente. Personalizado APENAS se não houver correspondência. |
| **extensible** | Não há correspondência / No match | SIM. Pode criar código personalizado. |
| **preferred** | Sim ou Não | SIM. Pode usar código personalizado mesmo havendo equivalente (mas recomenda-se o padrão). |
| **example** | Sugestão / Suggestion only | SIM. O ValueSet é apenas uma sugestão; use qualquer sistema de códigos. |

**Exemplos práticos / Practical examples:**
- `gender` → `required`: não existe código para "transgender", use **extensão**.
  - `gender` → `required`: no code for "transgender", use an **extension**.
- `maritalStatus` → `extensible`: se "married" corresponde ao código `M`, use `M`. Usar código `X` é INVÁLIDO.
  - `maritalStatus` → `extensible`: if "married" matches code `M`, use `M`. Using code `X` is INVALID.
- `Condition.severity` → `preferred`: pode usar código SNOMED ou criar o seu próprio.
  - `Condition.severity` → `preferred`: can use SNOMED code or create your own.
- `Condition.code`, `Observation.code` → `example`: LOINC é sugestão, use qualquer terminologia.
  - `Condition.code`, `Observation.code` → `example`: LOINC is just a suggestion, use any terminology.

**Caso especial: `extensible` + tipo `Coding` (não `CodeableConcept`) + não repetível:**
- Se o elemento não pode repetir E o tipo é `Coding` (não `CodeableConcept`), não há como escrever dois códigos.
  - If the element cannot repeat AND the type is `Coding` (not `CodeableConcept`), there's no way to write two codes.
- Solução: use o código padrão FHIR no elemento E adicione o código personalizado em uma **extensão**.
  - Solution: use the FHIR standard code in the element AND add the custom code in an **extension**.
- Se o tipo for `CodeableConcept`, o `coding` é repetível: inclua ambos os códigos.
  - If the type is `CodeableConcept`, `coding` is repeatable: include both codes.

---

## Unit 4 – Base Resources / Recursos Base

### Hierarquia de Herança / Inheritance Hierarchy

```
Resource (abstrato / abstract)
└── DomainResource (abstrato / abstract)
    └── Patient, Observation, AllergyIntolerance, Condition, ... (todos recursos clínicos)

Resource (abstrato / abstract)
├── Binary          (herda diretamente, sem DomainResource)
├── Bundle          (herda diretamente, sem DomainResource)
└── Parameters      (herda diretamente, sem DomainResource)
```

- `Resource` é a base de tudo. Fornece 4 elementos fundamentais.
  - `Resource` is the base of everything. Provides 4 fundamental elements.
- `DomainResource` estende `Resource` com 4 elementos adicionais para recursos clínicos.
  - `DomainResource` extends `Resource` with 4 additional elements for clinical resources.
- `Binary`, `Bundle` e `Parameters` herdam diretamente de `Resource` (sem os elementos do `DomainResource`).
  - `Binary`, `Bundle`, and `Parameters` inherit directly from `Resource` (without `DomainResource` elements).

---

### Elementos do Resource Base / Base Resource Elements

| Elemento | Tipo de Dado | Descrição |
|---|---|---|
| `id` | `id` (alfanumérico, `-`, `.`) | ID lógico do recurso, atribuído pelo servidor. Único por tipo de recurso no servidor. NÃO é identificador de negócio. |
| `meta` | `Meta` | Metadados da instância (versionId, lastUpdated, source, profile, security, tag) |
| `implicitRules` | `uri` | URI das regras implícitas de processamento (uso limitado) |
| `language` | `code` | Idioma do recurso |

**Sobre o `id` (ID Lógico / Logical ID):**
- Atribuído pelo servidor FHIR quando o recurso é armazenado.
  - Assigned by the FHIR server when the resource is stored.
- Único por tipo de recurso no servidor (ex.: dois servidores diferentes podem ter Patient com id=`123` representando pacientes diferentes).
  - Unique per resource type on the server.
- Tipo de dado `id`: aceita letras A-Z, a-z, 0-9, traço `-` e ponto `.`.
  - Data type `id`: accepts letters A-Z, a-z, 0-9, dash `-`, and period `.`.

**Sobre o `meta`:**
- `versionId` → atualizado a cada PUT (update); usado para controle de versão.
  - Updated on each PUT (update); used for version control.
- `lastUpdated` → timestamp da última atualização; compare para ordenar versões.
  - Timestamp of last update; compare to order versions.
- `source` → URI da fonte original do recurso.
- `profile` → lista de perfis (StructureDefinitions) que esta instância deve conformar.
- `security` → rótulos de segurança (confidencialidade, etc.).
- `tag` → tags livres para rastreamento, fluxo de trabalho, etc.

---

### Elementos do DomainResource / DomainResource Elements

| Elemento | Tipo de Dado | Descrição |
|---|---|---|
| `text` | `Narrative` | Narrativa legível por humanos (status + div XHTML) |
| `contained` | `Resource[]` | Recursos contidos (mecanismo de referenciamento inline) |
| `extension` | `Extension[]` | Extensões customizadas |
| `modifierExtension` | `Extension[]` | Extensões modificadoras (não podem ser ignoradas) |

**Sobre o `text` (Narrativa / Narrative):**
- Inspirado no conceito CDA (Clinical Document Architecture).
  - Inspired by the CDA (Clinical Document Architecture) concept.
- Permite que o recurso seja legível por humanos mesmo sem parsear o JSON/XML estruturado.
  - Allows the resource to be human-readable without parsing the structured JSON/XML.
- `status`: `generated` | `extensions` | `additional` | `empty`.
  - `generated` = narrativa gerada automaticamente a partir dos dados estruturados.
  - `extensions` = inclui dados de extensões.
  - `additional` = contém informação além dos dados estruturados.
  - `empty` = narrativa vazia.
- `div` = conteúdo XHTML da narrativa.

**Sobre o `BackboneElement`:**
- Tipo de dado base para elementos compostos internos ao recurso (ex.: `Patient.contact`, `Observation.component`).
  - Base data type for compound elements internal to a resource.
- Fornece `extension` + `modifierExtension` (diferente do tipo base `Element`, que fornece apenas `id` + `extension`).
  - Provides `extension` + `modifierExtension`.
- Só elementos com tipo `BackboneElement` podem ter `modifierExtension` dentro deles.
  - Only elements with type `BackboneElement` can have `modifierExtension` inside them.

**"Meaning When Missing" (Significado quando ausente):**
- Para alguns elementos, o FHIR define um significado explícito quando o elemento está ausente.
  - For some elements, FHIR defines an explicit meaning when the element is absent.
- Exemplos:
  - `Encounter.period.end` ausente = encontro ainda está em andamento.
    - `Encounter.period.end` absent = encounter is still ongoing.
  - `Patient.active` ausente = registro está ativo.
    - `Patient.active` absent = record is active.

---

## Unit 5 – Extensions / Extensões

### Por que precisamos de extensões? / Why do we need extensions?

- O FHIR segue a regra 80/20: só define elementos usados pela maioria. Dados de negócio específicos não têm elemento padrão.
  - FHIR follows the 80/20 rule: only defines elements used by the majority. Specific business data has no standard element.
- Extensão é simplesmente um **elemento de recurso** — não é algo fora do padrão FHIR.
  - An extension is simply a **resource element** — it is not something outside the FHIR standard.
- Herdada do `DomainResource` (ao nível de recursos) ou do tipo de dado base `Element` (ao nível de qualquer elemento/tipo de dado).
  - Inherited from `DomainResource` (at resource level) or from the base data type `Element` (at any element/data type level).

---

### Estrutura de uma Extensão / Extension Structure

O tipo de dado `Extension` (com E maiúsculo) tem dois elementos:

| Elemento | Cardinalidade | Tipo | Descrição |
|---|---|---|---|
| `url` | 1..1 (obrigatório) | `uri` | Identifica a extensão; aponta para a StructureDefinition que a define |
| `value[x]` | 0..1 | Escolha / Choice | O valor da extensão; escolha o tipo baseado nos seus dados |

- O `x` em `value[x]` representa a escolha do tipo de dado. Exemplos: `valueString`, `valueCode`, `valueCoding`, `valueCodeableConcept`, `valueBoolean`, `valueHumanName`, `valueReference`, etc.
  - The `x` in `value[x]` represents the data type choice.
- **Regra:** ou `value[x]` OU sub-extensões — nunca ambos.
  - **Rule:** either `value[x]` OR sub-extensions — never both.

**Como escrever uma extensão em JSON / How to write an extension in JSON:**
```json
{
  "resourceType": "Patient",
  "extension": [
    {
      "url": "http://myhospital.org/fhir/StructureDefinition/patient-race",
      "valueCode": "asian"
    },
    {
      "url": "http://myhospital.org/fhir/StructureDefinition/patient-ethnicity",
      "valueCoding": {
        "system": "http://myhospital.org/fhir/CodeSystem/ethnicity",
        "code": "hispanic"
      }
    }
  ],
  "gender": "male"
}
```

**Como escrever em XML / How to write in XML:**
```xml
<Patient xmlns="http://hl7.org/fhir">
  <extension url="http://myhospital.org/fhir/StructureDefinition/patient-race">
    <valueCode value="asian"/>
  </extension>
  <gender value="male"/>
</Patient>
```

---

### Extensões Definidas pelo FHIR / FHIR-Defined Extensions

- Extensões definidas pelo FHIR estão no **FHIR Extension Registry** (aba Extensions na spec).
  - FHIR-defined extensions are in the **FHIR Extension Registry** (Extensions tab in the spec).
- Antes de criar uma extensão própria, verifique se o FHIR ou um Implementation Guide (IG) já a definiu.
  - Before creating your own extension, check if FHIR or an Implementation Guide (IG) already defined it.
- Exemplo: `patient-mothersMaidenName` → URL: `http://hl7.org/fhir/StructureDefinition/patient-mothersMaidenName`
  - Contexto: nível de recurso Patient (`Patient`).
  - Cardinalidade: `0..1`.
  - Tipo de dado: `string` → usa `valueString`.
- Extensões do IG US Core, Da Vinci, Blue Button, etc., têm precedência sobre extensões próprias dentro de seu contexto.
  - Extensions from US Core, Da Vinci, Blue Button IGs, etc., take precedence over custom ones within their context.
- URL de extensão definida pelo FHIR sempre começa com `http://hl7.org/fhir/StructureDefinition/`.
  - FHIR-defined extension URL always starts with `http://hl7.org/fhir/StructureDefinition/`.

**Como ler o registro de extensões:**
- `Name` = nome lógico da extensão.
- `Card.` = cardinalidade.
- `Context` = onde usar (`Patient`, `AllergyIntolerance.reaction`, etc.).
- Clique no nome para ver a definição completa, incluindo URL, tipo de dado e binding.

---

### Extensão dentro de Elemento de Recurso / Extension inside Resource Element

- Todos os tipos de dado em FHIR herdam do tipo base `Element`, que fornece `id` e `extension`.
  - All data types in FHIR inherit from the base type `Element`, which provides `id` and `extension`.
- Logo, qualquer elemento (mesmo primitivo) pode ter uma extensão.
  - Therefore, any element (even primitive) can have an extension.
- **Extensão ao nível do recurso** → vem do `DomainResource`.
  - **Extension at resource level** → comes from `DomainResource`.
- **Extensão dentro de elemento** → vem do tipo base `Element` via herança do tipo de dado.
  - **Extension inside element** → comes from base type `Element` via data type inheritance.

```json
{
  "name": [
    {
      "family": "Silva",
      "given": ["João"],
      "_given": [
        {
          "extension": [
            {
              "url": "http://myhospital.org/fhir/StructureDefinition/patient-middleName",
              "valueString": "Carlos"
            }
          ]
        }
      ]
    }
  ]
}
```

---

### Extensão Complexa / Complex Extension

- Uma extensão pode conter sub-extensões em vez de `value[x]`.
  - An extension can contain sub-extensions instead of `value[x]`.
- Usada quando os dados de negócio têm múltiplos componentes inseparáveis que não se encaixam em um único tipo de dado existente.
  - Used when business data has multiple inseparable components that don't fit a single existing data type.
- Existe **apenas uma** StructureDefinition para toda a extensão complexa (não uma por sub-extensão).
  - There is **only one** StructureDefinition for the entire complex extension (not one per sub-extension).
- As URLs das sub-extensões internas costumam ser strings simples (não URLs completas).
  - Internal sub-extension URLs are usually simple strings (not full URLs).

```json
{
  "extension": [
    {
      "url": "http://myhospital.org/fhir/StructureDefinition/patient-citizenship",
      "extension": [
        {
          "url": "country",
          "valueCodeableConcept": {
            "coding": [
              {
                "system": "urn:iso:std:iso:3166",
                "code": "BR"
              }
            ]
          }
        },
        {
          "url": "period",
          "valuePeriod": {
            "start": "2000-01-01"
          }
        },
        {
          "url": "passportNumber",
          "valueString": "BR1234567"
        }
      ]
    }
  ]
}
```

---

### ModifierExtension / Extensão Modificadora

- Extensão que tem potencial para **alterar a interpretação de todo o conteúdo do recurso**.
  - Extension that has the potential to **change the interpretation of the entire resource content**.
- **NÃO pode ser ignorada** pelo sistema receptor. Se não conseguir interpretar → rejeitar o recurso inteiro.
  - **CANNOT be ignored** by the receiving system. If unable to interpret → reject the entire resource.
- Extensão normal pode ser ignorada com segurança se o receptor não entender seu significado.
  - A normal extension can be safely ignored if the receiver doesn't understand its meaning.
- Use `modifierExtension` apenas quando o dado pode mudar o significado de "cabeça para baixo" (norte/sul), como no exemplo:
  - Use `modifierExtension` only when the data can flip the meaning, as in the example:
  - `MedicationRequest` com anti-prescrição: sem esse dado, o receptor entenderia que o paciente DEVE tomar o medicamento; com ele, entende que NÃO deve.
    - `MedicationRequest` with anti-prescription: without this data, receiver understands patient SHOULD take medication; with it, understands they SHOULD NOT.
- `modifierExtension` está disponível:
  - Ao nível de recursos que herdam de `DomainResource`.
  - Dentro de elementos com tipo `BackboneElement` (ex.: `Patient.contact`).
  - **NÃO** disponível dentro de tipos de dados simples (apenas extensão normal).

---

### FHIR Registry / Registro FHIR

- Antes de criar sua própria extensão, consulte:
  1. O registro de extensões do core FHIR (`hl7.org/fhir` → aba Extensions).
  2. O Implementation Guide relevante para seu contexto (US Core, Da Vinci, Blue Button, etc.).
- A URL de uma extensão deve ser **única** para identificar aquela extensão.
  - The URL of an extension must be **unique** to identify that extension.
- O receptor usa a URL para recuperar a StructureDefinition da extensão e entender seu significado.
  - The receiver uses the URL to retrieve the extension's StructureDefinition and understand its meaning.

---

## Unit 6 – Resource Referencing / Referenciamento de Recursos

### Por que referenciar? / Why reference?

- Recursos são distintos e independentes: `Observation` não contém dados do paciente; `Patient` não contém resultados clínicos.
  - Resources are distinct and independent: `Observation` doesn't contain patient data; `Patient` doesn't contain clinical results.
- Para ligar informações de recursos diferentes (ex.: frequência cardíaca → paciente), usa-se referenciamento.
  - To link information across different resources (e.g., heart rate → patient), use referencing.
- O FHIR já define QUAIS recursos podem referenciar quais (basta verificar o tipo de dado `Reference` na definição do recurso).
  - FHIR already defines WHICH resources can reference which (just check the `Reference` data type in the resource definition).
- O ícone de referência na spec ou o tipo de dado `Reference` indica que um elemento aponta para outro recurso.
  - The reference icon in the spec or the `Reference` data type indicates an element points to another resource.

**Analogia com banco de dados relacional / Relational database analogy:**
- Tabela de sinais vitais tem chave estrangeira para a tabela de paciente → o FHIR faz o mesmo com `Reference`.
  - Vitals table has a foreign key to the patient table → FHIR does the same with `Reference`.

---

### Tipo de Dado Reference / Reference Data Type

O tipo `Reference` contém:

| Elemento | Tipo | Uso |
|---|---|---|
| `reference` | `string` | Referência literal (ID do recurso) |
| `identifier` | `Identifier` | Referência lógica (identificador de negócio) |
| `display` | `string` | Texto livre para exibição humana (não para processamento) |
| `type` | `uri` | Tipo de recurso alvo (ex.: `"Patient"`) |

---

### Mecanismos de Referenciamento / Referencing Mechanisms

#### 1. Referência Literal / Literal Reference

Usada quando você **conhece o ID do recurso** (ID lógico / resource ID).
Used when you **know the resource ID** (logical ID / resource ID).

**URL Absoluta / Absolute URL:** inclui o endpoint do servidor.
```json
"subject": {
  "reference": "https://myfhirserver.org/fhir/Patient/27"
}
```

**URL Relativa / Relative URL:** omite o endpoint (assume o mesmo servidor).
```json
"subject": {
  "reference": "Patient/27"
}
```

- Se o recurso referenciado está no mesmo servidor, URL relativa é suficiente.
  - If the referenced resource is on the same server, a relative URL is sufficient.

#### 2. Referência Lógica / Logical Reference

Usada quando você **NÃO conhece o ID do recurso**, mas conhece um **identificador de negócio** compreendido por ambas as partes (remetente e receptor).
Used when you **do NOT know the resource ID**, but know a **business identifier** understood by both parties.

```json
"subject": {
  "type": "Patient",
  "identifier": {
    "system": "http://hospital.example.org/mrn",
    "value": "MRN-0042"
  }
}
```

- Use o elemento `identifier` em vez de `reference`.
  - Use the `identifier` element instead of `reference`.
- O `type` ajuda o receptor a saber de qual tipo de recurso é o identificador.
  - The `type` helps the receiver know what resource type the identifier belongs to.

> **Atenção / Note:** "ID lógico" = ID do recurso (atribuído pelo servidor). "Referência lógica" = usa identificador de negócio. Não confundir!
> "Logical ID" = resource ID (server-assigned). "Logical reference" = uses business identifier. Don't confuse them!

#### 3. Referência Inline (Contained) / Contained Resource Reference

Usada quando **nenhum dos dois mecanismos anteriores funciona**: sem ID de recurso, sem identificador de negócio compartilhado, mas com outros dados do paciente (nome, gênero, telefone, etc.).
Used when **neither of the two previous mechanisms works**: no resource ID, no shared business identifier, but with other patient data (name, gender, phone, etc.).

**Como funciona:**
1. Inclua o recurso alvo dentro de `contained`, com um ID falso/local (ex.: `"p1"`).
   - Include the target resource inside `contained`, with a fake/local ID (e.g., `"p1"`).
2. Referencie via `reference` com `#` + o ID local: `"#p1"`.
   - Reference via `reference` with `#` + the local ID: `"#p1"`.
3. O servidor FHIR **não criará** o recurso contido separadamente — ele faz parte do recurso container.
   - The FHIR server **will NOT create** the contained resource separately — it is part of the container resource.

```json
{
  "resourceType": "Observation",
  "contained": [
    {
      "resourceType": "Patient",
      "id": "p1",
      "name": [{"family": "Silva", "given": ["João"]}],
      "gender": "male",
      "telecom": [{"system": "phone", "value": "+55 11 99999-0000"}]
    }
  ],
  "subject": {
    "reference": "#p1"
  },
  "code": {
    "coding": [{"system": "http://loinc.org", "code": "8867-4", "display": "Heart rate"}]
  },
  "valueQuantity": {
    "value": 44,
    "unit": "beats/minute"
  }
}
```

**Regras para `contained` / Rules for `contained`:**
- O recurso contido NÃO pode conter outro recurso (sem aninhamento).
  - The contained resource CANNOT contain another resource (no nesting).
- O recurso contido DEVE ser referenciado de algum lugar no recurso container.
  - The contained resource MUST be referenced from somewhere in the container resource.
- O recurso contido NÃO deve ter `meta.versionId` (não há versão independente).
  - The contained resource MUST NOT have `meta.versionId`.
- O recurso contido NÃO deve ter `meta.security`.
  - The contained resource MUST NOT have `meta.security`.
- O recurso container deve ter narrativa (`text`) para gestão robusta.
  - The container resource should have narrative (`text`) for robust management.

**Preferência / Preference order:**
1. Referência literal (ID de recurso) — mais eficiente para consultas.
   - Literal reference (resource ID) — most efficient for queries.
2. Referência lógica (identificador de negócio) — quando ID de recurso não é conhecido.
   - Logical reference (business identifier) — when resource ID is not known.
3. `contained` (inline) — último recurso; impede consultas eficientes no servidor.
   - `contained` (inline) — last resort; prevents efficient server queries.

---

### Exemplos de Referenciamento em JSON / JSON Referencing Examples

**Observation referenciando Patient e Practitioner(s):**
```json
{
  "resourceType": "Observation",
  "subject": {
    "reference": "Patient/27"
  },
  "performer": [
    {
      "reference": "Practitioner/101",
      "display": "Dr. Ana Costa"
    },
    {
      "reference": "Practitioner/102",
      "display": "Lab Technician Maria"
    }
  ],
  "encounter": {
    "reference": "Encounter/55"
  }
}
```

**Em XML:**
```xml
<Observation xmlns="http://hl7.org/fhir">
  <subject>
    <reference value="Patient/27"/>
  </subject>
  <performer>
    <reference value="Practitioner/101"/>
  </performer>
  <performer>
    <reference value="Practitioner/102"/>
  </performer>
</Observation>
```

---

## Resumo / Summary

| Conceito / Concept | Ponto-chave / Key point |
|---|---|
| Recurso / Resource | Unidade atômica de dados de saúde no FHIR; independente e com propósito único |
| Cardinalidade | `0..*` opcional+repetível; `0..1` opcional; `1..1` obrigatório; `1..*` obrigatório+repetível |
| Tipos de dado / Data types | Primitivos (sem `{}`) vs complexos (com `{}`); verificar sempre antes de escrever |
| JSON | `resourceType` explícito; `[]` para repetível; `{}` para complexo; sem aspas para bool/int/decimal |
| XML | Valor em atributo `value`; hierarquia para complexos; repetir tag; ordem importa |
| Summary Set Σ | `_summary=true` retorna só elementos marcados com Σ |
| Modifier Property ! | Não pode ser ignorado; mudar interpretação do recurso inteiro; rejeitar se não entender |
| Invariant I/C | Regras adicionais além do esquema; validadas via Schematron/FHIRPath |
| `code` vs `Coding` vs `CodeableConcept` | `code`=primitivo; `Coding`=complexo c/ sistema; `CodeableConcept`=múltiplos codings + texto |
| Binding strength | required→sem código próprio; extensible→próprio só se sem match; preferred→próprio permitido; example→sugestão |
| Herança / Inheritance | Resource (id, meta, implicitRules, language) → DomainResource (+text, contained, extension, modifierExtension) → recursos clínicos |
| Extensão / Extension | Elemento de recurso para dados customizados; URL identifica; value[x] armazena o dado |
| Extensão complexa | Sub-extensões em vez de value[x]; uma só StructureDefinition |
| ModifierExtension | Extensão que pode inverter o significado; não pode ser ignorada; só em DomainResource ou BackboneElement |
| Referência literal | Usa ID do recurso (`Patient/27` ou URL absoluta) |
| Referência lógica | Usa identificador de negócio (MRN, SSN) via elemento `identifier` |
| Contained | Recurso inline para quando nem ID nem identificador de negócio estão disponíveis; não cria recurso separado |
