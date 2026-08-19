interface ScoreLevel {
  color: string;
  nivel: string;
  mensaje: string;
}

// Mirrors the thresholds from the original Streamlit UI.
export function getScoreLevel(porcentaje: number): ScoreLevel {
  if (porcentaje >= 80) return { color: "🟢", nivel: "EXCELENTE", mensaje: "Candidato altamente recomendado" };
  if (porcentaje >= 60) return { color: "🟡", nivel: "BUENO", mensaje: "Candidato recomendado con reservas" };
  if (porcentaje >= 40) return { color: "🟠", nivel: "REGULAR", mensaje: "Candidato requiere evaluación adicional" };
  return { color: "🔴", nivel: "BAJO", mensaje: "Candidato no recomendado" };
}

export function getRecommendation(porcentaje: number): { title: string; body: string; tone: "success" | "warning" | "error" } {
  if (porcentaje >= 70) {
    return {
      tone: "success",
      title: "✅ CANDIDATO RECOMENDADO",
      body: "El perfil del candidato está bien alineado con los requisitos del puesto. Se recomienda proceder con las siguientes etapas del proceso de selección.",
    };
  }
  if (porcentaje >= 50) {
    return {
      tone: "warning",
      title: "⚠️ CANDIDATO CON POTENCIAL",
      body: "El candidato muestra potencial pero requiere evaluación adicional. Se recomienda una entrevista técnica para validar competencias específicas.",
    };
  }
  return {
    tone: "error",
    title: "❌ CANDIDATO NO RECOMENDADO",
    body: "El perfil no se alinea suficientemente con los requisitos del puesto. Se recomienda continuar la búsqueda de candidatos más adecuados.",
  };
}
