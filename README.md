# CV Analyzer

AI-powered CV/resume evaluator. Upload a PDF resume, provide a job description, and get a structured analysis of how well the candidate fits the role — including fit score, strengths, and areas for improvement. UI is in Spanish.

## Stack

- **LangChain** — chain orchestration and prompt management
- **OpenAI GPT-4o-mini** — structured output generation
- **Pydantic v2** — response schema validation
- **PyPDF2** — PDF text extraction
- **Streamlit** — web UI

## Requirements

- Python 3.13
- OpenAI API key

## Setup

```bash
git clone https://github.com/josefosaurus/cv_analyzer.git
cd cv_analyzer

python -m venv .venv
source .venv/bin/activate

pip install -r requirements.txt
```

Set your API key in a `.env` file:

```
OPENAI_API_KEY=sk-...
```

## Run

```bash
streamlit run app.py
```

Opens at `http://localhost:8501`.

## Usage

1. Upload a PDF resume (text-based, not scanned)
2. Paste the job description
3. Click **Analizar Candidato**

## Scoring

The fit percentage is calculated by GPT-4o-mini weighted as:

| Factor | Weight |
|---|---|
| Relevant experience | 40% |
| Technical skills | 35% |
| Education & certifications | 15% |
| Career coherence | 10% |

## Limitations

- Scanned / image-only PDFs are not supported — text must be selectable
- Analysis quality depends on how detailed the job description is
