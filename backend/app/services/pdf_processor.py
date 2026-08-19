import PyPDF2
from io import BytesIO


def extraer_texto_pdf(contenido_pdf: bytes) -> str:
    """Extrae texto de bytes crudos de un PDF (leído previamente desde un UploadFile)."""
    try:
        pdf_reader = PyPDF2.PdfReader(BytesIO(contenido_pdf))
        texto_completo = ""
        for numero_pagina, pagina in enumerate(pdf_reader.pages, 1):
            text_pagina = pagina.extract_text()
            if text_pagina and text_pagina.strip():
                texto_completo += f"\n\n--- Página {numero_pagina} ---\n{text_pagina}"
        texto_completo = texto_completo.strip()

        if not texto_completo:
            raise ValueError("El PDF no contiene texto extraíble.")
        return texto_completo
    except ValueError:
        raise
    except Exception as e:
        raise ValueError(f"Error al procesar el PDF: {str(e)}")
