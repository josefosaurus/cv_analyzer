import { useStore } from "@nanostores/react";
import { analysisStore } from "../lib/store";
import { getScoreLevel, getRecommendation } from "../lib/scoring";

export default function ResultsPanel() {
  const state = useStore(analysisStore);

  if (state.status === "idle") {
    return (
      <div className="empty-state">
        <div className="note">
          <strong>Ready for review.</strong>
          <br />
          Upload a PDF and describe the role requirements. The matching engine will return a
          structured recommendation with skills, strengths, and gaps.
        </div>
      </div>
    );
  }

  if (state.status === "loading") {
    return (
      <div className="loading-shell">
        <div className="progress-bar" aria-label="Progreso del análisis">
          <span style={{ width: `${state.progress}%` }} />
        </div>
        <p>Evaluating candidate profile... {state.progress}%</p>
      </div>
    );
  }

  if (state.status === "error") {
    return <div className="error-box">⚠️ {state.error}</div>;
  }

  const resultado = state.result!;
  const { nivel, mensaje } = getScoreLevel(resultado.porcentaje_ajuste);
  const recomendacion = getRecommendation(resultado.porcentaje_ajuste);

  return (
    <div className="results-shell">
      <section className="score-card">
        <div className="score-badge">
          <strong>{resultado.porcentaje_ajuste}%</strong>
        </div>

        <div className="score-meta">
          <span className="score-label">Fit score</span>
          <span className="score-status">{nivel}</span>
          <p className="score-text">{mensaje}</p>
        </div>
      </section>

      <section className="data-grid">
        <div className="meta-card">
          <span className="label">Name</span>
          <span className="value">{resultado.nombre_candidato}</span>
        </div>
        <div className="meta-card">
          <span className="label">Experience</span>
          <span className="value">{resultado.experiencia_anos} years</span>
        </div>
      </section>

      <section className="info-card">
        <h3 className="section-title">Education</h3>
        <div className="value">{resultado.educacion}</div>
      </section>

      <section className="info-card">
        <h3 className="section-title">Relevant experience</h3>
        <div className="value">{resultado.experiencia_relevante}</div>
      </section>

      <section className="info-card">
        <h3 className="section-title">Core skills</h3>
        <ul className="skill-list">
          {resultado.habilidades_clave.map((habilidad) => (
            <li key={habilidad}>{habilidad}</li>
          ))}
        </ul>
      </section>

      <section className="data-grid">
        <div className="info-card">
          <h3 className="section-title">Strengths</h3>
          <ul className="check-list">
            {resultado.fortalezas.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </div>

        <div className="info-card">
          <h3 className="section-title">Focus areas</h3>
          <ul className="check-list">
            {resultado.areas_mejora.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="recommendation-card">
        <strong>{recomendacion.title}</strong>
        <p>{recomendacion.body}</p>
      </section>
    </div>
  );
}
