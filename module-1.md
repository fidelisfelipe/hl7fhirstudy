# Module 1 - FHIR Principles

## Why FHIR? / Por que FHIR?

- Novos desafios de interoperabilidade em saúde:
  - Acesso rápido e fácil aos dados médicos pelos pacientes (portais).
  - Aplicativos móveis precisando de dados do EMR/EHR.
  - Desenvolvimento de apps específicos para casos de saúde → precisa de padrões (XML, JSON, APIs, regras).
  - Suporte a genômica.
  - Padrão cobrindo todos os domínios da saúde.
  - Fornece meios de troca de dados: documentos, mensagens e APIs.

## What is FHIR? / O que é FHIR?

### FHIR = Fast Healthcare Interoperability Resources
- Um padrão HL7 para compartilhamento de informações clínicas.

- Partes principais:
  - Content Model (Recursos) → representam o conteúdo clínico.
  - Exchange Specification → define como trocar dados (REST API, mensagens, documentos, serviços).

- Tipos de dados que o FHIR cobre:
  - Clínico: alergias, procedimentos, problemas, diagnósticos, medicamentos, provisionamento de cuidado.
  - Financeiro: sinistros, faturamento, troca de dados com pagadores.
  - Saúde pública e pesquisa: relatórios, rotulagem de medicamentos.
  - Conformidade e terminologias.

### FHIR Releases (Versões FHIR)
- DSTU 1 – Draft Status for Trial Use.
- DSTU 2.
- STU 3 – Standard for Trial Use.
- R4 (v4.0.1, 2018) → primeira versão com conteúdo normativo, mais usada em projetos reais.
- R4B (v4.3.0, 2022).
- R5 (mais recente).

### Why FHIR is better? (Por que o FHIR é melhor?)

- Principais melhorias sobre padrões anteriores (HL7 v2, v3, CDA):
- Foco forte em implementação → rápido e fácil.
- Muitas bibliotecas e exemplos prontos.
- Interoperabilidade pronta para uso, mas adaptável.
- Baseado em padrões web (XML, JSON, HTTP, OAuth).
- Suporte a RESTful APIs e arquiteturas orientadas a serviços.
- Especificações concisas e legíveis.
- Formato de dados legível por humanos.
- Mercado de apps em saúde (ex.: SMART on FHIR).
- Implementações open-source → facilitam adoção e integração.

### FHIR Focus (Foco do FHIR)

- É uma especificação de plataforma para interoperabilidade em diferentes contextos e jurisdições.
- Facilita a troca de informações de saúde (clínicas e administrativas).
- Abrange medicina humana e veterinária, em vários contextos (hospital, cuidados domiciliares, saúde pública).
- Direcionado a indivíduos e organizações que desenvolvem software interoperável.
- Não define práticas clínicas → só fornece os meios técnicos para troca de dados.
- Foco primário em implementação prática, com base técnica sólida.

### FHIR Inbuilt Key Features (Principais Recursos Embutidos)
- Structure Definitions → descrevem os elementos do FHIR (recursos, tipos de dados, etc.).
- Search Parameters → parâmetros para buscar dados num servidor FHIR.
- Capability Statement → descreve as capacidades de um servidor FHIR (quais recursos e operações ele suporta).
- Healthcare Domain Model → conjunto de recursos bem definidos que representam o domínio da saúde (Paciente, Medicação, Alergia, etc.).
- Extensions → mecanismo nativo para estender recursos ou elementos.
- Profiles → restrições e especializações de recursos para atender requisitos específicos.
- REST API e Querying → define a assinatura das APIs REST (nomes de recursos, parâmetros de busca).

### Common API and Standard Format (API Comum e Formato Padrão)
- FHIR offers common API to exchange data / FHIR oferece uma API comum para troca de dados.
- Various systems can seamlessly get connected using same set of APIs / Vários sistemas podem se conectar facilmente usando o mesmo conjunto de APIs.
- Who provided these APIs / Quem forneceu essas APIs?
  - EMR vendor like EPIC, Cerner, AllScripts, etc.?
  - Or Apple, Google, Microsoft, etc.?
  - In fact, none of them. It is FHIR only

- FHIR defines standard REST APIs to exchange variety of healthcare data / O FHIR define APIs REST padrão para trocar uma variedade de dados de saúde.
  - What is common or standard about FHIR APIs? / O que é comum ou padrão nas APIs FHIR?
    - Signature and format / Assinatura e formato
    - To get specific healthcare data, every FHIR compliant system will use same API signature and outcome format will be same.
    - Para obter dados específicos de saúde, todo sistema compatível com FHIR usará a mesma assinatura de API e o formato de resultado será o mesmo.
  - Example: Get Patient demographic data based on patient’s first name and date of birth / Exemplo: Obter dados demográficos do paciente com base no primeiro nome e na data de nascimento do paciente

- Common API & Format
  - GET http://baseURL/Patient?given=aditya&birthdate=1986-01-01
  - The outcome of the API will be standard JSON/XML / O resultado da API será JSON/XML padrão.
    - {
        "resourceType": "Patient",
        "id": "12345",
        "name": [
          {
            "use": "official",
            "family": "Doe",
            "given": ["John", "A"]
          }
        ],
        "birthDate": "1986-01-01"
      }
- Common API : More details with Example
  - Currently, if one client application needs data from EMR1 and EMR2, they have to  understand each EMR respective REST API. This REST API might be using their own  query structure and format to exchange data.
  - Atualmente, se um aplicativo cliente precisar de dados do EMR1 e EMR2, ele terá que entender a respectiva API REST de cada EMR. Essa API REST pode estar usando sua própria estrutura de consulta e formato para trocar dados.
    - For example: EMR1 and EMR2 might be using below REST API and format to provide Patient demographic / Por exemplo: EMR1 e EMR2 podem estar usando a API REST abaixo e o formato para fornecer dados demográficos do paciente
      - EMR 1 REST API and format example to query for Patient demographics using MRN
        - https://myEMR1.com/data/PatientDemographic?MRN=1234
        - Here “MRN” is EMR1 defined search parameter for “PatientDemographic” API / Aqui “MRN” é o parâmetro de pesquisa definido pelo EMR1 para a API “PatientDemographic”.
        - Format might be EMR1 defined XML (elements defining data like <fname> for first name) / O formato pode ser XML definido pelo EMR1 (elementos definindo dados como <fname> para o primeiro nome).
      - EMR 2 REST API and format example to query for Patient demographics using MRN
        - https://myEMR2.com/data/PatientInfo?PatientID=1234
        - Here “PatientID” is EMR2 defined search parameter for “PatientInfo” API / Aqui “PatientID” é o parâmetro de pesquisa definido pelo EMR2 para a API “PatientInfo”.
        - Format might be EMR2 defined XML (elements defining data like <name_first> for first name) / O formato pode ser XML definido pelo EMR2 (elementos definindo dados como <name_first> para o primeiro nome).
        - Even format of the data could be something else like one EMR using XML and another JSON / Mesmo o formato dos dados pode ser algo diferente, como um EMR usando XML e outro JSON.
  - If using FHIR, then both EMR will have same query structure defined by FHIR to provide Patient demographic data / Se usar FHIR, ambos os EMR terão a mesma estrutura de consulta definida pelo FHIR para fornecer dados demográficos do paciente.
  - FHIR Defined REST API to get demographic data based on Patient unique id
       - http://myEMR1BaseURL.com/fhir/Patient?identifier=1234
       - “Patient” is the name of the resource / “Patient” é o nome do recurso
       - “identifier” is the standard search parameter for searching Patient resources using unique Patient id / “identifier” é o parâmetro de pesquisa padrão para pesquisar recursos de Paciente usando o id exclusivo do Paciente
       - Format for exchanging data is standard defined by FHIR (so first name must be <given>) / O formato para troca de dados é o padrão definido pelo FHIR (então o primeiro nome deve ser <given>).
       - FHIR also supports JSON format / O FHIR também suporta o formato JSON.
  - If both EMR1 and EMR2 uses FHIR API and format, then client application has to understand only FHIR standard. Instead of two different APIs and format, only one API and format knowledge
  - Se ambos EMR1 e EMR2 usarem a API e o formato FHIR, o aplicativo cliente só precisa entender o padrão FHIR. Em vez de duas APIs e formatos diferentes, apenas um conhecimento de API e formato.
  - For EMR, it has to define and Publish FHIR APIs, any application understands FHIR  can get data using those APIs post authentication     
  - Para o EMR, ele deve definir e publicar APIs FHIR, qualquer aplicativo que entenda FHIR pode obter dados usando essas APIs após a autenticação.

## USING FHIR IN HEALTHCARE APPLICATIONS / USANDO FHIR EM APLICAÇÕES DE SAÚDE

### FHIR Architecture Approaches / Abordagens de Arquitetura FHIR
- Message Broker
- Native FHIR Server with Existing Back End (Program to take care of FHIR query and conversion of native data to FHIR resources)
- Native FHIR Server with FHIR Back End (Program + FHIR Repository)

### FHIR Server

- FHIR server is essentially a software with below features. First four are mandatory, last one is optional. / O servidor FHIR é essencialmente um software com os seguintes recursos. Os quatro primeiros são obrigatórios, o último é opcional.
  - Ability to understand FHIR query from client applications. Also, validate the query as per FHIR standard. / Capacidade de entender a consulta FHIR de aplicativos clientes. Além disso, validar a consulta de acordo com o padrão FHIR.
  - Convert the FHIR query to business query (which is understood by your application backend). / Converter a consulta FHIR em consulta de negócios (que é entendida pelo backend do seu aplicativo).
  - Get the data desired in FHIR query from application backend and convert that to FHIR resources. Validate the resources. / Obter os dados desejados na consulta FHIR do backend do aplicativo e convertê-los em recursos FHIR. Validar os recursos.
  - Send the resources to Client requested for data. / Enviar os recursos para o cliente que solicitou os dados.
  - FHIR Repository – keeping Resources (in JSON/XML/Turtle) in separate store. / Repositório FHIR – mantendo Recursos (em JSON/XML/Turtle) em armazenamento separado.
    - Benefit would be to get the same data easily by querying the repository instead of repeating all 4 steps mentioned above. / Benefício seria obter os mesmos dados facilmente consultando o repositório em vez de repetir todas as 4 etapas mencionadas acima.
    - But difficult to manage as it has to be in sync with application backend. Like if patient is deceased, that would be updated in application backend, same must be updated in FHIR repository.
    - Mas difícil de gerenciar, pois deve estar sincronizado com o backend do aplicativo. Por exemplo, se o paciente faleceu, isso deve ser atualizado no backend do aplicativo, o mesmo deve ser atualizado no repositório FHIR.
  - Vendors and Providers are not mandated to REPLACE their existing software, but to FHIR-enable their existing software.
  - Os fornecedores e prestadores não são obrigados a SUBSTITUIR seu software existente, mas a habilitar o FHIR em seu software existente.
  - A FHIR Façade for your existing API
  - A FHIR Façade for your database

### FHIR Client
 - Client is simply any application requesting for data / Cliente é simplesmente qualquer aplicativo que solicita dados
   - Ability to request data in FHIR query format / Capacidade de solicitar dados no formato de consulta FHIR
   - Ability to validate & parse received FHIR resource (single or bundle resource) / Capacidade de solicitar dados no formato de consulta FHIR

### FHIR Tooling- Reference Implementations

 - Reference implementations to build FHIR client and server applications / Implementações de referência para construir aplicativos cliente e servidor FHIR
   - HAPI FHIR – Java based FHIR client and server implementation / HAPI FHIR – Implementação de cliente e servidor FHIR baseada em Java
   - Smile CDR – Enterprise grade FHIR server / Smile CDR – Servidor FHIR de nível empresarial
   - Microsoft Azure API for FHIR – Managed FHIR service on Azure / Microsoft Azure API para FHIR – Serviço FHIR gerenciado no Azure
   - Google Cloud Healthcare API – Managed FHIR service on Google Cloud / Google Cloud Healthcare API – Serviço FHIR gerenciado no Google Cloud
   - IBM Watson Health – Managed FHIR service on IBM Cloud / IBM Watson Health – Serviço FHIR gerenciado no IBM Cloud

### FHIR Tooling- Validator, Profiling, IG

  - The official FHIR validator – a Java jar file that can be used to validate resources. See Validation Tools for further information, or Using the FHIR Validator for parameter documentation
  - O validador FHIR oficial – um arquivo jar Java que pode ser usado para validar recursos. Veja Ferramentas de Validação para mais informações ou Usando o Validador FHIR para documentação de parâmetros.
  - Using reference implementations – if using them, they will provide their own validator methods like / Usando implementações de referência – se estiver usando-as, elas fornecerão seus próprios métodos de validação
  - HAPI FHIR validation methods – https://hapifhir.io/hapi- fhir/docs/validation/introduction.html
  - Profiling: Using Forge https://fire.ly/products/forge/ used to constraint FHIR resource and data type definitions / Usado para restringir definições de recursos FHIR e tipos de dados
  - IG publisher: The Implementation Guide Publishing Tool / Ferramenta de Publicação de Guia de Implementação
    - Used to create Implementation Guides (IGs) for FHIR / Usado para criar Guias de Implementação (IGs) para FHIR
    - IGs are used to define how FHIR resources should be used in a specific context or domain / Os IGs são usados para definir como os recursos FHIR devem ser usados em um contexto ou domínio específico
 ### Modules

  - In order to help implementers find their way around the specification and answer these questions, it is organized into a set of "modules". / Para ajudar os implementadores a se orientarem na especificação e responderem a essas perguntas, ela é organizada em um conjunto de "módulos".
  - Each module represents a different functional area of the specification and contains: / Cada módulo representa uma área funcional diferente da especificação e contém:
    - Scope and Index: A description of the content covered by the module, and an index of the important content / Escopo e Índice: Uma descrição do conteúdo coberto pelo módulo e um índice do conteúdo importante
    - Use Cases: Guidance for common uses of the module, and how to approach them. This is a key resource for implementers familiarizing themselves with the FHIR specification
    - Caso de Uso: Orientação para usos comuns do módulo e como abordá-los. Este é um recurso chave para implementadores que se familiarizam com a especificação FHIR
    - Security/Privacy: Information / Segurança/Privacidade: Informações sobre como o módulo lida com questões de segurança e privacidade
    - Roadmap: Where the content covered by the module is in terms of overall progress/ roteiro: Onde o conteúdo coberto pelo módulo está em termos de progresso geral
    - More Reading: http://hl7.org/fhir/r4/modules.html
    - Broadly, the modules are organized into 3 groups: / De forma ampla, os módulos são organizados em 3 grupos:
      1. Infrastructure (bottom rung and bottom row of boxes) / Infraestrutura (rung inferior e linha inferior de caixas)
      2. Content (middle rung, and top row of boxes) / Conteúdo (rung do meio e linha superior de caixas)
      3. Reasoning (top rung) / Raciocínio (rung superior)
    - Dependencies between the modules are mainly downwards, with some horizontal dependencies. / As dependências entre os módulos são principalmente para baixo, com algumas dependências horizontais.
    - Broadly, the FHIR specification is broken up into a set of modules: / De forma ampla, a especificação FHIR é dividida em um conjunto de módulos:
    - Foundation: The basic definitional infrastructure on which the rest of the specification is built / Fundação: A infraestrutura definicional básica na qual o restante da especificação é construída
    - Implementer Support: Services to help implementers make use of the specification / Suporte ao Implementador: Serviços para ajudar os implementadores a fazer uso da especificação
    - Security & Privacy: Documentation and services to create and maintain security, integrity and privacy / Segurança e Privacidade: Documentação e serviços para criar e manter segurança, integridade e privacidade
    - Conformance: How to test conformance to the specification and define implementation guides / Conformidade: Como testar a conformidade com a especificação e definir guias de implementação
    - Terminology: Use and support of terminologies and related artifacts / Terminologia: Uso e suporte de terminologias e artefatos relacionados
    - Linked Data: Defined methods of exchange for resources / Dados Vinculados: Métodos definidos de troca para recursos
    - Administration: Basic resources for tracking patients, practitioners, organizations, devices, substances, etc. / Administração: Recursos básicos para rastrear pacientes, profissionais, organizações, dispositivos, substâncias, etc.
    - Clinical: Core clinical content such as problems, allergies, and the care process (care plans, referrals) / Clínico: Conteúdo clínico central, como problemas, alergias e o processo de cuidado (planos de cuidado, encaminhamentos)
    - Medications: Medication management and immunization tracking / Medicamentos: Gerenciamento de medicamentos e rastreamento de imunizações
    - Diagnostics: Observations, Diagnostic reports and requests + related content / Diagnósticos: Observações, relatórios e solicitações de diagnóstico + conteúdo relacionado
    - Workflow: Managing the process of care, and technical artifacts to do with obligation management / Fluxo de Trabalho: Gerenciamento do processo de cuidado e artefatos técnicos relacionados à gestão de obrigações
    - Financial: Billing and Claiming support / Financeiro: Suporte a faturamento e reivindicações
    - Clinical Reasoning: Clinical Decision Support and Quality Measures / Raciocínio Clínico: Suporte à Decisão Clínica e Medidas de Qualidade

### Framework

  - The intended scope of FHIR is broad, covering human and veterinary, clinical care, public health, clinical trials, administration and financial aspects. The standard is intended for global use and in a wide variety of architectures and scenarios.
  - FHIR is based on "Resources" which are the common building blocks for all exchanges. Resources are an instance-level representation of some kind of healthcare entity. All resources have the following features in common:
  - FHIR é baseado em "Recursos", que são os blocos de construção comuns para todas as trocas. Os recursos são uma representação em nível de instância de algum tipo de entidade de saúde. Todos os recursos têm os seguintes recursos em comum:
    - A URL that identifies the resource / Uma URL que identifica o recurso
    - Common metadata / Metadados comuns
    - A human-readable XHTML summary / Um resumo XHTML legível por humanos
    - A set of defined data elements - a different set for each type of resource / Um conjunto de elementos de dados definidos - um conjunto diferente para cada tipo de recurso
    - An extensibility framework to support variation in healthcare / Uma estrutura de extensibilidade para suportar variações na saúde
  - Resource instances are represented as either XML, JSON or RDF and there are currently 145 different resource types defined in the FHIR specification.
  - Recursos são instâncias representadas como XML, JSON ou RDF e atualmente existem 145 tipos diferentes de recursos definidos na especificação FHIR.

### FHIR OVERVIEW - ARCHITECTS

 - At its core, FHIR contains two primary components:
   - Resources - a collection of information models that define the data elements, constraints and relationships for the “business objects” most relevant to healthcare. 
   - Recursos - uma coleção de modelos de informação que definem os elementos de dados, restrições e relacionamentos para os "objetos de negócios" mais relevantes para a saúde.
     From a model-driven architecture perspective, FHIR resources are notionally equivalent to a physical model implemented in XML or JSON. See the formal definition.
     Para um modelo de arquitetura orientado a modelos, os recursos FHIR são noção equivalente a um modelo físico implementado em XML ou JSON. Veja a definição formal.
   - APIs – a collection of well-defined interfaces for interoperating between two applications. / APIs - uma coleção de interfaces bem definidas para interoperar entre dois aplicativos.
     Although not required, the FHIR specification targets RESTful interfaces for API implementation. See details on FHIR RESTful interfaces.Common metadata. 
     Embora não seja obrigatório, a especificação FHIR visa interfaces RESTful para implementação de APIs. Veja detalhes sobre interfaces RESTful FHIR.
     
#### FHIR and Architectural Principles

- FHIR’s primary purpose is to address interoperability with well-structured, expressive data models and simple, efficient data exchange mechanisms.
- FHIR é um padrão aberto, moderno e flexível que visa resolver os desafios de interoperabilidade em saúde.
- In addition, FHIR aligns to the following architectural principles: / Além disso, o FHIR se alinha aos seguintes princípios arquitetônicos:
  - Reuse and Composability – FHIR resources are designed with the 80/20 rule in mind – focus on the 20% of requirements that satisfy 80% of the interoperability needs. 
    Reutilizavel e Componível – Os recursos FHIR são projetados com a regra 80/20 em mente – foco nos 20% dos requisitos que satisfazem 80% das necessidades de interoperabilidade.
    To this end, resources are designed to meet the general or common data requirements of many use cases to avoid the proliferation of numerous, overlapping and redundant resources.
    Para esse fim, os recursos são projetados para atender aos requisitos gerais ou comuns de dados de muitos casos de uso, a fim de evitar a proliferação de recursos numerosos, sobrepostos e redundantes.
    Extension and customizations exist (see FHIR Profiles) to allow common, somewhat generic resources to be adopted and adapted as needed for specific use case requirements. 
    In addition, FHIR resources are highly composable in that resources commonly refer to other resources. 
    Em adicional, os recursos FHIR são altamente componíveis, pois os recursos geralmente se referem a outros recursos.
    This further promotes reuse and allows for complex structures to be built from more atomic resources.
  - Scalability – Aligning FHIR APIs to the REST architectural style ensure that all transactions are stateless which reduces memory usage,
    eliminates the needs for “sticky” sessions within a server  farm and therefore supports horizontal scalability.
  - Escalabilidade – Alinhar as APIs FHIR ao estilo arquitetônico REST garante que todas as transações sejam sem estado, o que reduz o uso de memória
    e elimina a necessidade de sessões "pegajosas" dentro de um servidor, promovendo assim a escalabilidade horizontal.
    
#### FHIR and Architectural Principles

EN:
- Performance – FHIR resources are lean and suitable for exchange across the network. 
  Highly optimized formats are available, which has the potential to improve performance in complex transactions across multiple systems connected via a shared and finite network, though most implementers find the standard JSON / XML formats adequate.
- Usability – FHIR resources are understood by technical experts and non-technical people alike. Even if the details of XML or JSON syntax are not understood, non-technical people can view these in any browser or text reader and understand the contents within them.
- Data Fidelity – FHIR is strongly typed and has mechanisms built in for clinical terminology linkage and validation. In addition, XML and JSON documents can be validated syntactically as well as against a defined set of business rules. This promotes high data fidelity and goes a long way towards using FHIR to achieve semantic interoperability.
- Implementability – One of the driving forces for FHIR is the need to create a standard with high adoption across disparate developer communities. FHIR is easily understood and readily implemented using industry standards and common mark-up and data exchange technologies.

PT:
- Performance – Os recursos FHIR são leves e adequados para troca através da rede. 
  Formatos altamente otimizados estão disponíveis, o que tem o potencial de melhorar o desempenho em transações complexas entre vários sistemas conectados por uma rede compartilhada e finita, embora a maioria dos implementadores considere os formatos JSON/XML padrão adequados.
- Usabilidade – Os recursos FHIR são compreendidos por especialistas técnicos e não técnicos. Mesmo que os detalhes da sintaxe XML ou JSON não sejam compreendidos, pessoas não técnicas podem visualizá-los em qualquer navegador ou leitor de texto e entender o conteúdo dentro deles.
- Fidelidade dos Dados – O FHIR é fortemente tipado e possui mecanismos integrados para vinculação e validação de terminologia clínica. Além disso, documentos XML e JSON podem ser validados sintaticamente, bem como contra um conjunto definido de regras de negócios. Isso promove alta fidelidade dos dados e contribui significativamente para o uso do FHIR para alcançar interoperabilidade semântica.
- Implementabilidade – Uma das forças motrizes do FHIR é a necessidade de criar um padrão com alta adoção entre comunidades de desenvolvedores díspares. O FHIR é facilmente compreendido e prontamente implementado usando padrões da indústria e tecnologias comuns de marcação e troca de dados.

#### FHIR Decomposition

- Information Model – the components of FHIR related to the creation of FHIR resources / Modelo de Informação – os componentes do FHIR relacionados à criação de recursos FHIR
- Constraints – the components of FHIR addressing constraints and validity / Restrições – os componentes do FHIR que tratam de restrições e validade
- Terminology – the components of FHIR related to clinical terminologies and ontologies / Terminologia – os componentes do FHIR relacionados a terminologias clínicas e ontologias
- Usage – the component of FHIR addressing the use of FHIR in a run-time capacity / Uso – o componente do FHIR que trata do uso do FHIR em uma capacidade de tempo de execução

#### Organizing FHIR Resources

- http://hl7.org/fhir/r4/overview-arch.html
- The framework serves three primary purposes: / A estrutura serve a três propósitos principais:
- Organize resource for navigation and identification / Organizar recursos para navegação e identificação
- Classify resources into categories based on common sense groupings or patterns describing expected structures and/or behaviors amongst resources in the same category / Classificar recursos em categorias com base em agrupamentos comuns ou padrões que descrevem estruturas e/ou comportamentos esperados entre recursos na mesma categoria
- Disseminate resources across layers to stratify relative common-ness with the most common resources in the top layers / Disseminar recursos em camadas para estratificar a relativa comumidade, com os recursos mais comuns nas camadas superiores

#### FHIR LICENSE

- FHIR specification (specifically the set of materials included in the fhir-spec.zip file available from the Downloads page of this specification) is produced by HL7 under the terms of HL7® Governance and Operations Manual
- A Especificação FHIR (especificamente o conjunto de materiais incluídos no arquivo fhir-spec.zip disponível na página de Downloads desta especificação) é produzida pela HL7 sob os termos do Manual de Governança e Operações da HL7®.
  relating to Intellectual Property (Section 16), specifically its copyright, trademark and patent provisions.
  relacionando-se à Propriedade Intelectual (Seção 16), especificamente suas disposições de direitos autorais, marcas registradas e patentes.
- HL7 or FHIR does not provide license to third party applications referenced in the specification, like SNOMED, DICOM, LOINC, ICD, CPT etc. 
- HL7 ou FHIR não fornecem licença para aplicativos de terceiros referenciados na especificação, como SNOMED, DICOM, LOINC, ICD, CPT etc.
  The licensee alone is responsible for identifying and obtaining any necessary licenses or authorizations to utilize Third Party IP in connection with the specification or otherwise
  O licenciado é o único responsável por identificar e obter quaisquer licenças ou autorizações necessárias para utilizar a Propriedade Intelectual de Terceiros em conexão com a especificação ou de outra forma.
- More details- http://hl7.org/fhir/r4/license.html

- FHIR is © and ® HL7.  The right to maintain FHIR remains vested in HL7 / FHIR é © e ® HL7. O direito de manter o FHIR permanece investido na HL7.
- You can redistribute FHIR / Você pode redistribuir o FHIR
- You can create derivative specifications or implementation-related products and services / Você pode criar especificações derivadas ou produtos e serviços relacionados à implementação
- You can't claim that HL7 or any of its members endorses your derived [thing] because it uses content from this specification / Você não pode afirmar que a HL7 ou qualquer um de seus membros endossa seu [objeto] derivado porque usa conteúdo desta especificação
- Neither HL7 nor any of the contributors to this specification accept any liability for your use of FHIR / Nem a HL7 nem qualquer um dos colaboradores desta especificação aceitam qualquer responsabilidade pelo seu uso do FHIR
- You cannot publish an altered version of the FHIR specification unless it clearly identifies that it is a derivative specification, not FHIR itself / Você não pode publicar uma versão alterada da especificação FHIR a menos que identifique claramente que é uma especificação derivada, não o próprio FHIR
- Derivative Specifications cannot redefine what conformance to FHIR means / Especificações derivadas não podem redefinir o que significa conformidade com o FHIR
- HL7 is not responsible for either identifying patents for which a license may be required to implement FHIR® or for conducting inquiries into the legal validity or scope of those patents that are brought to its attention
- HL7 não é responsável por identificar patentes para as quais uma licença pode ser necessária para implementar o FHIR® ou por conduzir investigações sobre a validade legal ou o escopo dessas patentes que são trazidas à sua atenção.
- More details- http://hl7.org/fhir/license.html

#### VERSION MANAGEMENT

##### The Standards Development Process

- HL7 has five descriptive terms that describe the level of stability and implementation readiness associated with different aspects of the specification. They are as follows:
- HL7 tem cinco termos descritivos que descrevem o nível de estabilidade e prontidão para implementação associado a diferentes aspectos da especificação. Eles são os seguintes:
  - Draft / Rascunho
    - This portion of the specification is not considered to be complete enough or sufficiently reviewed to be safe for implementation. / Esta parte da especificação não é considerada completa o suficiente ou suficientemente revisada para ser segura para implementação.
    - Content published to notify what work is in progress and to for early feedback from implementer community / Conteúdo publicado para notificar sobre o trabalho em andamento e para obter feedback inicial da comunidade de implementadores.
    - Content can be modified by FHIR in newer version. / O conteúdo pode ser modificado pelo FHIR em uma versão mais recente.
  - Trial Use / Uso de Teste
      - This content has been well reviewed and is considered by the authors to be ready for use in production system. / Este conteúdo foi bem revisado e é considerado pelos autores como pronto para uso em sistema de produção.
      - It has been subjected to ballot and approved as an official standard. / Foi submetido a votação e aprovado como um padrão oficial.
      - Content implemented by only few implementers and yet to be used by many more in production instances to see any shortcomings / Conteúdo implementado por apenas alguns implementadores e ainda a ser usado por muitos mais em instâncias de produção para ver quaisquer deficiências.
      - Content can be modified by FHIR in newer version. / O conteúdo pode ser modificado pelo FHIR em uma versão mais recente.
  - Normative / Normativo
      - This content has been subject to review and production implementation in a wide variety of environments. / Este conteúdo foi submetido a revisão e implementação de produção em uma ampla variedade de ambientes.
      - The content is considered to be stable and has been 'locked', subjecting it to FHIR Inter-version Compatibility Rules. / O conteúdo é considerado estável e foi "bloqueado", sujeitando-o às Regras de Compatibilidade Inter-versão do FHIR.
      - While changes are possible, they are expected to be infrequent and are tightly constrained. / Embora mudanças sejam possíveis, espera-se que sejam infrequentes e estejam estritamente restritas.
      - Version compatibility between versions works only for Normative content. / A compatibilidade de versão entre versões funciona apenas para conteúdo normativo.
  - Version compatibility is applicable for the content which is Normative.
  - R4 FHIR specification hosts mixed content – some content/resources have become Normative and most of the part is still Trial Use or Draft.
  - R4 is the first version of FHIR publication with some content normative.

##### Mixed Normative Content
- Some Normative artifacts contain a few parts labeled as 'Trial Use' even though the artifact itself is labeled 'Normative': / Alguns artefatos normativos contêm algumas partes rotuladas como 'Uso de Teste', mesmo que o próprio artefato esteja rotulado como 'Normativo':
- Some normative resources contain elements labeled as 'trial-use’ / Alguns recursos normativos contêm elementos rotulados como 'uso de teste'.
  - Example- CapabilityStatement resource is Normative but “useContext”, “imports”, “custodian” and many more elements are trial-use/ Exemplo- O recurso CapabilityStatement é Normativo, mas "useContext", "imports", "custodian" e muitos mais elementos são de uso experimental.
- Some normative pages contain sections labeled as 'trial-use’ / Algumas páginas normativas contêm seções rotuladas como 'uso de teste'.
- There is no resource in R4 specification where resource is trail-use and contains Normative elements. Though it is possible in future editions / Não há recurso na especificação R4 onde o recurso seja de uso experimental e contenha elementos normativos. Embora seja possível em edições futuras.

##### FHIR Maturity Model (FMM)
All artifacts in FHIR specification are assigned a "Maturity Level. The level can be used by implementers to judge how advanced – and therefore stable – an artifact is. The following FMM levels are defined:
Todos os artefatos na especificação FHIR são atribuídos a um "Nível de Maturidade". O nível pode ser usado pelos implementadores para julgar quão avançado - e, portanto, estável - um artefato é. Os seguintes níveis FMM são definidos:
- 0 the resource or profile (artifact) has been published on the current build. This level is synonymous with Draft. / o recurso ou perfil (artefato) foi publicado na compilação atual. Este nível é sinônimo de Rascunho.
- 1 PLUS the artifact produces no warnings during the build process and the artifact substantially complete and ready for implementation / 1 MAIS o artefato não produz avisos durante o processo de compilação e o artefato está substancialmente completo e pronto para implementação
- 2 PLUS the artifact has been tested and successfully exchanged between at least three independently developed systems leveraging at least 80% of the core data elements / 2 MAIS o artefato foi testado e trocado com sucesso entre pelo menos três sistemas desenvolvidos de forma independente, aproveitando pelo menos 80% dos elementos de dados principais
- 3 PLUS the artifact has been verified by the work group as meeting the Trial Use Quality Guidelines and has been subject to a round of formal balloting / 3 MAIS o artefato foi verificado pelo grupo de trabalho como atendendo às Diretrizes de Qualidade de Uso de Teste e foi submetido a uma rodada de votação formal
- 4 PLUS the artifact has been tested across its scope (see below), published in a formal publication (e.g. a FHIR Release) / 4 MAIS o artefato foi testado em todo o seu escopo (veja abaixo), publicado em uma publicação formal (por exemplo, uma versão FHIR)
- 5 PLUS the artifact has been published in two formal publication release cycles at FMM1+ (i.e. Trial Use level) and has been implemented in at least 5 independent production systems in more than one country / 5 MAIS o artefato foi publicado em dois ciclos de publicação formal em FMM1+ (ou seja, nível de Uso de Teste) e foi implementado em pelo menos 5 sistemas de produção independentes em mais de um país
- 6 “Normative”: the artifact is now considered stable

##### FHIR Release Versioning

- Each FHIR version is identified by a string composed from 4 parts: publication.major.minor.revision / Cada versão FHIR é identificada por uma string composta por 4 partes: publicação.major.minor.revision
  - publication
    - Incremented when HL7 publishes FHIR as an updated specification, e.g. a Trial Use or Normative version of FHIR / Incrementado quando a HL7 publica o FHIR como uma especificação atualizada, por exemplo, uma versão de Uso de Teste ou Normativa do FHIR
  - major
    - Increments every time a breaking change is made / Incrementa toda vez que uma mudança significativa é feita
  - minor
    - Increments every time an official snapshot release is generated that contains one or more substantive changes / Incrementa toda vez que uma versão de snapshot oficial é gerada que contém uma ou mais mudanças substanciais
  - revision
    - The hash for the GIT version from which the specification was built, for tracing publication / tooling issues / A hash para a versão GIT da qual a especificação foi construída, para rastrear problemas de publicação / ferramentas
- The R4 publication is 4.0.1
- More reading on this topic- http://hl7.org/fhir/r4/versions.html#versions

##### Version Identification

The FHIR version is usually known implicitly, but can be specified/determined by one of three methods: / A versão FHIR geralmente é conhecida implicitamente, mas pode ser especificada/determinada por um dos três métodos:
1. The fhirVersion element in the applicable CapabilityStatement, StructureDefinition, or ImplementationGuide / O elemento fhirVersion no CapabilityStatement, StructureDefinition ou ImplementationGuide aplicável
2. The fhirVersion parameter on the MIME-type that applies to the resource / O parâmetro fhirVersion no tipo MIME que se aplica ao recurso
   - This specification defines the MIME-type parameter fhirVersion as a parameter to indicate which version of the FHIR release a resource is based on: Accept: application/fhir+json; fhirVersion=4.0
   - Esta especificação define o parâmetro MIME-type fhirVersion como um parâmetro para indicar qual versão da versão FHIR um recurso é baseado: Accept: application/fhir+json; fhirVersion=4.0
   - More on this- http://hl7.org/fhir/http.html#version-parameter
3. Specifying a version specific profile on the resource itself in Resource.meta
```json 
{
 "resourceType": "Observation",
 "id": "respiratory-rate",
 "meta": {
   "profile": [
     "http://hl7.org/fhir/StructureDefinition/vitalsigns"
   ]
}, 
```
- This StructureDefinition defines fhir version and states that it belongs to fhir R4 publication
```json
{
 "resourceType" : "StructureDefinition",
 "url" : "http://hl7.org/fhir/StructureDefinition/vitalsigns",
 "fhirVersion" : "4.0.1",
 ...all other elements of this profile...
}
```

##### Rules for Inter-version change

The following kinds of changes may be made to the specification: / Os seguintes tipos de mudanças podem ser feitas na especificação:
- Breaking changes are changes that mean that previously conformant applications are no longer conformant to the updated specification
- Mudanças significativas são mudanças que significam que aplicativos anteriormente conformantes não são mais conformantes com a especificação atualizada.
- Substantive changes are changes that introduce new functionality - changes to the specification that create new capabilities - but would not render unchanged existing applications non-conformant 
- Mudanças não substanciais são mudanças que do ponto de vista do usuário não alteram a funcionalidade ou o significado da especificação 
- Non-substantive changes should not cause changes in any conformant application. For example, section renumbering, correcting broken links, changing styles, fixing typos, and providing clarifications that do not change the meaning of the specification.
- Mudanças não substanciais não devem causar mudanças em qualquer aplicativo conformante. Por exemplo, renumeração de seções, correção de links quebrados, alteração de estilos, correção de erros de digitação e fornecimento de esclarecimentos que não alteram o significado da especificação.
- Draft or Trial Use content – can change – including Breaking Changes – from version to version, subject to the rules described by the Maturity Process. No version compatibility for this content.
- Conteúdo Rascunho ou Uso de Teste – pode mudar – incluindo Mudanças Significativas – de versão para versão, sujeito às regras descritas pelo Processo de Maturidade. Sem compatibilidade de versão para este conteúdo.
- Normative status content- forward and backward compatibility comes into play for Normative content.
- Conteúdo de status normativo - compatibilidade para frente e para trás entra em jogo para conteúdo normativo.

- Forward & Backward compatibility for Normative content
  - Forward compatibility means that content that is conformant in an old release will remain conformant with future versions. Once normative, FHIR's rules try to enforce forward compatibility. However, that doesn't guarantee that all old systems will interoperate with future systems.
  - Backward compatibility means that instances created against future versions of the specification will interoperate with older versions of the specification. This is not guaranteed by FHIR, though there are strategies systems can adhere to that will increase their chances of such interoperability.

- Specifically, when dealing with content from a system supporting an unknown normative version and wishing to maximize backwards compatibility, applications SHOULD:
  - Ignore elements that are unexpected (new elements will never be modifier elements)
  - Ignore references to resources that are not recognized
  - Ignore unrecognized codes in required and extensible bindings unless the element they appear on is a modifier (in which case, treat the element as an unrecognized modifier extension)
  - Ignore unrecognized search criteria – see Handling Search Errors for further information.
  - Respond to HTTP commands on unexpected URLs with an appropriate error code.

### Resumo

- O FHIR é um padrão aberto, moderno e flexível, com:
    - Recursos reutilizáveis como blocos de construção.
    - Uso de JSON/XML e REST APIs para troca de dados.
    - Suporte a todos os domínios de saúde (clínico, financeiro, pesquisa, público).
    - Versionamento bem definido (R4 é a base mais usada).
    - Extensibilidade via perfis e extensões.
    - Foco prático na implementação → simplicidade, interoperabilidade e adoção global.

