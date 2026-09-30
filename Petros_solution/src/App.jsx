import { useEffect, useRef, useState } from 'react';
import q1 from './data/q1_northstar_setup_pricing.json';
import q2 from './data/q2_brightwave_crossborder_telework.json';
import q3 from './data/q3_veldhoven_bonus_handover.json';
import { matchQuestion, rankExperts } from './scoring.js';
import {
  AnswerCard,
  CallContext,
  ContactModal,
  Evidence,
  ExpertsSection,
  Icon,
  Signals,
  StepList,
  TrustPanel,
} from './components.jsx';

const QUESTIONS = [q1, q2, q3];
const STEP_MS = 700;

/* ------------------------------------------------------------------ */
/* Header                                                              */
/* ------------------------------------------------------------------ */

function Header({ onHome }) {
  return (
    <header className="header">
      <div className="header__inner">
        <button className="brand" onClick={onHome}>
          <span className="brand__logo">
            SD<span>Worx</span>
          </span>
          <span className="brand__divider" />
          <span className="brand__product">Knowledge Compass</span>
        </button>
        <nav className="nav">
          <button className="nav__link nav__link--active" onClick={onHome}>
            Search
          </button>
          <span className="nav__link">History</span>
          <span className="nav__link">Expert directory</span>
        </nav>
        <div className="user">
          <div className="user__text">
            <strong>Lena Martens</strong>
            <span>Payroll Consultant · BE</span>
          </div>
          <div className="avatar avatar--sm">LM</div>
        </div>
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------ */
/* Home: the big search box                                            */
/* ------------------------------------------------------------------ */

function Home({ onSearch, notFound }) {
  const [text, setText] = useState('');
  const inputRef = useRef(null);

  useEffect(() => inputRef.current?.focus(), []);

  const submit = (e) => {
    e?.preventDefault();
    if (text.trim()) onSearch(text.trim());
  };

  return (
    <main className="home">
      <div className="home__blob home__blob--1" />
      <div className="home__blob home__blob--2" />

      <section className="hero">
        <div className="eyebrow eyebrow--red">Find it. Understand it. Trust it.</div>
        <h1>
          What does your client <span className="accent">need to know?</span>
        </h1>
        <p className="hero__sub">
          Search proposals, policies, tickets and chats. Every answer shows its sources, how fresh and reliable they
          are, and who to ask when documents are not enough.
        </p>

        <form className="searchbox" onSubmit={submit}>
          <textarea
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) submit(e);
            }}
            placeholder="Ask a question about a client, a country rule or a past project…"
            rows={3}
          />
          <div className="searchbox__bar">
            <div className="searchbox__scopes">
              <span className="scope scope--on">All sources</span>
              <span className="scope">Belgium</span>
              <span className="scope">Last 3 years</span>
            </div>
            <button className="btn btn--primary btn--round" type="submit" disabled={!text.trim()} aria-label="Search">
              <Icon name="arrow" />
            </button>
          </div>
        </form>

        {notFound && (
          <div className="notfound">
            <Icon name="alert" size={16} />
            This demo only covers the scenarios below. Pick one to see the full flow.
          </div>
        )}
      </section>

      <section className="scenarios">
        <div className="scenarios__title">
          <span className="eyebrow">Incoming client questions (demo scenarios)</span>
        </div>
        <div className="scenarios__grid">
          {QUESTIONS.map((q) => (
            <button key={q.id} className="scenario" onClick={() => onSearch(q.question, q)}>
              <div className="scenario__top">
                <span className="scenario__icon">
                  <Icon name="phone" size={15} />
                </span>
                <span className="muted small">{q.context.caller}</span>
              </div>
              <p className="scenario__quote">“{q.context.transcript[0].text}”</p>
              <div className="scenario__question">
                <Icon name="search" size={15} />
                {q.question}
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="pledges">
        {[
          ['doc', 'Sources, not summaries', 'Every claim links to an extract, its author, date and owner.'],
          ['shield', 'Trust made visible', 'Relevance, reliability, freshness and conflicts are scored openly.'],
          ['users', 'People when docs fall short', 'Find the colleague who can actually close the gap.'],
        ].map(([icon, title, text]) => (
          <div key={title} className="pledge">
            <span className="pledge__icon">
              <Icon name={icon} />
            </span>
            <strong>{title}</strong>
            <p className="muted small">{text}</p>
          </div>
        ))}
      </section>
    </main>
  );
}

/* ------------------------------------------------------------------ */
/* Searching: short loading animation                                  */
/* ------------------------------------------------------------------ */

function SearchingView({ question, query, onDone }) {
  const [step, setStep] = useState(0);
  const [docs, setDocs] = useState(0);
  const total = question.searchSteps.length;
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    if (step >= total) {
      const t = setTimeout(() => doneRef.current(), 350);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setStep((s) => s + 1), STEP_MS);
    return () => clearTimeout(t);
  }, [step, total]);

  useEffect(() => {
    const target = question.stats.documentsScanned;
    const id = setInterval(() => {
      setDocs((d) => {
        const next = d + Math.ceil(target / 40);
        if (next >= target) {
          clearInterval(id);
          return target;
        }
        return next;
      });
    }, (STEP_MS * total) / 45);
    return () => clearInterval(id);
  }, [question, total]);

  return (
    <main className="searching">
      <div className="searching__query">
        <Icon name="search" />
        {query}
      </div>
      <div className="card searching__card">
        <div className="loader-ring loader-ring--lg" />
        <h2>{question.searchSteps[Math.min(step, total - 1)]}</h2>
        <div className="progress">
          <div className="progress__fill" style={{ width: `${(step / total) * 100}%` }} />
        </div>
        <div className="searching__counter">
          <strong>{docs.toLocaleString('en-GB')}</strong> documents scanned
        </div>
        <StepList steps={question.searchSteps} current={step} />
      </div>
    </main>
  );
}

/* ------------------------------------------------------------------ */
/* Answer view                                                         */
/* ------------------------------------------------------------------ */

function AnswerView({ question, query, onNewSearch }) {
  const [expertsPhase, setExpertsPhase] = useState('idle');
  const [expertStep, setExpertStep] = useState(0);
  const [contact, setContact] = useState(null);
  const experts = rankExperts(question.experts);

  useEffect(() => {
    if (expertsPhase !== 'searching') return;
    const total = question.expertSearchSteps.length;
    if (expertStep >= total) {
      const t = setTimeout(() => setExpertsPhase('done'), 300);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setExpertStep((s) => s + 1), 550);
    return () => clearTimeout(t);
  }, [expertsPhase, expertStep, question]);

  useEffect(() => {
    if (expertsPhase === 'idle') return;
    const el = document.getElementById('experts');
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [expertsPhase]);

  return (
    <main className="answer-view">
      <div className="answer-view__top">
        <button className="linkbtn" onClick={onNewSearch}>
          <Icon name="back" size={16} /> New search
        </button>
        <div className="querybar">
          <Icon name="search" />
          <span>{query}</span>
          <span className="querybar__meta">
            {question.stats.documentsScanned.toLocaleString('en-GB')} documents · {question.stats.extractsKept}{' '}
            extracts kept · {question.stats.durationSec}s
          </span>
        </div>
      </div>

      <div className="layout">
        <div className="layout__main">
          <CallContext context={question.context} />
          <AnswerCard
            question={question}
            expertsStarted={expertsPhase !== 'idle'}
            onFindExperts={() => {
              setExpertStep(0);
              setExpertsPhase('searching');
            }}
          />
          <Evidence question={question} />
          <Signals signals={question.signals} />
        </div>
        <div className="layout__side">
          <TrustPanel question={question} />
        </div>
      </div>

      <ExpertsSection
        question={question}
        experts={experts}
        phase={expertsPhase}
        stepIndex={expertStep}
        onContact={setContact}
      />

      {contact && <ContactModal question={question} expert={contact} onClose={() => setContact(null)} />}
    </main>
  );
}

/* ------------------------------------------------------------------ */
/* App                                                                 */
/* ------------------------------------------------------------------ */

export default function App() {
  const [phase, setPhase] = useState('home');
  const [active, setActive] = useState(null);
  const [query, setQuery] = useState('');
  const [notFound, setNotFound] = useState(false);

  const search = (text, forced) => {
    const q = forced ?? matchQuestion(text, QUESTIONS);
    if (!q) {
      setNotFound(true);
      return;
    }
    setNotFound(false);
    setActive(q);
    setQuery(text);
    setPhase('searching');
    window.scrollTo({ top: 0 });
  };

  const goHome = () => {
    setPhase('home');
    setActive(null);
    window.scrollTo({ top: 0 });
  };

  return (
    <div className="app">
      <Header onHome={goHome} />
      {phase === 'home' && <Home onSearch={search} notFound={notFound} />}
      {phase === 'searching' && (
        <SearchingView question={active} query={query} onDone={() => setPhase('answer')} />
      )}
      {phase === 'answer' && <AnswerView key={active.id} question={active} query={query} onNewSearch={goHome} />}
      <footer className="footer">
        Knowledge Compass · Proof of concept for the Tectonic Hackathon · All clients, people, documents and figures
        are fictional
      </footer>
    </div>
  );
}
