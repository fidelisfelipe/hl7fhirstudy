# Guia de Estudo — Módulo 1: Princípios FHIR
**Certificação HL7 FHIR Foundational · Material de Apoio PT-BR**

> **Peso no exame:** Módulo introdutório — baixo volume de questões diretas, mas fornece a fundação conceitual para todos os outros módulos. O instrutor alerta: *FMM, versionamento e compatibilidade são os pontos mais cobrados aqui.*

---

## 1. O que é FHIR e por que existe

**Analogia de entrada:** Pense no HL7 V2 como um idioma regional muito antigo — funciona bem dentro de um país, mas cada cidade (fornecedor) fala seu próprio dialeto. O FHIR é como o inglês técnico universal: todo sistema que "fala" FHIR consegue se conectar a qualquer outro, usando as mesmas palavras e a mesma gramática.

**Forma completa:** **F**ast **H**ealthcare **I**nteroperability **R**esources  
Criado pela **HL7 International** (não por fornecedores como Epic, Apple ou Google).

**O que o V2 não tinha que o FHIR resolveu:**
- Nenhum padrão web definido para troca (o V2 usava MLLP/TCP — cada fornecedor decidia)
- Nenhuma API padronizada — cada EMR criava a sua

**Exame:** a palavra "Fast" se refere à velocidade de *implementação* (bibliotecas, perfis técnicos), **não** à velocidade de transmissão de dados pela rede.

### As 2 partes do FHIR

```
┌────────────────────────────────────────────────────────┐
│                    F H I R                             │
│  ┌──────────────────────┐  ┌────────────────────────┐  │
│  │  Modelo de Conteúdo  │  │  Especif. de Troca     │  │
│  │  (Recursos)          │  │  (APIs)                │  │
│  │                      │  │                        │  │
│  │  Patient, Obs.,      │  │  REST, Mensagens,      │  │
│  │  Condition, ...      │  │  Documentos, Serviços  │  │
│  └──────────────────────┘  └────────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

**Por que isso importa?** O exame separa as opções em partes que não existem ("Interface Engine", "Communication Channel", "Interface Security"). Somente **Content Model** e **APIs** são as 2 partes oficiais.

---

## 2. Versões do FHIR

| Versão | Nome | Ano | Notas |
|--------|------|-----|-------|
| DSTU1 | Draft STU 1 | 2014 | Primeira publicação |
| DSTU2 | Draft STU 2 | 2015 | Segunda publicação |
| STU3 | Standard TU 3 | 2017 | Terceira |
| **R4** | Release 4 (v4.0.1) | **Dez 2018** | **Mais usada na prática** |
| R4B | v4.3.0 | Mai 2022 | Atualização parcial |
| **R5** | Release 5 | **Mar 2023** | **Versão mais recente** |

**Exame:** o exame é **agnóstico de versão** — não cobra qual recurso está em qual versão. Mas cobra que **R5 é a mais recente** e que **R4 é a mais usada** na produção.

---

## 3. Foco e princípios arquiteturais

### Para quem o FHIR foi feito?

O FHIR é uma **especificação de plataforma** voltada para **implementadores e organizações** que constroem sistemas de TI em saúde.

**O que o FHIR não define** (distrator frequente no exame):
- Boas práticas clínicas
- Fluxos de trabalho / UIs
- Qual medicamento o médico deve prescrever

**Mnemônico para os 5 princípios arquiteturais — "8REST L-H-D":**

| Letra | Princípio | O que significa |
|-------|-----------|-----------------|
| **8** | Regra 80/20 | 20% dos requisitos cobrem 80% dos casos; os 20% restantes usam extensões/perfis |
| **R** | REST para escalabilidade | APIs RESTful permitem sistemas escalonáveis e desacoplados |
| **E** | (already R) | — |
| **S** | — | — |
| **T** | — | — |
| **L** | Lean (recursos leves) | Recursos são enxutos e otimizados para troca em rede |
| **H** | Human-readable | Todo recurso tem narrativa legível por humanos |
| **D** | Data Fidelity | Dados não são perdidos ou alterados em trânsito |

> Versão simplificada: **80/20 · REST · Lean · Legível · Fidelidade**

**Exame:** "FHIR works 80/20 rule focusing on 20% of requirements" — todas as 5 afirmações dos princípios são corretas simultaneamente (questão do tipo "selecione todas que se aplicam").

### Características comuns a TODOS os recursos

Todo recurso FHIR tem exatamente estas 5 características:

1. **Metadados comuns** — `id`, `meta`, `text`
2. **URL canônica** — identifica o tipo de recurso
3. **Narrativa legível** — resumo em texto livre no elemento `text`
4. **Framework de extensibilidade** — mecanismo para adicionar dados não previstos
5. **Elementos específicos** — dados próprios do recurso (ex.: `Patient.name`, `Observation.value`)

---

## 4. Categorias de recursos FHIR

O FHIR organiza seus recursos em **4 categorias**:

| Categoria | Exemplos |
|-----------|----------|
| **Base Resources** | Patient, Practitioner, Organization, Location |
| **Clinical Resources** | Condition, Observation, MedicationRequest, Procedure |
| **Financial Resources** | Claim, ClaimResponse, Coverage, Account |
| **Specialized Resources** | ResearchStudy, MedicinalProduct, BiologicallyDerivedProduct |

**Armadilha do exame:** a opção "Logical Resources" **não existe** como categoria oficial. Se aparecer, é o distrator errado.

### Módulos FHIR e o papel do Foundation

O FHIR é organizado em módulos com dependências principais de cima para baixo. O módulo **Foundation** fornece:
- Infraestrutura de conformidade (StructureDefinition, CapabilityStatement)
- Suporte a terminologia (CodeSystem, ValueSet, ConceptMap)
- Segurança e proveniência

**O Foundation NÃO fornece conteúdo clínico.** Isso é papel do módulo Clinical. Essa é a afirmação falsa mais comum em questões de M1.

---

## 5. FMM — Modelo de Maturidade FHIR

Cada artefato FHIR (recurso, perfil, extensão) recebe um nível de maturidade que indica o quão estável e testado ele é.

| Nível | Nome | Critério principal |
|-------|------|--------------------|
| **0** | Draft | Publicado no build atual |
| **1** | FMM1 | Sem warnings; WG declara pronto para implementação |
| **2** | FMM2 | Testado com sucesso em **3+ sistemas independentes** (≥ 80% do escopo) |
| **3** | FMM3 | **Votação formal** + 10 comentários de implementadores de 3+ organizações |
| **4** | FMM4 | Publicado em release formal + múltiplos protótipos |
| **5** | FMM5 | **2 ciclos de publicação** + 5+ sistemas em produção em 1+ país |
| **N** | Normativo | Estável — garantias de compatibilidade aplicam-se |

**Armadilha crítica do exame:** A votação formal é no **FMM 3**, não no FMM 2. O FMM 2 exige apenas 3 sistemas independentes testando o artefato. Confundir FMM2 com FMM3 é o erro mais comum nesta seção.

**Mnemônico — "Draft → 3 sistemas → Votação → Publica → 2x publica → Normativo":**  
D · 3S · V · P · 2P · N

---

## 6. Licença e marca registrada

### O que você pode fazer

- **Redistribuir** o FHIR
- **Criar especificações derivadas** (ex.: US Core, IPS) e produtos baseados nelas
- Usar as marcas para referenciar o padrão em documentos/sites (com ® obrigatório)

### O que você NÃO pode fazer

- Afirmar que a HL7 **endossa** seu produto derivado
- Publicar uma versão **alterada** do FHIR sem identificá-la claramente como derivada
- Usar as marcas HL7/FHIR em **domínios de URL** sem permissão escrita
- Dizer que seu produto "é" FHIR quando é apenas baseado nele

### Regras de marca registrada (® obrigatório)

| Contexto | Regra |
|----------|-------|
| Logo FHIR FLAME | Sempre com ® |
| Texto "FHIR®" em documento | Incluir ® na primeira ocorrência |
| URL de domínio | Proibido sem permissão escrita da HL7 |
| Referência ao padrão em website | Incluir ® na primeira menção |

**Armadilha do exame:** "Specs derivadas não podem redefinir o que conformidade com FHIR significa" — VERDADEIRO para o padrão base. Mas specs derivadas **PODEM** definir o que conformidade significa *dentro do seu próprio escopo* (ex.: "conformidade com US Core"). A questão do exame sobre isso nega a possibilidade de uma spec derivada definir conformidade no contexto geral da HL7, e isso é correto.

---

## 7. Compatibilidade entre versões

### Regra fundamental

Garantias de **forward e backward compatibility** se aplicam **exclusivamente ao conteúdo Normativo**. Conteúdo Trial Use pode mudar de forma incompatível entre versões.

### O que PODE mudar em mudanças retrocompatíveis

- Novos elementos opcionais podem ser adicionados em qualquer posição
- Cardinalidades **máximas** podem ser aumentadas
- Bindings de `example` e `preferred` podem apontar para outros ValueSets
- Novos tipos de dados podem ser introduzidos
- Endpoints existentes não serão removidos nem renomeados

### O que NÃO PODE mudar (armadilha do exame)

- Cardinalidades **mínimas** — aumentar o mínimo quebraria implementações existentes
- Flags `Is-Modifier` e `Is-Summary` — não podem ser alteradas
- Binding de `required` e `extensible` — deve permanecer no mesmo nível

### Regras para receptores (implementadores)

Um sistema receptor bem implementado **deve**:
- Ignorar elementos inesperados (novos elementos não quebram o receptor)
- Ignorar referências a recursos não reconhecidos
- Ignorar critérios de busca desconhecidos
- Responder com erro HTTP adequado a URLs inesperadas

**Armadilha:** o receptor **NÃO deve ignorar** códigos não reconhecidos em **bindings obrigatórios** (`required`). Um código fora do ValueSet obrigatório é um erro de validação e deve ser tratado como tal.

### Como propor mudanças na especificação

| Canal | Para quê |
|-------|---------|
| **Jira** (link no rodapé de cada página) | Pedidos formais de mudança |
| **Confluence** | Documentação de processos e metodologia |
| **Stack Overflow** (tag: `hl7-fhir`) | Perguntas de programação |
| **Zulip FHIR chat** | Discussão ao vivo com a comunidade |
| **FHIR Community Forum** | Discussão ampla e informal |

**Exame:** "Como enviar comentários sobre a especificação?" — o caminho oficial é o link no **rodapé de cada página**, que abre um ticket Jira. Não é e-mail, não é Stack Overflow diretamente.

---

## Checkpoint Final — 10 Perguntas de Autoteste

Responda sem consultar o material. Depois compare com o gabarito.

---

**Q1.** Qual é a forma completa correta de FHIR?  
(A) Fast Health Interoperability Resources  
(B) Forward Health Interoperability Resources  
(C) Fast Healthcare Interoperability Resources  
(D) Fast Health Interoperability Reference  

**Q2.** Qual das seguintes afirmações sobre o foco primário do FHIR é correta?  
(A) Definir boas práticas clínicas para profissionais de saúde  
(B) Fornecer orientações sobre interfaces de usuário e fluxos de trabalho  
(C) Ser voltado a implementadores e organizações que desenvolvem sistemas de TI em saúde  
(D) Ser direcionado a especialistas do domínio clínico  

**Q3.** Quais são as 2 partes principais do FHIR?  
(A) Modelo de Conteúdo e Motor de Interface  
(B) Modelo de Conteúdo e APIs  
(C) Formato Padrão e Canal de Comunicação  
(D) APIs e Segurança de Interface  

**Q4.** Qual afirmação sobre o FHIR é FALSA?  
(A) Possui forte fundação em padrões web como XML, JSON, HTTP, OAuth  
(B) Suporta arquiteturas RESTful e outros mecanismos como mensagens e documentos  
(C) Inclui um formato de serialização legível por humanos  
(D) Possui suporte limitado a terminologia  

**Q5.** A votação formal (formal balloting) ocorre em qual nível do FMM?  
(A) FMM 1  
(B) FMM 2  
(C) FMM 3  
(D) FMM 4  

**Q6.** Qual das opções NÃO é uma categoria oficial de recursos FHIR?  
(A) Base Resources  
(B) Clinical Resources  
(C) Logical Resources  
(D) Financial Resources  

**Q7.** Sobre specs derivadas (como US Core), qual afirmação é CORRETA?  
(A) Podem redistribuir o FHIR livremente  
(B) Podem redefinir o que conformidade com o padrão base FHIR significa  
(C) Podem usar o logo FHIR FLAME sem incluir o símbolo ®  
(D) Podem usar "FHIR" no domínio da URL sem permissão da HL7  

**Q8.** As garantias de forward e backward compatibility aplicam-se a qual tipo de conteúdo?  
(A) Qualquer conteúdo publicado no site do FHIR  
(B) Apenas conteúdo com FMM ≥ 3  
(C) Apenas conteúdo Normativo  
(D) Todo conteúdo Trial Use e Normativo  

**Q9.** O que um receptor FHIR NÃO deve fazer segundo as diretrizes de compatibilidade?  
(A) Ignorar elementos inesperados  
(B) Ignorar referências a recursos não reconhecidos  
(C) Ignorar silenciosamente códigos não reconhecidos em bindings obrigatórios  
(D) Ignorar critérios de busca desconhecidos  

**Q10.** Qual é o caminho oficial para propor uma mudança na especificação FHIR?  
(A) Enviar e-mail para hl7.org  
(B) Publicar no Stack Overflow com a tag hl7-fhir  
(C) Usar o link no rodapé de cada página da especificação, que abre um ticket Jira  
(D) Entrar no Zulip FHIR chat e reportar ao moderador  

---

### Gabarito

| Q | Resp. | Conceito-chave |
|---|-------|----------------|
| 1 | **C** | Forma completa exata — "Healthcare", não "Health" |
| 2 | **C** | Foco: implementadores, não clínicos |
| 3 | **B** | Modelo de Conteúdo + APIs (somente 2 partes) |
| 4 | **D** | FHIR tem FORTE suporte a terminologia |
| 5 | **C** | FMM 3 = votação formal; FMM 2 = 3 sistemas independentes |
| 6 | **C** | "Logical Resources" não é categoria FHIR oficial |
| 7 | **A** | Pode redistribuir; NÃO pode redefinir conformidade base nem usar URL sem permissão |
| 8 | **C** | Compatibilidade garantida SOMENTE para conteúdo Normativo |
| 9 | **C** | Bindings obrigatórios com código desconhecido = erro de validação, não ignorar |
| 10 | **C** | Link no rodapé → Jira (caminho oficial) |

---

> **Próximo passo:** Execute os quizzes `module1_q1` e `module1_q2` no app. Marque no calendário para revisar este guia em **2 dias** (recência) e novamente em **1 semana** (intervalo de retenção). O app mostrará as questões com badge vermelho nas que você errar — use o botão "Revisar Fracos" para focar nelas.
