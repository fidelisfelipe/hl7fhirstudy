# Quiz Loader (HTML) + JSON manifest schema

- O app:

  - lê quizzes/manifest.json,
  - popula um seletor de módulos,
  - busca o JSON do módulo escolhido,
  - aplica EN/PT, múltipla escolha, pontuação e histórico por módulo,
  - aceita ?module=<key> na URL para abrir direto um módulo.

## Estrutura de pastas (na raiz do projeto)
```bash
/index.html                ← use este HTML
/quizzes/manifest.json
/quizzes/module1_q1.json
/quizzes/module1_q2.json
/quizzes/use_extensions_q1.json
... (um JSON por módulo/quiz)
```

- manifest.json (exemplo)
```json
{
  "modules": [
    {
      "key": "module1_q1",
      "titleEn": "Module 1 – Principles (Quiz 1)",
      "titlePt": "Módulo 1 – Princípios (Quiz 1)",
      "file": "quizzes/module1_q1.json"
    },
    {
      "key": "module1_q2",
      "titleEn": "Module 1 – Principles (Quiz 2)",
      "titlePt": "Módulo 1 – Princípios (Quiz 2)",
      "file": "quizzes/module1_q2.json"
    },
    {
      "key": "use_extensions_q1",
      "titleEn": "Use existing extensions (Quiz 1)",
      "titlePt": "Usar extensões existentes (Quiz 1)",
      "file": "quizzes/use_extensions_q1.json"
    }
  ]
}
```

- Esquema do JSON de cada módulo (modelo)
```json
[
  {
    "id": 1,
    "titleEn": "Quiz 1 – Full Form of FHIR",
    "titlePt": "Quiz 1 – Forma Completa de FHIR",
    "qEn": "What is the full form of FHIR?",
    "qPt": "Qual é a forma completa de FHIR?",
    "type": "single",                     // ou "multi"
    "options": [
      { "key": "A", "en": "Full Health Interoperability Resources", "pt": "Recursos de Interoperabilidade Completa em Saúde", "correct": false },
      { "key": "D", "en": "Fast Healthcare Interoperability Resources", "pt": "Recursos de Interoperabilidade Rápida em Saúde", "correct": true }
    ]
  }
]
```
- Observações rápidas

- Por segurança dos navegadores, fetch() pode não funcionar abrindo o arquivo pelo file://. Rode com um servidor estático simples (ex.: VSCode Live Server ou python -m http.server).
- O histórico é salvo por chave de módulo (localStorage): exporte/limpe pelo próprio app.


