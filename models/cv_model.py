from pydantic import BaseModel, Field


class AnalisisCV(BaseModel):
    # modelo de datos para el analisis del CV, con campos relevantes para evaluar el ajuste al puesto

    nombre_candidato: str = Field(description="Nombre del candidato extraido del pdf")
    experiencia_anos: int = Field(description="Años de experiencia laboral relevante")
    habilidades_clave: list[str] = Field(
        description="Lista de habilidades mas relevantes al puesto"
    )
    educacion: str = Field(description="Nivel educativo del candidato")
    experiencia_relevante: str = Field(
        description="Descripción breve de la 3-5 experiencias laborales relevante al puesto especifico"
    )
    fortalezas: list[str] = Field(
        description="Lista de 3-5 fortalezas relevantes del candidato"
    )
    areas_mejora: list[str] = ["Descripción breve de 2-4 áreas de mejora del candidato"]
    porcentaje_ajuste: float = Field(
        description="Porcentaje de ajuste (0-100) al puesto basado en su CV",
        ge=0,
        le=100,
    )
