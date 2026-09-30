import { PLACEHOLDER_DOCUMENTS } from "./data";

export default function DocumentsPage({ onSearchPerson }) {
  return (
    <section className="flow-page documents-page">
      <header className="flow-header">
        <p className="flow-kicker">Review complete</p>
        <h1>Three documents surfaced</h1>
        <p className="flow-sub">Placeholder boxes — swap this copy later.</p>
      </header>

      <div className="document-grid">
        {PLACEHOLDER_DOCUMENTS.map((doc, index) => (
          <article
            key={doc.id}
            className="document-card"
            style={{ animationDelay: `${0.08 + index * 0.1}s` }}
          >
            <div className="document-index">0{index + 1}</div>
            <h2>{doc.title}</h2>
            <div className="document-box">
              <p>{doc.body}</p>
            </div>
          </article>
        ))}
      </div>

      <div className="flow-actions">
        <button type="button" className="primary-btn" onClick={onSearchPerson}>
          Search a relevant person
        </button>
      </div>
    </section>
  );
}
