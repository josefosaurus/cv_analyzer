export interface AnalisisCV {
  nombre_candidato: string;
  experiencia_anos: number;
  habilidades_clave: string[];
  educacion: string;
  experiencia_relevante: string;
  fortalezas: string[];
  areas_mejora: string[];
  porcentaje_ajuste: number;
}

export type AnalysisStatus = "idle" | "loading" | "success" | "error";

export interface AnalysisState {
  status: AnalysisStatus;
  progress: number;
  result: AnalisisCV | null;
  error: string | null;
}
