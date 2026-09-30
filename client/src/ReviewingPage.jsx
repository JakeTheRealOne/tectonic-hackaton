import { useEffect } from "react";
import { REVIEW_FILES } from "./data";

export default function ReviewingPage({ onComplete, durationMs = 5000 }) {
  useEffect(() => {
    const timer = window.setTimeout(() => onComplete(), durationMs);
    return () => window.clearTimeout(timer);
  }, [durationMs, onComplete]);

  return (
    <section className="flow-page reviewing-page">
      <div className="reviewing-orbit" aria-hidden="true">
        {REVIEW_FILES.map((name, index) => (
          <div
            key={name}
            className="orbit-file"
            style={{
              "--i": index,
              "--count": REVIEW_FILES.length,
              animationDelay: `${index * 0.12}s`,
            }}
          >
            <div className="orbit-file-inner">
              <span className="orbit-file-ext">{name.split(".").pop()}</span>
              <span className="orbit-file-name">{name}</span>
            </div>
          </div>
        ))}
        <div className="orbit-core">
          <span className="orbit-pulse" />
          <span className="orbit-pulse delay" />
        </div>
      </div>

      <div className="reviewing-copy">
        <p className="flow-kicker">Search running</p>
        <h1>Reviewing the documents in process</h1>
        <p className="flow-sub">
          Files are being cross-checked and spun through the corpus. Hang tight…
        </p>
        <div className="progress-track" aria-hidden="true">
          <div className="progress-bar" style={{ animationDuration: `${durationMs}ms` }} />
        </div>
      </div>
    </section>
  );
}
