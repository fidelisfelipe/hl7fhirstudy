# Guia de Estudo — Módulo 4: Conformidade e Perfis FHIR
**Certificação HL7 FHIR Foundational · Material de Apoio PT-BR**

> **Peso no exame:** ~11–17% das questões — dividido em três competências: selecionar perfis por caso de uso (3–5%), solucionar erros de validação (4–6%) e aplicar regras de perfil para validar instâncias de recursos (4–6%). É o módulo com maior peso prático: espere cenários com tabelas de perfis onde você elimina opções por coluna.

---

## 1. Recursos de Conformidade — para que serve cada um

O FHIR organiza a conformidade em recursos especializados. Conhecer o propósito de cada um é pré-requisito para as questões de seleção de IG e interpretação de StructureDefinition.

| Recurso | Propósito |
|---|---|
| **StructureDefinition** | Define a estrutura de um recurso, tipo de dado ou extensão. Principal ferramenta de perfis. |
| **CapabilityStatement** | Declara o que um servidor FHIR suporta (APIs, recursos, operações) |
| **OperationDefinition** | Define operações personalizadas |
| **SearchParameter** | Define parâmetros de busca personalizados |
| **ValueSet** | Define subconjunto de códigos para uso em elementos |
| **CodeSystem** | Define os próprios códigos e seus significados |
| **ImplementationGuide** | Agrupa perfis, extensões e dependências numa publicação coesa |
| **MessageDefinition** | Define event codes de mensagens FHIR |
| **CompartmentDefinition** | Define agrupamentos lógicos de recursos |

**Armadilha do exame:** CapabilityStatement descreve o que um servidor *suporta* — não o que um recurso *contém*. Para o que um recurso contém, a ferramenta é a StructureDefinition.

---

## 2. Perfis (Profiles) — conceito fundamental

**O que é um perfil:** uma StructureDefinition com `derivation=constraint` que deriva de outra por restrição. Perfis não inventam novos elementos base — apenas restringem ou especializam o que já existe no tipo base.

### O que você PODE fazer num perfil

- Aumentar a cardinalidade mínima: `0..1 → 1..1` — tornar opcional em obrigatório
- Diminuir a cardinalidade máxima: `0..* → 0..1` — restringir repetições
- Fixar um valor (`fixed value` ou `pattern`)
- Adicionar extensões
- Fortalecer o binding: `preferred → required`
- Adicionar invariantes FHIRPath (constraints)
- Restringir os tipos referenciados: `Reference(Resource) → Reference(Profile)`

### O que NÃO PODE fazer

Tornar obrigatório em opcional (`1..1 → 0..1`) é proibido — o perfil jamais pode afrouxar a cardinalidade mínima herdada. Aumentar o máximo além do base (`0..1 → 0..*`) também é proibido. Enfraquecer binding (`required → extensible`) viola as regras de conformidade. Mudar o tipo de dado de um elemento existente não é permitido.

**Mnemônico — "Perfis só APETAM":**  
**A**umenta mínimo · **P**erfil fixa valor · **E**xtensões permitidas · **T**ipos referenciados restringem · **A**diciona invariantes · **M**áximo só diminui

---

## 3. StructureDefinition em detalhe

A StructureDefinition (SD) é o artefato central de conformidade. O exame pode apresentar trechos de SD e pedir para interpretar o que o perfil exige.

### Elementos críticos que o exame cobra

```
StructureDefinition
├── url            → identificador canônico (DEVE ser globalmente único)
├── name           → nome técnico (sem espaços, sem acentos)
├── status         → draft | active | retired
├── kind           → resource | complex-type | primitive-type | logical
├── abstract       → true (base abstrato) | false (instanciável)
├── type           → tipo base constrangido (ex.: "Patient")
├── baseDefinition → URL da SD pai (de onde deriva)
├── derivation     → specialization (novo tipo) | constraint (perfil)
├── differential   → só o que muda em relação ao base
└── snapshot       → visão completa (base + diferencial aplicado)
```

### Differential vs Snapshot

O **differential** mostra apenas o que o perfil altera. O **snapshot** mostra todos os elementos com seus valores finais — resultado de aplicar o differential ao base. O exame frequentemente apresenta o snapshot e pede para identificar o que o perfil exige: leia o snapshot, não suponha pelo differential.

**Armadilha:** se um elemento aparece no snapshot com cardinalidade `1..1` mas não aparece no differential, o elemento era obrigatório no próprio base — o perfil não o tornou obrigatório, o base já era assim.

---

## 4. Slicing — quando e como

Slicing é o mecanismo para diferenciar múltiplas repetições de um elemento repetível (cardinalidade `0..*` ou `1..*`) com regras específicas para cada "fatia" (slice).

```
Patient.identifier (0..*)
    ├── [slice: MRN]       1..1  system = "http://hospital.org/mrn"
    ├── [slice: NPI]       0..1  system = "http://hl7.org/fhir/sid/us-npi"
    └── [outros]           permitidos se rules=open
```

### Discriminadores — como o slicer distingue as fatias

| Tipo | Distingue por |
|---|---|
| `value` | pelo valor exato de um elemento |
| `pattern` | por padrão de valor (subconjunto) |
| `type` | pelo tipo de dado (para choice types como `value[x]`) |
| `profile` | pelo perfil aplicado ao recurso referenciado |
| `exists` | pela presença ou ausência de um elemento |

### Open vs Closed slicing

**Open** (padrão): fatias adicionais não definidas no perfil são permitidas. **Closed**: proíbe qualquer elemento que não corresponda a uma das fatias definidas. No exame, quando o requisito diz "outros identificadores também são permitidos", o perfil correto terá `rules=open`. Quando diz "apenas este identificador", terá `rules=closed`.

---

## 5. Flags no contexto de perfis

As flags aparecem nas tabelas de perfil do exame. Saber interpretá-las é essencial para as questões de seleção de perfil.

| Flag | Sigla | Significado |
|---|---|---|
| Must Support | **S** | O receptor DEVE ser capaz de processar o elemento — significado definido pelo perfil, não pela spec base |
| Is-Modifier | **?!** | Muda o significado do recurso; implementadores que não entendem devem rejeitar |
| Is-Summary | **Σ** | Incluído em respostas com `_summary=true` |
| Invariant | **I** | Regra FHIRPath que deve ser satisfeita |

**Armadilha crítica:** Must Support (S) não significa obrigatório. Um elemento pode ser `S 0..*` — Must Support mas opcional. A presença do S obriga o sistema a *processar* o elemento quando ele existir, mas não obriga a *incluí-lo* na instância. A obrigatoriedade vem da cardinalidade mínima (`1..1`, `1..*`).

---

## 6. Leitura de tabelas de perfil — técnica de eliminação

O exame M4 apresenta cenários onde você recebe 4 perfis em tabela e deve escolher o correto. A técnica é eliminar por coluna, um requisito de cada vez.

**Exemplo aplicado (Quiz M4.1-Q1 — Sistema laboratorial):**

Requisito: binding `extensible` para código (código customizado permitido se LOINC indisponível).  
Perfil C tem binding `required` → elimina C (binding required = código fora do ValueSet é inválido; extensible = permitido se não houver equivalente).

Requisito: `effective[x]` deve ser `dateTime` (não Period).  
Perfil D usa tipo `Period` → elimina D.

Requisito: `category` obrigatório com "laboratory".  
Perfil A tem category `0..*` (opcional) → elimina A.

Sobra o Perfil B — correto.

**Regra geral de eliminação:**
1. Verifique cardinalidade mínima — "obrigatório" = `1..1` ou `1..*`; "se disponível" = `0..*`
2. Verifique flags — Must Support (S) sem cardinalidade alta = "deve processar se presente"
3. Verifique binding — `required` proíbe código fora do VS; `extensible` permite
4. Verifique tipo — `dateTime` vs `Period`; URL canônica completa vs texto puro
5. Verifique slicing rules — `open` permite outros; `closed` proíbe

**Armadilha de URL:** `http://loinc.org` é a URL canônica correta do LOINC. `LOINC` (texto puro) não é uma URL válida e invalida o perfil. O mesmo vale para UCUM: `http://unitsofmeasure.org` é correto; `http://ucum.org/unitsofmeasure` ou `UCUM` (texto puro) estão errados.

---

## 7. Validação de recursos

### 3 níveis de validação

```
Nível 1 — Estrutural
    JSON/XML válido, tipos de dados corretos, sintaxe ok

Nível 2 — Conformidade com spec base
    Cardinalidade da spec, binding required da spec,
    invariantes definidos na especificação base

Nível 3 — Conformidade com perfil
    Cardinalidade do perfil, Must Support, binding do perfil,
    slicing, invariantes adicionais do perfil
```

### Como validar

- `POST [base]/[Recurso]/$validate` — o servidor valida sem persistir o recurso
- FHIR Validator (jar oficial): `java -jar validator.jar recurso.json -ig perfil.tgz`
- Ferramentas online: Simplifier.net, Inferno, HAPI FHIR validator

### OperationOutcome — interpretando erros

A resposta de validação é um recurso `OperationOutcome` com uma lista de `issue`:

| Campo | Valores | O que significa |
|---|---|---|
| `severity` | fatal, error, warning, information | Gravidade do problema |
| `code` | required, value, structure, invariant... | Tipo de violação |
| `location` | caminho FHIRPath | Onde no recurso ocorreu |

**Regra do exame:** `warning` não impede a criação ou o processamento do recurso. `error` e `fatal` impedem. Um código fora de ValueSet com binding `required` gera `error`, não `warning`.

---

## 8. Implementation Guides — selecionar o correto para o caso de uso

O exame apresenta cenários clínicos/administrativos e pede qual IG usar. A chave é reconhecer as palavras-gatilho em cada caso.

| IG | Foco | Palavras-gatilho no exame |
|---|---|---|
| **US Core** | Dados mínimos de interoperabilidade nos EUA | "dados mínimos", "interoperabilidade EUA", "registro de paciente EUA" |
| **IPS** (International Patient Summary) | Resumo clínico transfronteiriço não programado | "turista em emergência", "cross-border", "não programado", "outro país" |
| **CARIN** (Consumer Directed Payer Data Exchange) | Dados de sinistros/seguro para o consumidor | "EOB", "Explanation of Benefits", "portal do membro", "seguradora para paciente" |
| **DaVinci PDex** | Dados de saúde do pagador para o provedor | "dados clínicos do plano para o médico", "histórico de cobertura" |
| **DaVinci CDex** | Troca clínica entre provedor e pagador | "prior authorization", "documentação clínica", "provedor para pagador" |
| **Argonaut Provider Directory** | Diretório de profissionais nos EUA | "diretório de profissionais", "provider directory EUA", "demographics + role + organization" |

### Como escolher no exame — árvore de decisão

```
Cenário envolve troca transfronteiriça não programada?
    Sim → IPS

Cenário envolve EOB / sinistros / seguro para o consumidor?
    Sim → CARIN

Cenário envolve diretório de profissionais nos EUA?
    Sim → Argonaut Provider Directory

Cenário envolve dados clínicos entre pagador e provedor?
    Sim → DaVinci CDex (documentação clínica) ou PDex (dados do plano)

Cenário envolve dados mínimos de interoperabilidade no contexto EUA?
    Sim → US Core
```

**Armadilha frequente:** DaVinci PDex e CARIN são frequentemente confundidos. PDex é **pagador para provedor** (dados clínicos do plano vão para o médico). CARIN é **pagador para consumidor/membro** (dados de sinistros vão para o paciente via portal). O sinal definitivo é a presença de "EOB" ou "portal do membro" → CARIN.

**Argonaut vs US Core:** Argonaut Provider Directory é específico para **diretório de profissionais** com dados de role e organização. US Core é o padrão geral de interoperabilidade. Se o cenário fala em "repositório de profissionais com role e parâmetros de busca" → Argonaut.

---

## 9. Erros de validação comuns — resolução

| Erro | Causa provável | Como resolver |
|---|---|---|
| "Element X missing, minimum cardinality is 1" | Elemento obrigatório ausente | Incluir o elemento na instância |
| "Code Y not in ValueSet Z (strength=required)" | Código fora do VS obrigatório | Usar um código válido do VS; não é possível usar extensão |
| "Value does not match fixed value" | Elemento com fixed value diferente | Corrigir para o valor fixado no perfil |
| "Slice X does not match any discriminator" | Fatia não identificável pelo discriminador | Corrigir o valor do elemento discriminador |
| "Profile constraint violated: invariant rule" | Invariante FHIRPath falhou | Ler a mensagem do invariante e corrigir os dados |
| "Reference to Patient but profile requires US Core Patient" | Referência ao tipo base em vez do perfil | Alterar a referência para instância do perfil correto |

---

## Checkpoint Final — 10 Perguntas de Autoteste

Responda sem consultar o material. Depois compare com o gabarito.

---

**Q1.** Qual recurso de conformidade FHIR declara o que um servidor suporta (APIs, recursos, operações)?  
(A) StructureDefinition  
(B) ImplementationGuide  
(C) CapabilityStatement  
(D) OperationDefinition

**Q2.** Um perfil define `category` com cardinalidade `1..*` e `status` fixado em "final". A spec base tem `category 0..*` e `status` com múltiplos valores permitidos. Qual afirmação sobre esse perfil é CORRETA?  
(A) O perfil viola a especificação base ao aumentar a cardinalidade mínima de category  
(B) O perfil é válido — aumentar mínimo e fixar valor são restrições permitidas  
(C) O perfil viola a especificação base ao fixar o valor de status  
(D) O perfil é inválido porque não pode alterar status

**Q3.** Um perfil tem `generalPractitioner` com cardinalidade `1..1`. Um requisito de negócio diz "referência a um único profissional". O que isso significa?  
(A) O elemento é Must Support mas não obrigatório  
(B) O elemento deve estar presente e ter exatamente uma referência  
(C) O elemento pode aparecer zero ou uma vez  
(D) O elemento aceita múltiplas referências

**Q4.** No slicing de `Patient.identifier`, o perfil define duas fatias com `rules=open`. O que isso implica?  
(A) Apenas as duas fatias definidas são permitidas na instância  
(B) A instância pode ter identificadores adicionais além das fatias definidas  
(C) O slicing é inválido porque Patient.identifier não suporta slicing  
(D) Fatias adicionais exigem extensão para serem incluídas

**Q5.** Um perfil tem o elemento `code` com binding `extensible` para LOINC. Uma instância usa um código customizado porque não há equivalente LOINC. Qual é o resultado da validação?  
(A) Error — binding extensible não permite códigos fora do ValueSet  
(B) Fatal — a instância deve ser rejeitada  
(C) Warning — código fora do VS extensible gera aviso, não erro  
(D) Valid — binding extensible permite código fora do VS quando não há equivalente

**Q6.** Qual elemento da StructureDefinition contém TODOS os elementos do recurso, incluindo os herdados do base e os modificados pelo perfil?  
(A) differential  
(B) snapshot  
(C) baseDefinition  
(D) derivation

**Q7.** Um paciente americano sofre emergência cardíaca durante viagem à Alemanha. O hospital alemão precisa acessar alergias, medicamentos e histórico cirúrgico do paciente. Qual IG endereça esse cenário?  
(A) US Core  
(B) Argonaut Data Query  
(C) FHIR Bulk Data Access  
(D) International Patient Summary (IPS)

**Q8.** Um grupo de hospitais nos EUA precisa criar um repositório de profissionais com informações demográficas, role e organização, além de parâmetros de busca. Qual IG deve ser usado?  
(A) US Core  
(B) DaVinci PDex  
(C) Argonaut Provider Directory  
(D) CARIN

**Q9.** Um paciente acessa o portal da sua seguradora e solicita o Explanation of Benefits (EOB) de suas coberturas. Qual IG a seguradora deve implementar?  
(A) DaVinci PDex  
(B) CARIN (Consumer Directed Payer Data Exchange)  
(C) DaVinci CDex  
(D) Argonaut Data Query

**Q10.** Um OperationOutcome retorna um issue com `severity=error` e `code=required`. O que isso significa para o processamento da instância?  
(A) O recurso pode ser criado mas com advertência  
(B) O sistema deve registrar o aviso e prosseguir normalmente  
(C) A instância não pode ser criada — error impede o processamento  
(D) O error só se aplica se houver também um issue fatal

---

### Gabarito

| Q | Resp. | Conceito-chave |
|---|-------|----------------|
| 1 | **C** | CapabilityStatement = o que o servidor suporta; SD = o que o recurso contém |
| 2 | **B** | Aumentar mínimo (0→1) e fixar valor são restrições válidas num perfil |
| 3 | **B** | `1..1` = obrigatório e exatamente um — não confundir com Must Support (S) |
| 4 | **B** | `rules=open` permite fatias adicionais; `rules=closed` proíbe |
| 5 | **D** | Binding extensible permite código alternativo quando não há equivalente no VS |
| 6 | **B** | Snapshot = visão completa; differential = só o que mudou |
| 7 | **D** | IPS = cuidado não programado transfronteiriço — palavra-chave "emergência + outro país" |
| 8 | **C** | Argonaut Provider Directory = diretório de profissionais EUA com role + organização |
| 9 | **B** | CARIN = pagador para consumidor/membro; EOB é o sinal definitivo |
| 10 | **C** | Error (e fatal) impedem criação; warning não impede |

---

> **Próximo passo:** Execute os quizzes `module4_1_q1` e `module4_2_q1` no app. A técnica de eliminação por coluna da Seção 6 deve ser aplicada em cada questão — verbalize em voz alta por que cada perfil incorreto é eliminado antes de marcar a resposta. Marque no calendário para revisar este guia em **2 dias** (recência) e novamente em **1 semana** (intervalo de retenção). O app mostrará as questões com badge vermelho nas que você errar — use o botão "Revisar Fracos" para focar nelas.
