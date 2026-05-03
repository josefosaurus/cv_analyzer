from dotenv import load_dotenv
from typing import cast

from langchain_openai import ChatOpenAI
from models.cv_model import AnalisisCV
from prompts.cv_prompts import crear_sistema_prompts


load_dotenv()


def crear_evaluador_cv():
    modelo_base = ChatOpenAI(model="gpt-4o-mini", temperature=0.2)

    modelo_extructurado = modelo_base.with_structured_output(AnalisisCV)
    chat_prompt = crear_sistema_prompts()
    cadena_evaluacion = chat_prompt | modelo_extructurado

    return cadena_evaluacion


def evaluar_candidato(texto_cv: str, descripcion_puesto: str) -> AnalisisCV:
    try:
        cadena_evaluacion = crear_evaluador_cv()
        resultado = cadena_evaluacion.invoke(
            {"texto_cv": texto_cv, "descripcion_puesto": descripcion_puesto}
        )

        return cast(AnalisisCV, resultado)

    except Exception as e:
        raise RuntimeError(f"Fallo en la evaluación con IA: {e}") from e
