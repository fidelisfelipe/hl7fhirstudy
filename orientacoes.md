# Estratégia de Estudo para a Prova

## Módulo 1 – FHIR Principles

### O que é FHIR?

#### FHIR (Fast Healthcare Interoperability Resources) = padrão HL7 para interoperabilidade em saúde.
 - Recursos principais:
   - Resources: blocos de construção (Patient, Observation, Condition, Claim etc).
   - Exchange Specification: define como trocar (REST API, mensagens, documentos).
   - Domínios cobertos: clínico, financeiro, pesquisa, saúde pública.
   - Extensibilidade: perfis, extensões e guias de implementação.

#### Características-chave
   - Baseado em padrões web (JSON, XML, HTTP, OAuth).
   - Simples, legível, fácil de implementar.
   - APIs RESTful padronizadas.
   - Reutilização de recursos (80/20 rule).
   - Escalabilidade e compatibilidade entre versões normativas.

#### Use existing extensions for a use case
    - Conceitos principais:
      - FHIR Extensions → usadas quando os recursos básicos não cobrem a necessidade.
      - Reuse first → sempre verificar se já existe uma extensão oficial no FHIR Extension Registry.
      - StructureDefinition → onde extensões são formalmente definidas.
      - Best Practice → só criar extensão nova se não existir uma adequada.

👉 Estratégia:

- Memorizar as extensões oficiais mais comuns (ex.: patient-birthPlace, ethnicity, us-core-race).
- Treinar leitura da especificação para identificar quando é necessário usar uma extensão ou um recurso nativo.

Treinar com casos de uso reais: 
- Se descreve um evento clínico já ocorrido, use Observation ou Condition. 
- Se descreve um pedido futuro, use ServiceRequest ou MedicationRequest.

#### Use selected element based on a use case
    - Observation = medições e achados clínicos (pressão, frequência cardíaca, resultados de exame).
    - Condition = diagnósticos, doenças, problemas clínicos.
    - ServiceRequest = pedidos (exames, procedimentos, encaminhamentos).
    - DiagnosticReport = relatórios agregados com múltiplas observações.
    - AllergyIntolerance = alergias e intolerâncias.
    - Appointment = agendamento de consultas.
    - MedicationRequest vs. MedicationAdministration vs. MedicationDispense → prescrição, administração, dispensação.
👉 Estratégia:

- Criar um mapa mental de “Pedidos → Resultados → Condições → Documentos”.
- Treinar com casos de uso reais: se descreve um evento clínico já ocorrido, use Observation ou Condition. Se descreve um pedido futuro, use ServiceRequest ou MedicationRequest.

#### Use terminology for a use case
    - CodeSystem → define códigos (fonte de verdade)
    - ValueSet → seleção (subconjunto) de códigos para um caso de uso.
    - UCUM → unidade de medida padrão (ex.: “mg”, “mmHg”, “kg/m2”).
    - Binding → relaciona elementos de recursos a conjuntos de códigos.
    - Expansion → quando um ValueSet é resolvido para uma lista de códigos concretos.
    - SNOMED CT / LOINC → terminologias clínicas e laboratoriais mais usadas.

👉 Estratégia:

- Memorizar: CodeSystem = dicionário; ValueSet = lista de compras (sublista). 
- Revisar exemplos oficiais:
  - Observation.code → geralmente LOINC.
  - Condition.code → geralmente SNOMED CT.
  - MedicationRequest.medication → RxNorm (quando disponível).
- Treinar diferenciação entre usar CodeSystem ou ValueSet em bindings.

### Select resources based on use case
- Foco: identificar qual recurso FHIR usar em cada cenário.
- Exemplos típicos:
  - Observation → sinais vitais, medidas, resultados pontuais. 
  - Condition → diagnósticos/problemas.
  - ServiceRequest → pedidos de exames ou procedimentos.
  - DiagnosticReport → relatórios de laboratório/imagem agregados.
  - Claim vs ClaimResponse → financeiro (pedido vs resposta).

👉 Estratégia: treinar mapeamento Pedido → Resultado → Relatório → Financeiro.

#### Determine suitability of element based on use case
- Foco: usar o elemento correto dentro do recurso.
    - Ex.: Observation.status, Observation.category, Condition.severity, AllergyIntolerance.reaction.
- Diferenciar:
  - status = andamento (registrado, finalizado, cancelado).
  - code = conceito clínico (ex: LOINC para Observations, SNOMED para Conditions).
  - value[x] = valor do resultado (numérico, texto, código, Quantity com UCUM).

👉 Estratégia: revisar a estrutura de JSON de recursos principais no site oficial.

#### Determine existing extensions for a use case
- Foco: saber quando usar extensões oficiais.
- Passos:
  - Conferir se o recurso já tem elemento nativo.
  - Procurar extensão oficial no FHIR Registry.
  - Só criar extensão customizada se nada atender.
- Exemplo: race, birthPlace, motherMaidenName.

👉 Estratégia: memorizar extensões comuns do US Core e revisar como o StructureDefinition documenta extensões.

#### Determine terminology for a use case
- Foco: escolher a terminologia correta (CodeSystem, ValueSet, unidades).
- Conceitos:
  - CodeSystem = catálogo de códigos (SNOMED, LOINC, ICD, UCUM, RxNorm).
  - ValueSet = subconjunto selecionado para um caso de uso.
  - UCUM = unidade de medida (mg, mmHg, kg/m2).
- Exemplos práticos:
  - Observation.code → LOINC (exames laboratoriais).
  - Observation.valueQuantity.unit → UCUM.
  - Condition.code → SNOMED CT.

👉 Estratégia: montar tabelas comparativas (ex.: “Loinc → exames”, “SNOMED → diagnósticos”, “UCUM → unidades”).

---



- Foque em diferenciar:

  - Pedidos (ServiceRequest, MedicationRequest, Claim)
    - ServiceRequest: Solicitações de serviços, como consultas médicas ou exames.
    - MedicationRequest: Prescrições demedicamentos.
    - Claim: Reivindicações de seguro ou reembolso.
  - Resultados/Respostas (Observation, DiagnosticReport, ClaimResponse, Immunization)
    - Observation: Observações clínicas, como sinais vitais ou resultados de exames.
    - DiagnosticReport: Relatórios de diagnóstico, como resultados de exames laboratoriais.
    - ClaimResponse: Respostas a reivindicações de seguro, indicando se foram aprovadas ou rejeitadas.
    - Immunization: Registros de imunizações, como vacinas administradas.
  - Definições de metadados (StructureDefinition, CapabilityStatement)
    - StructureDefinition: Definições de estruturas de dados, como perfis de recursos.
    - CapabilityStatement: Declarações de capacidade, descrevendo as funcionalidades suportadas por um servidor FHIR.
  - Documentos e arquivos binários (DocumentReference, Binary, Composition)
    - DocumentReference: Referências a documentos clínicos, como relatórios médicos.
    - Binary: Representações binárias de dados, como imagens ou arquivos PDF.
    - Composition: Composições de documentos, agrupando vários recursos relacionados.

1- Construir Fundamentos (Módulo 1)
 - Revise os conceitos de FHIR Resources, Extensões, CapabilityStatement.
   - Recursos principais: Patient, Observation, Condition, ServiceRequest, DiagnosticReport, MedicationRequest, Immunization, Claim/ClaimResponse.
     - Resource: é uma unidade de informação que representa um aspecto específico da saúde.
       - Patient: informações sobre um paciente.
       - Observation: observações clínicas, como sinais vitais ou resultados de exames.
       - Condition: condições de saúde do paciente.
       - ServiceRequest: solicitações de serviços médicos, como consultas ou exames.
       - DiagnosticReport: relatórios de diagnóstico, como resultados de exames laboratoriais.
       - MedicationRequest: prescrições de medicamentos.
       - Immunization: registros de imunizações, como vacinas administradas.
       - Claim/ClaimResponse: reivindicações de seguro ou reembolso.
 - Foque em diferenciar definições/metadados (StructureDefinition, CapabilityStatement) de dados clínicos (Patient, Observation, Condition).
   - StructureDefinition: define extensões, perfis e tiposde recursos, ou seja, como os recursos devem ser estruturados e utilizados
   - CapabilityStatement: descreve as capacidades de um servidor FHIR, ou seja, o que um servidor FHIR pode fazer e quais recursos ele suporta

2- Treinar Identificação de Recursos (Módulo 2)
 - Sempre pergunte:
  - Isso é um pedido (→ ServiceRequest, MedicationRequest, Claim)?
  - Isso é um resultado/resposta (→ Observation, DiagnosticReport, ClaimResponse, Immunization)?
  - É uma definição/metadado (→ StructureDefinition, CapabilityStatement)?
  - É um documento/binário (→ DocumentReference + Binary)?

3- Memorizar casos típicos
 - Pedidos clínicos → ServiceRequest
 - Prescrição de medicamento → MedicationRequest
 - Evento de vacina → Immunization
 - Resultados laboratoriais → Observation (dado unitário), DiagnosticReport (relatório agregado)
 - Financeiro → Claim (pedido) e ClaimResponse (resposta)

4- Prática ativa
 - Refazer quizzes escrevendo a justificativa.
 - Criar exemplos simples em JSON (ex: Observation de frequência cardíaca).
 - Revisar a documentação oficial HL7 FHIR (R4) para cada recurso mais citado:
   - Patient
   - Observation
   - Condition
   - ServiceRequest
   - DiagnosticReport
   - MedicationRequest
   - Immunization
   - Claim / ClaimResponse

- Revisão final antes da prova
  - Monte um mapa mental: Pedidos → Resultados → Documentos → Financeiro → Definições.
  - Revise os exemplos práticos do Módulo 2 e tente identificar rápido o recurso correto apenas pela leitura do caso de uso.

