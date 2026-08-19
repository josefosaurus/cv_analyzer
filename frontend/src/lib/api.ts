import type { AnalisisCV } from "./types";

// Relative path so nginx can proxy it under the same origin in production.
const API_BASE = import.meta.env.PUBLIC_API_BASE_URL ?? "/api";

export async function analyzeCV(file: File, descripcionPuesto: string): Promise<AnalisisCV> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("descripcion_puesto", descripcionPuesto);

  const response = await fetch(`${API_BASE}/analyze`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.detail ?? `Error del servidor (${response.status})`);
  }

  return response.json();
}
