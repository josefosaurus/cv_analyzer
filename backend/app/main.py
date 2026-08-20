import logging
import os

from fastapi import FastAPI, File, Form, HTTPException, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from app.models.cv_model import AnalisisCV
from app.services.cv_evaluator import evaluar_candidato
from app.services.pdf_processor import extraer_texto_pdf
from app.services.rate_limiter import RateLimiter
from app.services.turnstile import verify_turnstile

logger = logging.getLogger("cv_analyzer")

app = FastAPI(title="CV Analyzer API", version="1.0.0")
analysis_rate_limiter = RateLimiter(limit=5, window_seconds=600)

allowed_origins = [
    "http://localhost:4321",
    "http://localhost:3000",
    "http://127.0.0.1:4321",
    "http://127.0.0.1:3000",
]
extra_origins = os.getenv("CORS_ALLOWED_ORIGINS", "")
if extra_origins:
    allowed_origins.extend(
        origin.strip() for origin in extra_origins.split(",") if origin.strip()
    )

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.post("/api/analyze", response_model=AnalisisCV)
async def analyze(
    request: Request,
    file: UploadFile = File(...),
    descripcion_puesto: str = Form(...),
    turnstile_token: str = Form(default=""),
):
    forwarded_for = request.headers.get("x-forwarded-for", "")
    client_ip = forwarded_for.split(",")[0].strip() or request.client.host
    analysis_rate_limiter.check(client_ip)
    verify_turnstile(turnstile_token, client_ip)

    descripcion_puesto = descripcion_puesto.strip()
    if not descripcion_puesto:
        raise HTTPException(
            status_code=400, detail="La descripción del puesto es requerida"
        )

    contenido = await file.read()

    try:
        texto_cv = extraer_texto_pdf(contenido)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e

    try:
        resultado = evaluar_candidato(texto_cv, descripcion_puesto)
    except RuntimeError as e:
        logger.exception("Fallo en la evaluación con IA")
        raise HTTPException(status_code=502, detail=str(e)) from e

    return resultado
