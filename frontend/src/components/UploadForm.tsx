import { useEffect, useRef, useState, type FormEvent } from "react";
import { analysisStore, resetAnalysis, setProgress } from "../lib/store";
import { analyzeCV } from "../lib/api";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "expired-callback": () => void;
          "error-callback": () => void;
        },
      ) => string;
      reset: (widgetId?: string) => void;
    };
  }
}

const turnstileSiteKey = import.meta.env.PUBLIC_TURNSTILE_SITE_KEY;
const turnstileScriptUrl = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

export default function UploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [descripcionPuesto, setDescripcionPuesto] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const turnstileContainer = useRef<HTMLDivElement>(null);
  const turnstileWidgetId = useRef<string>();

  useEffect(() => {
    if (!turnstileSiteKey || !turnstileContainer.current) {
      return;
    }

    const script = document.createElement("script");
    script.src = turnstileScriptUrl;
    script.async = true;
    script.onload = () => {
      if (turnstileContainer.current && window.turnstile) {
        turnstileWidgetId.current = window.turnstile.render(turnstileContainer.current, {
          sitekey: turnstileSiteKey,
          callback: setTurnstileToken,
          "expired-callback": () => setTurnstileToken(""),
          "error-callback": () => setTurnstileToken(""),
        });
      }
    };
    document.head.appendChild(script);

    return () => script.remove();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!file) {
      analysisStore.set({ status: "error", progress: 0, result: null, error: "Por favor sube un archivo PDF con el currículum" });
      return;
    }
    const descripcion = descripcionPuesto.trim();
    if (!descripcion) {
      analysisStore.set({ status: "error", progress: 0, result: null, error: "Por favor proporciona una descripción detallada del puesto" });
      return;
    }
    if (turnstileSiteKey && !turnstileToken) {
      analysisStore.set({ status: "error", progress: 0, result: null, error: "Completa la verificación de seguridad" });
      return;
    }

    setSubmitting(true);
    setProgress(25);
    try {
      setProgress(50);
      const result = await analyzeCV(file, descripcion, turnstileToken);
      setProgress(75);
      analysisStore.set({ status: "success", progress: 100, result, error: null });
    } catch (err) {
      analysisStore.set({
        status: "error",
        progress: 0,
        result: null,
        error: err instanceof Error ? err.message : "Error inesperado durante el análisis",
      });
    } finally {
      setSubmitting(false);
      resetTurnstile();
    }
  }

  function resetTurnstile() {
    setTurnstileToken("");
    if (turnstileSiteKey && window.turnstile) {
      window.turnstile.reset(turnstileWidgetId.current);
    }
  }

  function handleClear() {
    setFile(null);
    setDescripcionPuesto("");
    resetTurnstile();
    resetAnalysis();
  }

  return (
    <form onSubmit={handleSubmit} className="form-card">
      <div className="form-block">
        <label className="block-label">
          <span>PDF CV</span>
          <span>{file ? "Attached" : "Required"}</span>
        </label>

        <div className="upload-zone">
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="file-input"
            aria-label="Subir CV en PDF"
          />
          <div className="upload-inner">
            <div className="upload-icon">↑</div>
            <div className="upload-text">
              <strong>{file ? file.name : "Drop your PDF here"}</strong>
              <span>or click to browse</span>
            </div>
          </div>
        </div>

        {file && <span className="file-chosen">{file.size.toLocaleString()} bytes</span>}
      </div>

      <div className="form-block">
        <label className="block-label">
          <span>Role brief</span>
          <span>{descripcionPuesto.trim().length}/min</span>
        </label>

        <div className="textarea-shell">
          <textarea
            value={descripcionPuesto}
            onChange={(e) => setDescripcionPuesto(e.target.value)}
            rows={11}
            placeholder="Describe the responsibilities, required stack, years of experience, soft skills, and business context..."
            className="job-input"
          />
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" disabled={submitting || Boolean(turnstileSiteKey && !turnstileToken)} className="primary-button">
          {submitting ? "Analyzing..." : "Analyze profile"}
        </button>
        <button type="button" onClick={handleClear} disabled={submitting} className="secondary-button">
          Clear
        </button>
      </div>

      {turnstileSiteKey && <div ref={turnstileContainer} className="turnstile-widget" />}
    </form>
  );
}
