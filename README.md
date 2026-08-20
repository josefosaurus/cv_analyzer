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
PUBLIC_API_BASE_URL=http://localhost:8000
PUBLIC_TURNSTILE_SITE_KEY=0x...
TURNSTILE_SECRET_KEY=0x...
```

## Protección contra abuso

El formulario usa Cloudflare Turnstile y la API limita cada IP a 5 análisis cada 10 minutos.

1. Crea un widget Turnstile para `josefosaurus.github.io`.
2. Añade su clave pública como variable de Actions `PUBLIC_TURNSTILE_SITE_KEY`.
3. Añade su clave secreta a Secret Manager como `TURNSTILE_SECRET_KEY` y permite que la cuenta de ejecución de Cloud Run la lea.

En producción, la API rechaza solicitudes si falta la clave secreta. En desarrollo local, Turnstile se omite cuando `TURNSTILE_SECRET_KEY` está vacía.

## Run locally

```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

```bash
cd frontend
npm install
npm run dev -- --host 0.0.0.0
```

The app runs on `http://localhost:4321` and calls the backend at `http://localhost:8000`.

## Production deployment

This repo is designed to deploy the frontend on GitHub Pages and the backend on Google Cloud Run.

### Backend on Cloud Run

```bash
export PROJECT_ID=your-project-id
export REGION=us-central1
export SERVICE_NAME=cv-analyzer-backend

# Build image from backend folder
gcloud builds submit --tag us-central1-docker.pkg.dev/$PROJECT_ID/cv-analyzer/backend ./backend

# Deploy container
gcloud run deploy $SERVICE_NAME \
  --image us-central1-docker.pkg.dev/$PROJECT_ID/cv-analyzer/backend \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --set-secrets OPENAI_API_KEY=OPENAI_API_KEY:latest
```

### Frontend on GitHub Pages

Build the Astro site and publish the `frontend/dist` folder with GitHub Actions.
Set the environment variable before building:

```bash
PUBLIC_API_BASE_URL=https://your-backend-url.a.run.app
cd frontend
npm install
npm run build
```

The GitHub Pages site should use this backend URL as the API base.

## Usage

1. Upload a PDF resume (text-based, not scanned)
2. Paste the job description
3. Click **Analizar Candidato**

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
