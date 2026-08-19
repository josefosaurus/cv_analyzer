import logging

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from app.models.cv_model import AnalisisCV
from app.services.cv_evaluator import evaluar_candidato
from app.services.pdf_processor import extraer_texto_pdf

logger = logging.getLogger("cv_analyzer")

app = FastAPI(title="CV Analyzer API", version="1.0.0")

# CORS is only relevant for local dev (frontend served on a different port); in
# production nginx proxies both apps under the same origin.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4321", "http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.post("/api/analyze", response_model=AnalisisCV)
async def analyze(
    file: UploadFile = File(...),
    descripcion_puesto: str = Form(...),
):
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
