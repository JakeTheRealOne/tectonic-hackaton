import { useMemo, useRef, useState } from "react";
import { PLACEHOLDER_PEOPLE } from "./data";

const SWIPE_THRESHOLD = 110;

export default function PeopleSwipePage({ onBack }) {
  const [people, setPeople] = useState(PLACEHOLDER_PEOPLE);
  const [drag, setDrag] = useState({ x: 0, y: 0, active: false });
  const [exit, setExit] = useState(null);
  const pointerIdRef = useRef(null);
  const startRef = useRef({ x: 0, y: 0 });

  const current = people[0] ?? null;
  const next = people[1] ?? null;

  const rotation = drag.x / 18;
  // User request: left = green, right = red
  const leftIntent = drag.x < -24;
  const rightIntent = drag.x > 24;

  const status = useMemo(() => {
    if (!current) return "done";
    if (exit === "left" || leftIntent) return "keep";
    if (exit === "right" || rightIntent) return "pass";
    return "idle";
  }, [current, exit, leftIntent, rightIntent]);

  function finishSwipe(direction) {
    setExit(direction);
    window.setTimeout(() => {
      setPeople((prev) => prev.slice(1));
      setExit(null);
      setDrag({ x: 0, y: 0, active: false });
    }, 280);
  }

  function onPointerDown(event) {
    if (!current || exit) return;
    pointerIdRef.current = event.pointerId;
    event.currentTarget.setPointerCapture(event.pointerId);
    startRef.current = { x: event.clientX, y: event.clientY };
    setDrag({ x: 0, y: 0, active: true });
  }

  function onPointerMove(event) {
    if (!drag.active || pointerIdRef.current !== event.pointerId) return;
    const x = event.clientX - startRef.current.x;
    const y = (event.clientY - startRef.current.y) * 0.35;
    setDrag({ x, y, active: true });
  }

  function onPointerUp(event) {
    if (pointerIdRef.current !== event.pointerId) return;
    pointerIdRef.current = null;
    if (Math.abs(drag.x) >= SWIPE_THRESHOLD) {
      finishSwipe(drag.x < 0 ? "left" : "right");
      return;
    }
    setDrag({ x: 0, y: 0, active: false });
  }

  return (
    <section className="flow-page people-page">
      <header className="flow-header people-header">
        <button type="button" className="ghost-btn" onClick={onBack}>
          Back to documents
        </button>
        <div>
          <p className="flow-kicker">Relevant people</p>
          <h1>Swipe a colleague</h1>
          <p className="flow-sub">Left keeps them (green) · Right passes (red)</p>
        </div>
      </header>

      <div className={`swipe-stage status-${status}`}>
        <div className="swipe-hint left-hint">Keep</div>
        <div className="swipe-hint right-hint">Pass</div>

        {!current ? (
          <div className="swipe-empty">
            <h2>Deck complete</h2>
            <p>You’ve reviewed every suggested colleague.</p>
            <button
              type="button"
              className="primary-btn"
              onClick={() => setPeople(PLACEHOLDER_PEOPLE)}
            >
              Reset deck
            </button>
          </div>
        ) : (
          <div className="card-stack">
            {next ? (
              <article className="person-card person-card-next" aria-hidden="true">
                <PersonContent person={next} />
              </article>
            ) : null}

            <article
              className={`person-card person-card-top ${exit ? `exit-${exit}` : ""} ${
                drag.active ? "dragging" : ""
              }`}
              style={
                exit
                  ? undefined
                  : {
                      transform: `translate(${drag.x}px, ${drag.y}px) rotate(${rotation}deg)`,
                      transition: drag.active ? "none" : "transform 0.25s ease",
                    }
              }
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
            >
              <div className={`stamp stamp-keep ${leftIntent || exit === "left" ? "visible" : ""}`}>
                Keep
              </div>
              <div className={`stamp stamp-pass ${rightIntent || exit === "right" ? "visible" : ""}`}>
                Pass
              </div>
              <PersonContent person={current} />
            </article>
          </div>
        )}
      </div>

      {current ? (
        <div className="swipe-controls">
          <button
            type="button"
            className="round-btn keep-btn"
            onClick={() => finishSwipe("left")}
            aria-label="Swipe left keep"
          >
            Keep
          </button>
          <button
            type="button"
            className="round-btn pass-btn"
            onClick={() => finishSwipe("right")}
            aria-label="Swipe right pass"
          >
            Pass
          </button>
        </div>
      ) : null}
    </section>
  );
}

function PersonContent({ person }) {
  return (
    <>
      <div className="person-avatar" aria-hidden="true">
        {person.name
          .split(" ")
          .map((part) => part[0])
          .join("")
          .slice(0, 2)}
      </div>
      <div className="person-body">
        <h2>{person.name}</h2>
        <p className="person-role">{person.role}</p>
        <dl className="person-attrs">
          <div>
            <dt>Department</dt>
            <dd>{person.department}</dd>
          </div>
          <div>
            <dt>Location</dt>
            <dd>{person.location}</dd>
          </div>
          <div>
            <dt>Experience</dt>
            <dd>{person.years} years</dd>
          </div>
        </dl>
        <ul className="person-skills">
          {person.skills.map((skill) => (
            <li key={skill}>{skill}</li>
          ))}
        </ul>
        <p className="person-blurb">{person.blurb}</p>
      </div>
    </>
  );
}
