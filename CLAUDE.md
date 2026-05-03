# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CV/resume analyzer using LangChain + OpenAI (GPT-4o-mini). Evaluates how well a candidate's PDF resume matches a job description. Returns structured analysis: fit percentage, strengths, improvement areas. UI is in Spanish.

## Environment Setup

Uses a local `.venv` with Python 3.13. Always activate before running:

```bash
source .venv/bin/activate
```

`OPENAI_API_KEY` must be set — either via a local `.env` file (loaded automatically via `python-dotenv`) or as an environment variable.

Install dependencies:

```bash
pip install -r requirements.txt
```

## Running the App

```bash
streamlit run app.py
```

`app.py` is the entry point — imports and calls `ui/streamlit_ui.py:main()`.

## Architecture

```
PDF upload → services/pdf_processor.py → raw text
                                              ↓
job description → services/cv_evaluator.py → AnalisisCV (structured output)
                        ↓
              prompts/cv_prompts.py (ChatPromptTemplate)
              models/cv_model.py (Pydantic schema)
```

**`services/pdf_processor.py`** — `extraer_texto_pdf(archivo_pdf)` accepts a Streamlit `UploadedFile`, reads into `BytesIO`, extracts text page-by-page with PyPDF2, prepends `--- Página N ---` markers. Raises `ValueError` if no text extracted (e.g. scanned/image PDFs fail here).

**`services/cv_evaluator.py`** — `evaluar_candidato(texto_cv, descripcion_puesto)` builds a LangChain chain: `ChatPromptTemplate | ChatOpenAI(gpt-4o-mini, temperature=0.2).with_structured_output(AnalisisCV)`. On failure raises `RuntimeError` (caller in `ui/streamlit_ui.py` handles and shows error in UI).

**`prompts/cv_prompts.py`** — `SISTEMA_PROMPT` (senior recruiter persona) + `ANALISIS_PROMPT` (template with `{texto_cv}` and `{descripcion_puesto}` vars) combined into `CHAT_PROMPT`. `crear_sistema_prompts()` returns it.

**`models/cv_model.py`** — Pydantic v2 `AnalisisCV` with fields: `nombre_candidato`, `experiencia_anos`, `habilidades_clave` (list), `educacion`, `experiencia_relevante`, `fortalezas` (list), `areas_mejora` (list), `porcentaje_ajuste` (float, 0–100). **Known bug:** `areas_mejora` uses a bare default list `= ["Descripción breve..."]` instead of `Field(...)`, so it is excluded from the JSON schema sent to the model for structured output.

**`ui/streamlit_ui.py`** — Two-column layout: left column handles PDF upload + job description input, right column shows results. State flows via `st.session_state`. Color-coded fit display (🟢 ≥80, 🟡 ≥60, 🟠 ≥40, 🔴 <40); recommendation thresholds (≥70 recommend, ≥50 with caveat, <50 not recommended).

## Key Notes

- Scoring weights are baked into the prompt: experience 40%, technical skills 35%, education 15%, professional coherence 10%.
- `langgraph` is installed in the venv but not yet used.
- "Save Analysis" button in UI is a stub — not implemented.
