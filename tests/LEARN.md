# FHIR Learn — App de trilha estilo Duolingo

App de estudo para a certificação **HL7 FHIR Foundational**, no estilo Duolingo: ensina
em micro-lições, pratica com as questões existentes, agenda revisões por **repetição
espaçada (SRS)** e mede a prontidão para a prova. Tudo client-side, bilíngue PT/EN,
funciona offline com `localStorage`.

> Coexiste com o quiz clássico (`index.html`) e os flashcards (`index_flashcards.html`).
> O `learn.html` **reaproveita os mesmos JSONs de questões** em `quizzes/` — não duplica conteúdo.

---

## Como rodar

```bash
# sirva a partir da RAIZ do repositório (não de tests/)
python -m http.server          # ou VSCode Live Server
# abra http://localhost:8000/tests/learn.html
```

`fetch()` não funciona por `file://` — use um servidor estático.

> **Por que da raiz?** O botão "📗 Material do curso" (em cada lição) abre um modal que renderiza o arquivo `module-N.md` da raiz do repo. Servindo de `tests/`, esses `.md` ficam acima da raiz do servidor e não carregam. Servindo da raiz, tudo (`tests/data`, `tests/quizzes` e os `module-N.md`) fica acessível.

---

## O que o app faz

| Recurso | Descrição |
|---|---|
| **Abas de módulo** | M1–M4 no topo, cada uma com o % de maestria. |
| **Trilha (skill-tree)** | Unidades → lições que destravam em sequência; coroas 🥉🥈👑 por maestria. |
| **Player de lição** | 1) cartão de **ensino** (analogia + pontos-chave + armadilha); 2) **prática** uma questão por vez com feedback imediato + explicação. |
| **Ordem aleatória** | As **questões** são embaralhadas a cada sessão e as **alternativas** a cada exibição — refazer não repete a mesma ordem. A letra (A/B/C) acompanha o texto, então as explicações seguem corretas. |
| **Checkpoint de Unidade (🎯/🏆)** | Nó no fim de cada unidade que destrava quando todas as lições estão feitas. Junta as questões da unidade, embaralhadas, sem cartão, em modo prova (1 tentativa por questão). Acertar ≥80% marca a unidade como **DOMINADA** (+20 XP de bônus). |
| **Medidor de consolidação (🧠)** | Mostra **conceitos consolidados** (lições com coroa 🥈+) e **questões dominadas** (item revisado ≥2× com último acerto), no cabeçalho e na home — análogo ao "palavras aprendidas" do Duolingo. |
| **SRS (SM-2 lite)** | Cada item é reagendado conforme o acerto; o motor decide o que revisar e quando. |
| **Revisão diária global** | Botão "Revisar" junta os itens **vencidos de todos os módulos** numa só sessão. |
| **Gamificação** | XP (+10 acerto de primeira, +2 em repetição), streak diário, coroas por lição. |
| **Prontidão** | Anel de % do módulo + barras por unidade = medição do aprendizado. |
| **"Explicar melhor" (IA opcional)** | Botão que chama a API Claude para reexplicar uma questão errada. Sem chave, o resto funciona normal. |
| **Bilíngue** | Botão 🇬🇧/🇵🇹 troca todo o conteúdo (questões, cartões, UI). |

---

## Estrutura de arquivos

```
tests/
├── learn.html              ← o app (HTML+CSS+JS num arquivo só)
├── data/
│   ├── modules.json        ← manifesto: lista os 4 path files
│   ├── m1_path.json        ← trilha do Módulo 1
│   ├── m2_path.json        ← trilha do Módulo 2
│   ├── m3_path.json        ← trilha do Módulo 3
│   └── m4_path.json        ← trilha do Módulo 4
└── quizzes/                ← questões (compartilhadas com index.html)
    ├── manifest.json
    └── moduleX_qY.json
```

### Cobertura atual (180 questões = 100%)

| Módulo | Unidades | Lições | Questões | Quizzes-fonte |
|---|---|---|---|---|
| M1 – Princípios | 3 | 7 | 20 | module1_q1, module1_q2 |
| M2 – Modelo & Implementação | 5 | 19 | 86 | module2a_q1..q4, module2_q1..q3 |
| M3 – API/Search/Bundles/Operações | 5 | 16 | 66 | module3_1_q1, module3_2_q1..q2, module3_3_q1, module3_4_q1..q3, module3_5_q1..q2 |
| M4 – Perfis & Implementation Guides | 2 | 3 | 8 | module4_1_q1, module4_2_q1 |

Conteúdo de ensino dos cartões é curado dos guias `../module-N-guia-estudo.md`.

---

## Formato do path file (`data/mN_path.json`)

```jsonc
{
  "module": "module2",
  "titlePt": "Módulo 2 – Modelo e Implementação de Recursos",
  "titleEn": "Module 2 – Resource Model & Implementation",
  "examNotePt": "O módulo mais pesado: 36–51% da prova...",
  "examNoteEn": "The heaviest module: 36–51%...",
  "sources": {                                  // prefixo → arquivo de questões
    "module2a_q1": "quizzes/module2a_q1.json"
  },
  "units": [
    {
      "id": "u1",
      "titlePt": "Escolher o recurso certo",
      "titleEn": "Choosing the right resource",
      "color": "#6ee7b7",
      "lessons": [
        {
          "id": "m2-l1",
          "titlePt": "Pedidos × Resultados",
          "titleEn": "Orders × Results",
          "card": {                             // o cartão de ENSINO (bilíngue)
            "titlePt": "...", "titleEn": "...",
            "analogyPt": "...", "analogyEn": "...",
            "pointsPt": ["...", "..."], "pointsEn": ["...", "..."],
            "trapPt": "...", "trapEn": "..."     // armadilha de exame
          },
          "items": ["module2a_q1#1", "module2a_q1#2"]  // chave = <prefixo>#<id da questão>
        }
      ]
    }
  ]
}
```

- **`items`**: cada chave é `<prefixo do source>#<id>`. O `id` é o campo `id` da questão dentro do JSON do quiz.
- O texto da questão, opções e explicações vêm **do quiz JSON** (não se repetem no path).
- HTML simples (`<b>`, `<code>`) é permitido dentro dos textos do cartão.

---

## Checkpoint de unidade & questões novas (dos PDFs)

Cada unidade pode ter um pool de questões para a "Prova da Unidade":

```jsonc
"units": [
  {
    "id": "u1",
    "lessons": [ /* ... */ ],
    "checkpoint": { "items": ["module1_cp#1", "module1_cp#2", "module1_cp#3", "module1_cp#4"] }
  }
]
```

- Se `checkpoint.items` existir, a prova usa **essas** questões; senão, faz **fallback** e reaproveita
  todas as questões das lições da unidade (embaralhadas).
- As questões novas ficam num quiz dedicado (ex.: `quizzes/module1_cp.json`, sufixo `_cp`),
  registrado em `sources` do path file como qualquer outro.
- **Sourcing**: as questões do checkpoint do Módulo 1 foram autoradas a partir do PDF oficial
  `Module 1- FHIR Principles Reading Material.pdf`; cada explicação cita a seção-fonte
  (ex.: "FHIR Focus", "FMM levels", "FHIR Trademark"). Mesmo padrão deve ser usado ao criar
  checkpoints de M2–M4 a partir dos respectivos PDFs em `hl7-cert/`.
- Status atual: **todos os módulos têm questões de checkpoint autoradas dos PDFs** — 59 questões inéditas no total:
  M1=12, M2=19 (4/4/3/4/4 por unidade), M3=20 (4 por unidade), M4=8. Arquivos: `quizzes/module1_cp.json` … `module4_cp.json`.
  Cada explicação cita a seção-fonte do PDF correspondente em `hl7-cert/`.

## Como adicionar conteúdo

**Novas questões num módulo existente:** adicione ao JSON do quiz em `quizzes/` e referencie a
chave `prefixo#id` em `items` da lição desejada no path file.

**Novo módulo:** crie `data/mN_path.json`, registre o(s) `sources`, monte units/lessons,
e adicione a entrada em `data/modules.json`. O app carrega automaticamente.

> Os path files M2–M4 foram gerados por script Python (mais seguro para o volume).
> Para regerar/editar em lote, recriar um gerador análogo que faz `json.dump(..., ensure_ascii=False, indent=2)`.

**Validar cobertura** (todo item referenciado existe, sem duplicata/sobra):

```bash
cd tests && python3 - <<'EOF'
import json, glob
for pf in sorted(glob.glob('data/m*_path.json')):
    p = json.load(open(pf)); qmap=set()
    for pref,f in p['sources'].items():
        for q in json.load(open(f)): qmap.add(f"{pref}#{q['id']}")
    used=[i for u in p['units'] for l in u['lessons'] for i in l['items']]
    print(pf, 'itens', len(used), 'únicos', len(set(used)),
          'faltando', [i for i in used if i not in qmap] or 'ok',
          'naoUsadas', sorted(qmap-set(used)) or 'ok')
EOF
```

---

## Motor SRS (SM-2 lite)

Por item guardado em `flearn_srs`: `{ease, interval, reps, lapses, due, lastGrade}`.

- Acerto → grade alta: `reps` cresce e `interval` aumenta (1d → 3d → `interval×ease`).
- Erro → `reps=0`, volta logo; `ease` cai (mínimo 1.3).
- A nota SRS é **travada no primeiro encontro** do item na sessão; erros voltam ao fim da fila
  (estilo Duolingo) mas não alteram a nota já registrada.
- `strength(item)` (0–1) alimenta os anéis/barras de maestria; itens vencidos decaem.
- **Coroa da lição**: 🥉 todos os itens reps≥1 · 🥈 reps≥2 · 👑 reps≥3 e ease≥2.3.
- **Destravamento**: a lição abre quando a anterior tem coroa ≥ 🥉.

---

## Persistência (localStorage)

| Chave | Conteúdo |
|---|---|
| `flearn_srs` | agendamento SRS por item (global, chaves únicas por módulo) |
| `flearn_gam` | `{xp, streak, lastDay, crowns}` |
| `flearn_module` | módulo selecionado por último |
| `flearn_lang` | `PT` ou `EN` |
| `flearn_apikey` | chave da API Anthropic (opcional, só no navegador) |
| `flearn_aimodel` | modelo de IA escolhido |

Zerar progresso: ⚙️ → "Zerar progresso".

---

## IA "Explicar melhor" (opcional)

- Em ⚙️, cole uma chave da API Anthropic e escolha o modelo
  (`claude-haiku-4-5-20251001` rápido/barato, ou `claude-sonnet-4-6` detalhado).
- Chamada direta do navegador (`anthropic-dangerous-direct-browser-access`).
- **Aviso de segurança**: a chave fica no `localStorage` do navegador. Aceitável para uso
  local pessoal. Se um dia publicar o app online, mova a chamada para um proxy backend —
  não exponha a chave no cliente.

---

## Limitações conhecidas

- Progresso é por navegador (não sincroniza entre dispositivos) — exigiria backend.
- Validado por sintaxe (JS/JSON) e carregamento HTTP; o fluxo clique-a-clique deve ser
  conferido abrindo o app no navegador.
