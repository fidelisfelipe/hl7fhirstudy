# Module 4 – FHIR Profiling & Implementation Guides

---

## Part 1 – FHIR Profiling

---

### O que é um Perfil / What is a Profile

**PT-BR**
Perfil (_profile_) é o processo de **restringir ou especializar** um recurso FHIR, um tipo de dados ou uma extensão para atender a um requisito específico de negócio ou de interoperabilidade. Perfil **não** significa criar um novo recurso: você toma a estrutura base já definida pelo FHIR e a restringe.

O FHIR é uma especificação de plataforma (_platform specification_) que oferece muita opcionalidade. Como nenhum campo do recurso Patient, por exemplo, é obrigatório, uma instância válida tecnicamente pode conter apenas `{ "resourceType": "Patient", "gender": "male" }` — válida, mas sem sentido prático. O objetivo do profiling é tornar as trocas **significativas e interoperáveis**.

**EN**
A profile is the mechanism for constraining or specialising a FHIR resource, data type, or extension to meet specific requirements. It does not create a new resource type; it narrows down the existing base structure.

**Propósito / Purpose**
- Tornar obrigatórios os campos necessários para um caso de uso.
- Restringir cardinalidade, bindings, tipos de dados e referências.
- Garantir que instâncias sejam validadas automaticamente por software (não por documentos Word/PDF).
- Possibilitar interoperabilidade real ao forçar consenso entre implementadores.

**Formato computável / Computable format**
A página HTML de um recurso é legível por humanos, mas não por software. O equivalente computável de cada estrutura de recurso é o recurso **StructureDefinition** (SD) — um JSON/XML que descreve todos os elementos com cardinalidade, tipos, flags e bindings de forma que um validador pode processar diretamente.

```json
// Exemplo mínimo: como uma instância de recurso referencia seu perfil
{
  "resourceType": "Patient",
  "meta": {
    "profile": [
      "https://minha-org.exemplo/fhir/StructureDefinition/MyPatientProfile"
    ]
  },
  "identifier": [{ "system": "http://hospital.example.org/mrn", "value": "12345" }],
  "name": [{ "family": "Silva", "given": ["João"] }],
  "gender": "male"
}
```

---

### StructureDefinition (SD)

Um **StructureDefinition** é ele mesmo um recurso FHIR e é a unidade técnica de um perfil.

- Para cada recurso FHIR (ex.: Patient, Observation) ou tipo de dados (ex.: HumanName, Identifier), o próprio FHIR publica o **perfil base** como um StructureDefinition em formato JSON/XML (o "master definition").
- Para criar seu próprio perfil, você parte desse perfil base e o restringe, gerando um novo SD com URL única.

#### Elementos principais do SD

| Elemento        | Tipo       | Descrição                                                                                 |
|-----------------|------------|-------------------------------------------------------------------------------------------|
| `url`           | uri (obrigatório) | Identificador canônico único do perfil — distingue um perfil de outro.             |
| `name`          | string     | Nome técnico (sem espaços), amigável para computador.                                     |
| `title`         | string     | Título legível por humanos.                                                               |
| `status`        | code       | `draft`, `active`, `retired`, `unknown`.                                                  |
| `version`       | string     | Versão de negócio do perfil (ex.: "1.0.0").                                               |
| `fhirVersion`   | code       | Versão FHIR base (ex.: `4.0.1` para R4). **Não** se escreve "R4".                        |
| `kind`          | code       | `resource`, `complex-type`, `primitive-type`, `logical`.                                  |
| `type`          | uri        | Qual recurso ou tipo de dados este SD define/restringe (ex.: `Patient`, `HumanName`).     |
| `abstract`      | boolean    | `true` apenas para tipos abstratos (Resource, DomainResource, Element, BackboneElement).  |
| `baseDefinition`| canonical  | URL do perfil base que está sendo restringido.                                            |
| `derivation`    | code       | `constraint` (você está restringindo o base) ou `specialization`.                         |
| `snapshot`      | Element    | Imagem **completa** de todos os elementos — usada pelo validador.                         |
| `differential`  | Element    | Apenas as **mudanças** em relação ao base — visão rápida do que foi modificado.           |
| `mapping`       | Element    | Mapeamentos para outros padrões: HL7 v2, v3/RIM, CDA.                                    |
| `description`   | markdown   | Descrição textual do propósito do perfil. **Sempre preencher.**                           |

```json
// Exemplo de metadados de um SD de perfil customizado de Patient
{
  "resourceType": "StructureDefinition",
  "url": "https://goodhealth.org/fhir/StructureDefinition/MyPatient",
  "version": "1.0",
  "name": "MyPatient",
  "title": "My Hospital Patient Profile",
  "status": "active",
  "description": "Perfil de Patient criado para o Hospital XYZ exigindo identifier e name.",
  "fhirVersion": "4.0.1",
  "kind": "resource",
  "abstract": false,
  "type": "Patient",
  "baseDefinition": "http://hl7.org/fhir/StructureDefinition/Patient",
  "derivation": "constraint",
  "differential": { ... },
  "snapshot": { ... }
}
```

**Atenção sobre `url`:** A URL não precisa ser um endereço real acessível na web — ela é apenas um identificador único. Mas deve seguir um padrão de namespace (ex.: `https://minha-org.org/fhir/StructureDefinition/NomeDoPerfil`). **Não** use `http://hl7.org/...` para perfis que você criou.

#### Differential vs Snapshot

| Aspecto           | Differential                                          | Snapshot                                                       |
|-------------------|-------------------------------------------------------|----------------------------------------------------------------|
| Conteúdo          | Apenas os elementos **modificados** vs. perfil base   | **Todos** os elementos (herdados + modificados)                |
| Uso               | Visualização rápida das mudanças; documentação        | Validação de instâncias de recursos; leitura completa do perfil |
| Onde encontrar    | Seção `differential` do SD                           | Seção `snapshot` do SD                                         |
| Ferramenta Forge  | Modo "Differential view" no Simplifier.net            | Modo "Snapshot view" no Simplifier.net                         |

> **Regra prática para o exame:** O validador usa o **snapshot**. O **differential** é uma conveniência para entender o que foi alterado.

---

### Restrições e Extensões

#### Cardinality constraints (Restrições de Cardinalidade)

A cardinalidade define quantas vezes um elemento pode/deve aparecer. Regra fundamental: **você só pode restringir, nunca expandir** em relação ao perfil base.

| Cardinalidade base | O que você pode fazer no perfil                                   |
|--------------------|-------------------------------------------------------------------|
| `0..1` (opcional)  | Manter `0..1`, tornar obrigatório `1..1`, ou proibir `0..0`       |
| `0..*` (opcional, repetível) | Tornar obrigatório (`1..*`), limitar repetições (`1..3`), proibir (`0..0`) |
| `1..1` (obrigatório, não repetível) | Manter `1..1` — **não pode** tornar opcional nem repetível |
| `1..*` (obrigatório, repetível) | Manter ou reduzir o máximo (`1..3`, `1..1`) — **não pode** tornar opcional |

**Exemplos aplicados ao recurso Patient:**

```
// Perfil base (FHIR):  Patient.identifier  0..*
// Meu perfil:          Patient.identifier  1..2   → obrigatório, no máximo 2

// Perfil base:         Patient.name        0..*
// Meu perfil:          Patient.name        1..*   → pelo menos um nome obrigatório

// Perfil base:         Patient.gender      0..1
// Meu perfil:          Patient.gender      1..1   → gênero obrigatório
```

#### Fixed values / Patterns (Valores Fixos / Padrões)

Use quando quiser forçar que um elemento tenha sempre um determinado valor.

- **`fixedX`** (`fixedCode`, `fixedString`, etc.): O valor deve ser **exatamente** igual ao especificado.
- **`patternX`**: O valor deve **conter** o padrão especificado (mais flexível que fixed).

```json
// Exemplo: forçar que o elemento 'deceased[x]' use apenas o tipo Boolean
// (em vez de deixar a escolha entre Boolean e dateTime)
{
  "path": "Patient.deceased[x]",
  "type": [{ "code": "boolean" }]
}

// Exemplo: fixar o sistema de código de uma telecomunicação
{
  "path": "Patient.telecom.system",
  "fixedCode": "phone"
}
```

#### Binding constraints (Restrições de Binding)

Controla o **value set** e a **força do binding** de um elemento codificado.

| Força (da mais fraca à mais forte) | Significado                                                                              |
|------------------------------------|------------------------------------------------------------------------------------------|
| `example`                          | Apenas sugestão; implementador pode usar qualquer code system.                           |
| `preferred`                        | Recomendado usar os códigos do value set; pode usar outros.                              |
| `extensible`                       | Use os códigos do value set se existirem; só crie códigos customizados se não houver.    |
| `required`                         | **Somente** os códigos do value set são permitidos.                                      |

**Regra de restrição:** Você pode **apertar** o binding (ex.: `extensible` → `required`), mas **não pode afrouxar** (ex.: `required` → `extensible`).

```json
// Mudar maritalStatus de 'extensible' para 'required'
{
  "path": "Patient.maritalStatus",
  "binding": {
    "strength": "required",
    "valueSet": "http://hl7.org/fhir/ValueSet/marital-status"
  }
}
```

---

### Slicing / Fatiamento

#### O que é slicing

**Slicing** é o mecanismo para **controlar o comportamento de elementos repetíveis**. Quando um elemento pode aparecer múltiplas vezes (ex.: `Patient.telecom` com cardinalidade `0..*`), o slicing permite que o perfil defina o que cada "fatia" (repetição) deve conter.

Cada fatia é, essencialmente, uma **definição completa de uma repetição** daquele elemento. Por exemplo, para `Patient.telecom` com até 3 repetições, podem ser definidas 3 fatias:
1. `homePhone` — obrigatória (1..1), com `system = "phone"` e `use = "home"`
2. `mobilePhone` — opcional (0..1), com `system = "phone"` e `use = "mobile"`
3. `workEmail` — opcional (0..1), com `system = "email"` e `use = "work"`

**Conceito fundamental:** Uma fatia **não é** um elemento diferente; ela é a **mesma repetição** do elemento original, apenas com propriedades fixadas para identificá-la.

#### Discriminador (discriminator)

O discriminador informa ao validador **qual(is) elemento(s)** deve(m) ser usados para distinguir entre as fatias.

```json
// Configuração de slicing no elemento Patient.telecom
{
  "path": "Patient.telecom",
  "slicing": {
    "discriminator": [
      { "type": "value", "path": "system" },
      { "type": "value", "path": "use" }
    ],
    "ordered": false,
    "rules": "closed"
  },
  "min": 1,
  "max": "3"
}
```

**Tipos de discriminador (type):**

| Tipo       | Significado                                                           |
|------------|-----------------------------------------------------------------------|
| `value`    | Distingue pelo **valor exato** do elemento indicado em `path`.        |
| `exists`   | Distingue pela **presença ou ausência** do elemento.                  |
| `pattern`  | Distingue por um padrão no valor.                                     |
| `type`     | Distingue pelo **tipo de dados** do elemento (quando há choice `[x]`).|
| `profile`  | Distingue por conformidade a um perfil específico.                    |

#### Regras de slicing: open vs closed

O campo `rules` define se repetições **não cobertas por nenhuma fatia definida** são permitidas.

| `rules`      | Significado                                                                                     | Uso típico                                     |
|--------------|-------------------------------------------------------------------------------------------------|------------------------------------------------|
| `closed`     | Apenas as repetições para as quais há uma definição de fatia são permitidas.                   | Controle estrito; nenhuma repetição extra.     |
| `open`       | Repetições adicionais (sem definição de fatia) são permitidas **em qualquer posição**.          | Flexibilidade; permite conteúdo extra.         |
| `openAtEnd`  | Repetições adicionais são permitidas, mas apenas **após** todas as fatias definidas.            | Sequência das fatias deve ser mantida no início.|

**Regra importante:** Com `rules: closed`, a cardinalidade máxima do elemento pai torna-se irrelevante para permitir extras — apenas as repetições definidas nas fatias são válidas.

**Casos de uso para o exame:**

| Cenário                                                                         | `rules`      |
|---------------------------------------------------------------------------------|--------------|
| Telecom: home phone obrigatório, mobile e work email opcionais, nada mais       | `closed`     |
| Categoria da Observation: um slice "vital-signs" obrigatório, outras permitidas | `open`       |
| Fatias definidas devem aparecer primeiro, extras no final                       | `openAtEnd`  |

**Quando usar `rules: closed`?**
- Quando você quer **proibir** qualquer repetição não explicitamente definida.
- Exemplo: em um perfil de Patient, `telecom` com `closed` garante que apenas phone-home, phone-mobile e email-work sejam aceitos. Qualquer outro tipo (phone-old, fax-work, etc.) tornará a instância inválida.

**Quando usar `rules: open`?**
- Quando você quer **garantir** que certas repetições existam, mas **não impede** repetições adicionais.
- Exemplo: US Core Observation exige uma slice de categoria "vital-signs", mas permite outras categorias também.

#### Exemplos de slicing

**Exemplo 1: Slicing de telecom com `rules: closed`**

```json
// Elemento base com setup de slicing
{
  "path": "Patient.telecom",
  "slicing": {
    "discriminator": [
      { "type": "value", "path": "system" },
      { "type": "value", "path": "use" }
    ],
    "ordered": false,
    "rules": "closed"
  },
  "min": 1,
  "max": "3"
},

// Fatia 1: homePhone (obrigatória)
{
  "path": "Patient.telecom",
  "sliceName": "homePhone",
  "min": 1,
  "max": "1"
},
{
  "path": "Patient.telecom.system",
  "fixedCode": "phone",
  "min": 1
},
{
  "path": "Patient.telecom.use",
  "fixedCode": "home",
  "min": 1
},
{
  "path": "Patient.telecom.value",
  "min": 1
},

// Fatia 2: mobilePhone (opcional)
{
  "path": "Patient.telecom",
  "sliceName": "mobilePhone",
  "min": 0,
  "max": "1"
},
{
  "path": "Patient.telecom.system",
  "fixedCode": "phone",
  "min": 1
},
{
  "path": "Patient.telecom.use",
  "fixedCode": "mobile",
  "min": 1
},

// Fatia 3: workEmail (opcional)
{
  "path": "Patient.telecom",
  "sliceName": "workEmail",
  "min": 0,
  "max": "1"
},
{
  "path": "Patient.telecom.system",
  "fixedCode": "email",
  "min": 1
},
{
  "path": "Patient.telecom.use",
  "fixedCode": "work",
  "min": 1
}
```

**Regra de soma das cardinalidades (importante para o exame):**
> A soma das cardinalidades máximas de todas as fatias **não pode exceder** a cardinalidade máxima do elemento pai.
> Exemplo: `telecom max = 3`. Se houver três fatias com `max = 1` cada, o total é 3. Se uma fatia tiver `max = 2`, o total seria 4 — inválido (perfil ambíguo/incoerente).

**Exemplo 2: Slicing de Observation.category com `rules: open`**

```json
// Configuração: uma fatia obrigatória de "vital-signs"; outras categorias permitidas
{
  "path": "Observation.category",
  "slicing": {
    "discriminator": [{ "type": "value", "path": "coding.code" }],
    "rules": "open"
  },
  "min": 1
},
{
  "path": "Observation.category",
  "sliceName": "VSCat",
  "min": 1,
  "max": "1"
},
{
  "path": "Observation.category.coding.system",
  "fixedUri": "http://terminology.hl7.org/CodeSystem/observation-category"
},
{
  "path": "Observation.category.coding.code",
  "fixedCode": "vital-signs"
}
```

---

### Profile Tool (Forge / FSH)

Para criar perfis sem editar JSON manualmente, existem ferramentas:

**Forge (fire.ly)**
- Software desktop (Windows/Mac/Linux) para criar StructureDefinitions visualmente.
- Apresenta a estrutura do recurso em formato de árvore editável (semelhante à página HTML do FHIR, mas modificável).
- Funciona com arquivos locais: cria-se uma pasta de projeto, todos os SDs são salvos como JSON.
- Diferencial e snapshot são gerados automaticamente pela ferramenta.
- Como usar:
  1. `File > New Profile > Resource Profile` → seleciona o recurso base (ex.: Patient).
  2. Define URL canônica, nome, status, descrição.
  3. Edita cardinalidades, bindings, tipos e slices diretamente na árvore.
  4. Para slicing: seleciona o elemento repetível → clica em "Slice" → define discriminadores → adiciona cada fatia clicando em "Add Slice".
  5. Salva como JSON ou XML → resultado é o StructureDefinition.

**Simplifier.net**
- Plataforma web para hospedar, visualizar e compartilhar perfis.
- Converte automaticamente o SD JSON/XML em visualização tabular (snapshot, differential, hybrid).
- Permite compartilhar o perfil com a equipe em formato legível por humanos sem precisar ler o JSON.
- Integra-se com projetos Forge.

**FSH (FHIR Shorthand)**
- Linguagem de texto concisa para definir perfis, extensions e IGs.
- Compilada pela ferramenta SUSHI para gerar StructureDefinitions em JSON.
- Muito usada em projetos de IG modernos.

---

### Flags: Must Support (S), Modifier (?!), Summary (Σ), Invariant (I)

Flags são indicadores visuais na especificação FHIR que qualificam o comportamento de um elemento. No StructureDefinition, são propriedades booleanas que o software pode ler.

| Flag            | Símbolo | Propriedade no SD       | Significado                                                                                                                              |
|-----------------|---------|-------------------------|------------------------------------------------------------------------------------------------------------------------------------------|
| **Must Support** | `S`    | (definido no IG, não no base FHIR) | Remetente e receptor têm obrigações específicas com este elemento (definidas pelo IG ou pelas aplicações). **Não é sinônimo de obrigatório.** |
| **Modifier**    | `?!`   | `isModifier: true`      | O valor deste elemento **muda o significado** do recurso inteiro ou do elemento pai. Se presente, o receptor **deve** entendê-lo ou rejeitar o recurso. |
| **Summary**     | `Σ`    | `isSummary: true`       | Este elemento faz parte do "Summary Set" — incluído quando a busca usa `_summary=true`.                                                   |
| **Invariant**   | `I`    | `constraint`            | Regra adicional (definida como expressão FHIRPath) que deve ser satisfeita. Usada para validações complexas que vão além de cardinalidade. |

#### Must Support em detalhes

- **Não existe** no recurso base FHIR — só aparece em IGs e perfis.
- O FHIR nunca define o que exatamente "must support" significa para uma aplicação específica.
- Cada IG (ou par de aplicações) deve definir sua própria semântica de must support.
- Definição mais comum (ex.: US Core):
  - **Remetente:** Se os dados estiverem disponíveis no back-end, **deve** populá-los na instância.
  - **Receptor:** Se o elemento estiver presente na instância, **deve** ser capaz de armazenar/processar/exibir.
- **Must support ≠ obrigatório:** Um elemento `0..1` (opcional) pode ser must support — significa que se os dados existirem, devem ser enviados; mas a instância não é inválida se o elemento estiver ausente.

#### Modifier em detalhes

- Exemplos: `Patient.active`, `MedicationRequest.doNotPerform`, `Condition.verificationStatus`.
- Se uma aplicação não entende um modifier element desconhecido, **deve rejeitar** o recurso (não pode simplesmente ignorar).
- Diferença de extensões comuns: uma extensão modificadora (`modifierExtension`) também deve ser entendida ou rejeitada.

```
// Na página HTML do FHIR, visualiza-se assim:
Patient.active     0..1    boolean    S Σ    Whether this patient's record is in active use
//                                    ↑ ↑
//                              MustSupport  Summary
```

---

## Part 2 – Implementation Guides (IG)

---

### O que é um IG / What is an IG

**PT-BR**
Um Implementation Guide (Guia de Implementação) é uma **publicação que reúne, em um único lugar, todos os perfis, extensões, value sets, code systems, parâmetros de busca, operações e orientações de API** necessários para suportar um caso de uso específico de troca de dados em saúde.

O IG não é código Java/.NET, não é um servidor FHIR — é uma **especificação** (como o próprio FHIR), porém mais estreita, voltada para um domínio ou jurisdição específica.

**EN**
An Implementation Guide (IG) is a publication that packages together all profiles, extensions, terminologies, capability statements, and API constraints needed to support a specific healthcare data exchange use case. It is a specification, not executable code.

**Por que os IGs são necessários?**
- O FHIR base é genérico demais: todos os campos são opcionais.
- Sem um perfil comum, cada sistema cria seu próprio perfil → proliferação → interoperabilidade prejudicada.
- O IG representa o **consenso** de múltiplas partes interessadas (governo, hospitais, pagadores, fornecedores de software) sobre como usar o FHIR para um determinado contexto.

---

### Estrutura de um IG

Um IG publicado pelas ferramentas HL7 possui estrutura padrão:

```
IG
├── Home / Introdução          → Caso de uso, escopo, público-alvo, versão FHIR
├── Conformance / Orientações  → Como ler o IG, must support, segurança (OAuth 2.0, SMART)
├── FHIR Artifacts
│   ├── Profiles & Extensions  → Lista de perfis (StructureDefinitions)
│   ├── Terminology            → ValueSets, CodeSystems (binding de terminologias)
│   ├── Search Parameters      → Parâmetros customizados ou restrições dos padrões
│   └── CapabilityStatement    → Quais recursos e operações um servidor/cliente deve suportar
├── Examples                   → Instâncias de recursos em JSON/XML
└── Downloads                  → Pacote completo do IG, planilha Excel, etc.
```

**Ferramentas HL7 para publicar IGs:**
- **IG Publisher** (`hl7.org/fhir/ig-publisher`): ferramenta de linha de comando open-source que transforma os artefatos (SDs, value sets, etc.) em um site HTML completo.
- **SUSHI** + **FSH**: os perfis são escritos em FHIR Shorthand e compilados para JSON antes da publicação.
- O resultado visual é sempre similar ao US Core ou IPS — porque a ferramenta é a mesma.

---

### Principais IGs disponíveis

#### US Core

- **Publicado por:** HL7 International / Projeto Argonaut
- **Base de dados:** US Core Data for Interoperability (USCDI) — conjunto de dados definido pelo governo dos EUA (ONC).
- **Foco:** Troca de informações clínicas e demográficas de pacientes nos EUA.
- **FHIR version:** R4 (versão mais atual é 6.x)
- **Perfis principais:** US Core Patient, US Core Observation (Lab Results, Vital Signs, Blood Pressure, Body Height, etc.), US Core Condition, US Core AllergyIntolerance, US Core DiagnosticReport, US Core Immunization, US Core MedicationRequest, US Core Procedure, US Core CarePlan, US Core CareTeam, US Core Practitioner, US Core Organization.
- **Restrição mínima:** US Core define restrições mínimas — só identifier, name e gender são obrigatórios no Patient. Outros dados são must support (se disponíveis, devem ser enviados).
- **Extensões criadas:** race, ethnicity, tribal affiliation, sex (não presentes no Patient base FHIR).
- **Terminologia forçada:** LOINC para resultados de laboratório e sinais vitais (binding extensível → use LOINC se existir código equivalente).
- **URL do IG:** `http://hl7.org/fhir/us/core`

#### International Patient Summary (IPS)

- **Publicado por:** HL7 International + CEN (Europa)
- **Foco:** Resumo mínimo de saúde do paciente para troca internacional (emergências, viagens, continuidade de cuidado).
- **Recursos-chave:** Composition (documento FHIR), Patient, AllergyIntolerance, Condition, Medication, MedicationStatement, Immunization, Observation (Vital Signs, Results).
- **Diferencial:** Usa terminologias internacionais (SNOMED CT GPS — Global Patient Set, para diagnósticos; LOINC, para observações; EDQM, para formas de dosagem).
- **URL do IG:** `http://hl7.org/fhir/uv/ips`

#### CARIN for Blue Button (C4BB)

- **Publicado por:** CARIN Alliance / HL7
- **Foco:** Troca de dados financeiros/de sinistros de saúde (EOB — Explanation of Benefits) para pacientes dos EUA.
- **Base de dados:** CPCDS (Common Payer Consumer Data Set) — definido pelo governo dos EUA.
- **Recursos-chave:** ExplanationOfBenefit (perfil central), Coverage, Patient, Practitioner, Organization.
- **Uso:** Quando pacientes precisam acessar seus dados de sinistros e pagamentos via FHIR (ex.: aplicativos de saúde pessoal).
- **URL do IG:** `http://hl7.org/fhir/us/carin-bb`

#### DaVinci (PDex, CDex)

Programa acelerador da HL7 focado em casos de uso de pagadores e integrações clínico-financeiras nos EUA.

- **PDex (Payer Data Exchange):** Troca de dados entre planos de saúde e provedores/pacientes. Provedor de dados: o plano de saúde anterior. Consumidor: paciente (via aplicativo) ou novo plano.
- **CDex (Clinical Data Exchange):** Solicitações de dados clínicos entre provedores e pagadores (ex.: autorização prévia, auditorias de sinistros).
- **Outros projetos DaVinci:** PAS (Prior Authorization Support), DTR (Documentation Templates and Rules), HREX (Health Record Exchange).

#### Argonaut

- **Publicado por:** Projeto Argonaut (consórcio de empresas privadas: Epic, Cerner, Apple, Google, etc.)
- **Foco:** Acesso de pacientes e médicos a dados de saúde via SMART on FHIR e APIs padronizadas.
- **Contribuição principal:** Deu origem ao US Core IG (Data Query IG do Argonaut → tornou-se US Core).
- **IGs do Argonaut:**
  - Data Query (US Core)
  - SMART Application Launch Framework
  - Provider Directory
  - Scheduling
  - Clinical Notes
  - Questionnaire

---

### Como selecionar o IG correto para um caso de uso

O processo de seleção parte do **caso de uso de negócio**, não da tecnologia. Perguntas-chave:

1. **Qual é a jurisdição?** EUA → US Core; Internacional → IPS; Brasil → RNDS/ABDHM.
2. **Qual é o domínio de dados?** Dados clínicos → US Core; Sinistros/financeiro → C4BB ou DaVinci PDex; Resumo do paciente → IPS.
3. **Quem são os atores?** Paciente acessando dados próprios → Argonaut/SMART; Pagador ↔ Provedor → DaVinci; Troca cross-border → IPS.
4. **Já existe um IG que cobre o caso?** Se sim, **não crie perfis do zero** — use o IG existente como base. Você pode criar um perfil **derivado** (derivation = constraint) de um perfil de IG.

**Tabela de referência rápida:**

| Caso de Uso                                    | IG Indicado            |
|------------------------------------------------|------------------------|
| Acesso de paciente a dados clínicos (EUA)      | US Core + SMART        |
| Resumo de saúde para viagens internacionais    | IPS                    |
| Troca de sinistros/EOB (EUA)                   | CARIN for Blue Button  |
| Troca de dados entre planos de saúde (EUA)     | DaVinci PDex           |
| Solicitação de dados clínicos por pagador      | DaVinci CDex           |
| Autorização prévia (EUA)                       | DaVinci PAS            |
| Diretório de provedores (EUA)                  | Argonaut Provider Dir  |
| Dados de saúde da população (EUA)              | MeasureReport / DEQM   |
| Troca de dados no Brasil (RNDS)                | ABDHM FHIR BR          |

**Processo de derivação de IGs:**
Quando há um IG nacional (ex.: US Core) e você precisa de um perfil mais específico para sua organização:
1. Use o perfil do IG como `baseDefinition`.
2. Restrinja ainda mais (nunca afrouxe).
3. Seu perfil organizacional herda todas as constraints do IG nacional.

---

## Resumo / Summary

### Part 1 – FHIR Profiling

| Conceito            | Definição rápida                                                                                      |
|---------------------|-------------------------------------------------------------------------------------------------------|
| Perfil              | StructureDefinition que restringe um recurso/tipo de dados base para atender requisitos específicos.   |
| SD                  | Recurso FHIR que define a estrutura de recursos, tipos de dados ou extensões em formato computável.    |
| Snapshot            | Visão completa de todos os elementos — usada pelo validador.                                           |
| Differential        | Apenas as mudanças em relação ao base — visão resumida para humanos.                                   |
| Slicing             | Mecanismo para controlar repetições de elementos; cada fatia define uma repetição específica.          |
| Discriminador       | Elemento(s) usados para distinguir fatias entre si.                                                    |
| rules: closed       | Apenas repetições com fatia definida são permitidas.                                                   |
| rules: open         | Repetições adicionais sem fatia definida são permitidas em qualquer posição.                           |
| rules: openAtEnd    | Repetições adicionais permitidas, mas apenas após as fatias definidas.                                 |
| Must Support (S)    | Obrigação de suporte definida pelo IG — não é sinônimo de obrigatório.                                |
| Modifier (?!)       | Elemento cujo valor muda o significado do recurso; receptor deve entender ou rejeitar.                 |
| Summary (Σ)         | Elemento incluído em buscas com `_summary=true`.                                                       |
| Fixed value         | Valor constante imposto a um elemento; qualquer valor diferente torna a instância inválida.            |

### Part 2 – Implementation Guides

| Conceito        | Definição rápida                                                                                         |
|-----------------|----------------------------------------------------------------------------------------------------------|
| IG              | Publicação que consolida perfis, terminologias e restrições de API para um caso de uso específico.       |
| US Core         | IG mais importante nos EUA; baseado no USCDI; restrições mínimas para dados clínicos do paciente.        |
| IPS             | Resumo mínimo de saúde para troca internacional.                                                         |
| C4BB            | IGs para dados financeiros/sinistros nos EUA.                                                            |
| DaVinci         | Família de IGs para integração pagador-provedor nos EUA.                                                 |
| Argonaut        | Projeto que originou o US Core; foco em acesso de pacientes via SMART on FHIR.                           |
| Must Support     | Definido pelo IG; remetente deve enviar se dados disponíveis; receptor deve processar se presente.        |
| USCDI           | Conjunto de dados clínicos do governo EUA — base para o US Core IG.                                     |
| IG Publisher    | Ferramenta open-source HL7 para gerar o site HTML do IG a partir dos artefatos FHIR.                    |
| Argonaut / AccP | Programas aceleradores da HL7 onde múltiplas partes interessadas desenvolvem IGs colaborativamente.      |

---

> **Dicas para o exame de certificação HL7 FHIR:**
> 1. Todo perfil é um StructureDefinition — reconheça o recurso pelo `"resourceType": "StructureDefinition"`.
> 2. A URL no SD é o identificador único do perfil — nunca a URL do HL7 para seus próprios perfis.
> 3. Must Support nunca é definido no recurso base FHIR; só aparece em IGs.
> 4. Slicing `rules: closed` proíbe qualquer repetição sem fatia definida, independentemente da cardinalidade máxima do elemento pai.
> 5. Binding só pode ser apertado (example→preferred→extensible→required), nunca afrouxado.
> 6. Cardinalidade só pode ser restringida: elemento opcional pode virar obrigatório; repetível pode ter o máximo reduzido.
> 7. O snapshot é usado pelo validador; o differential é para humanos/ferramentas compararem mudanças.
> 8. US Core é baseado no USCDI (definido pelo governo); C4BB é baseado no CPCDS (dados de pares/sinistros).
> 9. Um IG não é código executável — é uma especificação que orienta implementadores.
> 10. Saiba o propósito de cada recurso de conformidade: StructureDefinition (perfil), CapabilityStatement (o que o servidor suporta), OperationDefinition, SearchParameter, MessageDefinition, ImplementationGuide.
