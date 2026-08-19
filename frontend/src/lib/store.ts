import { atom } from "nanostores";
import type { AnalysisState } from "./types";

// Shared across the UploadForm and ResultsPanel islands.
export const analysisStore = atom<AnalysisState>({
  status: "idle",
  progress: 0,
  result: null,
  error: null,
});

export function resetAnalysis() {
  analysisStore.set({ status: "idle", progress: 0, result: null, error: null });
}

export function setProgress(progress: number) {
  analysisStore.set({ ...analysisStore.get(), status: "loading", progress, error: null });
}
