import { useEffect, useState } from 'react';
import {
  ANSWER_METRICS,
  EXPERT_FACTORS,
  ageLabel,
  buildContactMessage,
  formatDate,
  gapCoverage,
  level,
  levelLabel,
  trustOf,
} from './scoring.js';

/* ------------------------------------------------------------------ */
/* Icons (inline SVG, no dependency)                                   */
/* ------------------------------------------------------------------ */

const ICON_PATHS = {
  search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zm10 17-5.2-5.2',
  arrow: 'M5 12h14m-6-6 6 6-6 6',
  back: 'M19 12H5m6 6-6-6 6-6',
  phone: 'M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z',
  mail: 'M4 6h16v12H4zm0 0 8 7 8-7',
  users: 'M16 19v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1m6.5-9a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM21 19v-1a4 4 0 0 0-3-3.8M15.5 3.2a3.5 3.5 0 0 1 0 6.6',
  check: 'M5 12.5 10 17 19 7',
  alert: 'M12 8v5m0 3.5v.5M10.3 3.9 2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z',
  x: 'M6 6l12 12M18 6 6 18',
  doc: 'M7 3h7l5 5v13H7zm7 0v5h5',
  shield: 'M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z',
  chevron: 'm6 9 6 6 6-6',
  copy: 'M9 9h11v11H9zM5 15H4V4h11v1',
  clock: 'M12 7v5l3 2m6-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z',
  link: 'M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1m2 5a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1',
  sparkle: 'M12 3v4m0 10v4M3 12h4m10 0h4M6 6l2.5 2.5m7 7L18 18M6 18l2.5-2.5m7-7L18 6',
};

export function Icon({ name, size = 18, className = '' }) {
  return (
    <svg
      className={`icon ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={ICON_PATHS[name]} />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Small building blocks                                               */
/* ------------------------------------------------------------------ */

export function Gauge({ value, size = 140, stroke = 12, label = 'confidence' }) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setShown(value), 120);
    return () => clearTimeout(t);
  }, [value]);
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className={`gauge tone-${level(value)}`} style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle className="gauge__track" cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} />
        <circle
          className="gauge__fill"
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={stroke}
          strokeDasharray={c}
          strokeDashoffset={c * (1 - shown / 100)}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="gauge__center">
        <span className="gauge__value">{value}</span>
        <span className="gauge__label">{label}</span>
      </div>
    </div>
  );
}

export function ScoreBar({ label, value, hint, weight }) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setShown(value), 150);
    return () => clearTimeout(t);
  }, [value]);
  return (
    <div className="scorebar" title={hint}>
      <div className="scorebar__head">
        <span>
          {label}
          {weight != null && <em className="scorebar__weight">×{weight}</em>}
        </span>
        <strong className={`tone-${level(value)}`}>{value}</strong>
      </div>
      <div className="scorebar__track">
        <div className={`scorebar__fill bg-${level(value)}`} style={{ width: `${shown}%` }} />
      </div>
    </div>
  );
}

export function MiniScore({ label, value }) {
  return (
    <div className="miniscore">
      <span className="miniscore__label">{label}</span>
      <span className={`miniscore__value tone-${level(value)}`}>{value}</span>
      <span className="miniscore__track">
        <span className={`bg-${level(value)}`} style={{ width: `${value}%` }} />
      </span>
    </div>
  );
}

const FLAG_META = {
  verified: { label: 'Verified', tone: 'high', icon: 'check' },
  duplicate: { label: 'Duplicate', tone: 'neutral', icon: 'copy' },
  outdated: { label: 'Outdated', tone: 'medium', icon: 'clock' },
  country: { label: 'Other country', tone: 'medium', icon: 'alert' },
  scope: { label: 'Scope differs', tone: 'medium', icon: 'alert' },
  unowned: { label: 'No owner', tone: 'medium', icon: 'alert' },
  informal: { label: 'Informal', tone: 'low', icon: 'alert' },
  conflict: { label: 'Conflict', tone: 'low', icon: 'alert' },
  missing: { label: 'Gap', tone: 'low', icon: 'alert' },
};

export function Flag({ flag, withText = true }) {
  const meta = FLAG_META[flag.type] ?? FLAG_META.scope;
  return (
    <div className={`flag flag--${meta.tone}`}>
      <span className="flag__tag">
        <Icon name={meta.icon} size={13} />
        {meta.label}
      </span>
      {withText && <span className="flag__text">{flag.text}</span>}
    </div>
  );
}

export function Pill({ tone = 'neutral', children }) {
  return <span className={`pill pill--${tone}`}>{children}</span>;
}

/* ------------------------------------------------------------------ */
/* Answer: call context, answer card, trust panel, signals             */
/* ------------------------------------------------------------------ */

export function CallContext({ context }) {
  return (
    <div className="card call">
      <div className="call__head">
        <span className="call__icon">
          <Icon name="phone" size={16} />
        </span>
        <div>
          <div className="eyebrow">{context.channel}</div>
          <strong>{context.caller}</strong>
        </div>
        <div className="call__chips">
          <Pill>{context.client}</Pill>
          <Pill>{context.country}</Pill>
          <Pill>{context.headcount} employees</Pill>
        </div>
      </div>
      <div className="call__lines">
        {context.transcript.map((line, i) => (
          <div key={i} className={`bubble bubble--${line.who}`}>
            <span className="bubble__who">{line.who === 'client' ? 'Client' : 'You'}</span>
            {line.text}
          </div>
        ))}
      </div>
    </div>
  );
}

export function AnswerCard({ question, onFindExperts, expertsStarted }) {
  const a = question.answer;
  return (
    <div className="card answer">
      <div className="answer__top">
        <div className="eyebrow">
          <Icon name="sparkle" size={14} /> Answer
        </div>
        <span className={`verdict verdict--${a.verdictLevel}`}>
          <Icon name={a.verdictLevel === 'high' ? 'check' : 'alert'} size={15} />
          {a.verdict}
        </span>
      </div>

      <p className="answer__text">{a.text}</p>

      <div className="answer__indicative">
        <span className="eyebrow">Best available indication</span>
        <p>{a.indicative}</p>
      </div>

      <ul className="keypoints">
        {a.keyPoints.map((k, i) => (
          <li key={i} className={`keypoint keypoint--${k.tone}`}>
            <Icon name={k.tone === 'ok' ? 'check' : 'alert'} size={16} />
            <span>{k.text}</span>
          </li>
        ))}
      </ul>

      <div className="gap">
        <div className="gap__head">
          <Icon name="alert" size={18} />
          <strong>Gap to resolve</strong>
        </div>
        <p>{a.gap}</p>
        <div className="gap__items">
          {a.gapItems.map((g) => (
            <Pill key={g} tone="red">
              {g}
            </Pill>
          ))}
        </div>
      </div>

      <div className="answer__actions">
        <button className="btn btn--primary btn--lg" onClick={onFindExperts} disabled={expertsStarted}>
          <Icon name="users" />
          {expertsStarted ? 'Experts found below' : 'Find someone who can clarify'}
        </button>
        <span className="answer__hint">
          Documents are not enough here. We'll rank the colleagues best placed to close this gap.
        </span>
      </div>
    </div>
  );
}

export function TrustPanel({ question }) {
  const a = question.answer;
  const c = a.counts;
  const tiles = [
    { label: 'Extracts', value: c.extracts },
    { label: 'Independent', value: c.independent, tone: c.independent < c.extracts ? 'medium' : 'high' },
    { label: 'Duplicates', value: c.duplicates, tone: c.duplicates ? 'medium' : 'high' },
    { label: 'Conflicts', value: c.conflicts, tone: c.conflicts ? 'low' : 'high' },
    { label: 'Outdated', value: c.outdated, tone: c.outdated ? 'medium' : 'high' },
    { label: 'No owner', value: c.unowned, tone: c.unowned ? 'medium' : 'high' },
  ];
  return (
    <aside className="card trust">
      <div className="eyebrow">
        <Icon name="shield" size={14} /> Trust assessment
      </div>
      <div className="trust__gauge">
        <Gauge value={a.metrics.confidence} />
        <div>
          <div className={`trust__level tone-${level(a.metrics.confidence)}`}>
            {levelLabel(a.metrics.confidence)} confidence
          </div>
          <p className="muted small">
            Combines relevance, reliability, freshness, context fit and coverage, with duplicates counted once.
          </p>
        </div>
      </div>
      <div className="trust__bars">
        {ANSWER_METRICS.map((m) => (
          <ScoreBar key={m.key} label={m.label} value={a.metrics[m.key]} hint={m.hint} />
        ))}
      </div>
      <div className="tiles">
        {tiles.map((t) => (
          <div key={t.label} className="tile">
            <span className={`tile__value ${t.tone ? `tone-${t.tone}` : ''}`}>{t.value}</span>
            <span className="tile__label">{t.label}</span>
          </div>
        ))}
      </div>
      <div className="trust__sources">
        <div className="eyebrow">Searched</div>
        {question.stats.sources.map((s) => (
          <div key={s.name} className="source-row">
            <span>{s.name}</span>
            <span className="muted">{s.count.toLocaleString('en-GB')}</span>
          </div>
        ))}
        <div className="source-row source-row--total">
          <span>{question.stats.documentsScanned.toLocaleString('en-GB')} documents</span>
          <span className="muted">{question.stats.durationSec}s</span>
        </div>
      </div>
    </aside>
  );
}

export function Signals({ signals }) {
  return (
    <div className="card signals">
      <h3 className="section-title">
        <Icon name="alert" /> What the engine detected
      </h3>
      <div className="signals__list">
        {signals.map((s, i) => (
          <Flag key={i} flag={s} />
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Evidence                                                            */
/* ------------------------------------------------------------------ */

export function ExtractCard({ extract }) {
  const trust = trustOf(extract);
  return (
    <div className={`extract ${extract.independent ? '' : 'extract--dup'}`}>
      <div className="extract__head">
        <span className="extract__id">{extract.id}</span>
        <div className="extract__title">
          <strong>{extract.title}</strong>
          <span className="muted small">
            <Icon name="doc" size={13} /> {extract.docType} · {extract.source} · <code>{extract.path}</code>
          </span>
        </div>
        <div className={`extract__trust tone-${level(trust)}`} title="Extract trust = 40% relevance + 35% reliability + 25% freshness">
          <span>{trust}</span>
          <small>trust</small>
        </div>
      </div>

      <blockquote className="extract__quote">“{extract.excerpt}”</blockquote>

      <div className="extract__meta">
        <div>
          <span className="meta-label">Author</span>
          <span>{extract.author.name}</span>
          <span className="muted small">{extract.author.role}</span>
          <span className={`status ${/left|moved|changed/i.test(extract.author.status) ? 'status--warn' : ''}`}>
            {extract.author.status}
          </span>
        </div>
        <div>
          <span className="meta-label">Date</span>
          <span>{formatDate(extract.date)}</span>
          <span className="muted small">{ageLabel(extract.date)}</span>
        </div>
        <div>
          <span className="meta-label">Country</span>
          <span>{extract.country}</span>
        </div>
        <div>
          <span className="meta-label">Owner</span>
          <span className={extract.owner === 'Unassigned' || extract.owner === '—' ? 'tone-low' : ''}>
            {extract.owner === '—' ? 'None' : extract.owner}
          </span>
        </div>
      </div>

      <div className="extract__scores">
        <MiniScore label="Relevance" value={extract.scores.relevance} />
        <MiniScore label="Reliability" value={extract.scores.reliability} />
        <MiniScore label="Freshness" value={extract.scores.freshness} />
      </div>

      <div className="extract__flags">
        {extract.duplicateOf && (
          <div className="flag flag--neutral">
            <span className="flag__tag">
              <Icon name="link" size={13} /> Not independent
            </span>
            <span className="flag__text">Derived from {extract.duplicateOf}</span>
          </div>
        )}
        {extract.flags.map((f, i) => (
          <Flag key={i} flag={f} />
        ))}
      </div>
    </div>
  );
}

export function EvidenceGroup({ group, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen);
  const independent = group.extracts.filter((e) => e.independent).length;
  return (
    <div className={`group ${open ? 'group--open' : ''}`}>
      <button className="group__row" onClick={() => setOpen(!open)} aria-expanded={open}>
        <div className="group__result">
          <span className="group__headline">{group.headline}</span>
          <span className="muted small">{group.meta}</span>
        </div>
        <div className="group__evidence">
          {group.evidenceNote}
          <span className="group__count">
            {group.extracts.length} extract{group.extracts.length > 1 ? 's' : ''} · {independent} independent
          </span>
        </div>
        <div className="group__assessment">
          <span className={`dot bg-${group.assessmentLevel}`} />
          {group.assessment}
        </div>
        <Icon name="chevron" className="group__chevron" />
      </button>
      {open && (
        <div className="group__body">
          {group.extracts.map((e) => (
            <ExtractCard key={e.id} extract={e} />
          ))}
        </div>
      )}
    </div>
  );
}

export function Evidence({ question }) {
  return (
    <div className="card evidence">
      <h3 className="section-title">
        <Icon name="doc" /> {question.groupsTitle}
      </h3>
      <div className="group__header">
        <span>Result</span>
        <span>Evidence</span>
        <span>Assessment</span>
        <span />
      </div>
      {question.groups.map((g, i) => (
        <EvidenceGroup key={g.id} group={g} defaultOpen={i === question.groups.length - 1} />
      ))}
      <p className="muted small evidence__note">
        Click a row to open the extracts with author, date, owner and per-extract scores. Extracts marked “not
        independent” repeat an earlier source and are counted once.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Experts                                                             */
/* ------------------------------------------------------------------ */

export function StepList({ steps, current }) {
  return (
    <ul className="steps">
      {steps.map((s, i) => (
        <li key={s} className={`step ${i < current ? 'step--done' : i === current ? 'step--active' : ''}`}>
          <span className="step__marker">{i < current ? <Icon name="check" size={13} /> : i + 1}</span>
          {s}
        </li>
      ))}
    </ul>
  );
}

function CopyField({ icon, value, href }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      /* clipboard unavailable — ignore in demo */
    }
  };
  return (
    <div className="copyfield">
      <Icon name={icon} size={15} />
      <a href={href}>{value}</a>
      <button className="copyfield__btn" onClick={copy} title="Copy">
        {copied ? <Icon name="check" size={14} /> : <Icon name="copy" size={14} />}
      </button>
    </div>
  );
}

export function ExpertCard({ expert, rank, onContact }) {
  const [showWhy, setShowWhy] = useState(rank === 1);
  return (
    <div className={`expert ${rank === 1 ? 'expert--top' : ''}`} style={{ animationDelay: `${(rank - 1) * 140}ms` }}>
      <div className="expert__rank">#{rank}</div>
      {rank === 1 && <div className="expert__badge">Best match</div>}

      <div className="expert__head">
        <div className="avatar">{expert.initials}</div>
        <div className="expert__id">
          <strong className="expert__name">{expert.name}</strong>
          <span>{expert.role}</span>
          <span className="muted small">
            {expert.team} · {expert.location}
          </span>
        </div>
        <Gauge value={expert.score} size={84} stroke={8} label="pertinence" />
      </div>

      <div className={`availability availability--${expert.availability.status}`}>
        <span className="dot" /> {expert.availability.note}
      </div>

      <div className="expert__contact">
        <CopyField icon="mail" value={expert.email} href={`mailto:${expert.email}`} />
        <CopyField icon="phone" value={expert.phone} href={`tel:${expert.phone.replace(/\s/g, '')}`} />
        <div className="langs">
          {expert.languages.map((l) => (
            <span key={l} className="lang">
              {l}
            </span>
          ))}
        </div>
      </div>

      <div className="expert__section">
        <div className="eyebrow">Why this person</div>
        <ul className="reasons">
          {expert.reasons.map((r) => (
            <li key={r}>
              <Icon name="check" size={14} />
              {r}
            </li>
          ))}
        </ul>
      </div>

      <div className="expert__section">
        <div className="eyebrow">Can close</div>
        <div className="chips">
          {expert.covers.map((c) => (
            <Pill key={c} tone="red">
              {c}
            </Pill>
          ))}
          {expert.linkedEvidence.map((e) => (
            <Pill key={e}>Source {e}</Pill>
          ))}
        </div>
      </div>

      <button className="linkbtn" onClick={() => setShowWhy(!showWhy)}>
        {showWhy ? 'Hide' : 'Show'} score breakdown
        <Icon name="chevron" size={14} className={showWhy ? 'rot180' : ''} />
      </button>
      {showWhy && (
        <div className="expert__factors">
          {EXPERT_FACTORS.map((f) => (
            <ScoreBar key={f.key} label={f.label} value={expert.factors[f.key]} hint={f.hint} weight={f.weight} />
          ))}
        </div>
      )}

      <div className="expert__actions">
        <button className="btn btn--primary" onClick={() => onContact(expert)}>
          <Icon name="mail" size={16} /> Draft message
        </button>
        <a className="btn btn--ghost" href={`tel:${expert.phone.replace(/\s/g, '')}`}>
          <Icon name="phone" size={16} /> Call
        </a>
      </div>
    </div>
  );
}

export function ExpertsSection({ question, experts, phase, stepIndex, onContact }) {
  if (phase === 'idle') return null;

  if (phase === 'searching') {
    return (
      <section className="card experts experts--loading" id="experts">
        <div className="loader-ring" />
        <h3>Looking for the right people…</h3>
        <StepList steps={question.expertSearchSteps} current={stepIndex} />
      </section>
    );
  }

  const coverage = gapCoverage(question.answer.gapItems, experts);
  const covered = coverage.filter((c) => c.by.length).length;

  return (
    <section className="experts-done" id="experts">
      <div className="experts__intro">
        <div>
          <div className="eyebrow eyebrow--red">Who to contact for clarification</div>
          <h2>3 colleagues who can close this gap</h2>
          <p className="muted">
            Ranked by pertinence to the <strong>open gap</strong>, not just the topic. Authors of weak or outdated
            evidence are not automatically the best people to ask.
          </p>
        </div>
        <div className="coverage card">
          <div className="eyebrow">Gap coverage</div>
          <div className="coverage__score">
            {covered}/{coverage.length}
            <span className="muted small"> open points covered</span>
          </div>
          {coverage.map((c) => (
            <div key={c.item} className="coverage__row">
              <Icon name={c.by.length ? 'check' : 'x'} size={14} className={c.by.length ? 'tone-high' : 'tone-low'} />
              <span>{c.item}</span>
              <span className="muted small">{c.by.map((n) => n.split(' ')[0]).join(', ') || '—'}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="experts__grid">
        {experts.map((e, i) => (
          <ExpertCard key={e.id} expert={e} rank={i + 1} onContact={onContact} />
        ))}
      </div>

      <div className="card method">
        <div>
          <div className="eyebrow">How pertinence is scored</div>
          <div className="method__weights">
            {EXPERT_FACTORS.map((f) => (
              <div key={f.key} className="method__weight">
                <strong>{Math.round(f.weight * 100)}%</strong>
                <span>{f.label}</span>
                <small className="muted">{f.hint}</small>
              </div>
            ))}
          </div>
        </div>
        {question.notRecommended.length > 0 && (
          <div className="method__excluded">
            <div className="eyebrow">Considered, not recommended</div>
            {question.notRecommended.map((p) => (
              <div key={p.name} className="excluded">
                <div className="avatar avatar--sm avatar--muted">
                  {p.name
                    .split(' ')
                    .map((w) => w[0])
                    .join('')}
                </div>
                <div>
                  <strong>{p.name}</strong> <span className="muted small">· {p.role}</span>
                  <p className="small">{p.reason}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export function ContactModal({ question, expert, onClose }) {
  const [text, setText] = useState(() => buildContactMessage(question, expert));
  const [copied, setCopied] = useState(false);
  const subject = `Question on ${question.context.client}: ${question.shortTitle}`;

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="modal__backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="modal__head">
          <div className="avatar">{expert.initials}</div>
          <div>
            <div className="eyebrow">Message to</div>
            <strong>{expert.name}</strong> <span className="muted small">· {expert.email}</span>
          </div>
          <button className="iconbtn" onClick={onClose} aria-label="Close">
            <Icon name="x" />
          </button>
        </div>
        <div className="modal__subject">
          <span className="meta-label">Subject</span>
          {subject}
        </div>
        <textarea className="modal__text" value={text} onChange={(e) => setText(e.target.value)} rows={16} />
        <p className="muted small">
          Pre-filled with the question, the evidence found and the open gap, so the expert doesn't have to redo the
          search.
        </p>
        <div className="modal__actions">
          <button className="btn btn--ghost" onClick={copy}>
            <Icon name={copied ? 'check' : 'copy'} size={16} /> {copied ? 'Copied' : 'Copy text'}
          </button>
          <a
            className="btn btn--primary"
            href={`mailto:${expert.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`}
          >
            <Icon name="mail" size={16} /> Open in mail app
          </a>
        </div>
      </div>
    </div>
  );
}
