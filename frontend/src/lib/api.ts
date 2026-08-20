import type { AnalisisCV } from "./types";

const API_BASE = import.meta.env.PUBLIC_API_BASE_URL ?? "/api";

export async function analyzeCV(
  file: File,
  descripcionPuesto: string,
  turnstileToken: string,
): Promise<AnalisisCV> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("descripcion_puesto", descripcionPuesto);
  formData.append("turnstile_token", turnstileToken);

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
