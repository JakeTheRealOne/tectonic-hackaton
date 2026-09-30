# Knowledge Compass — SD Worx challenge (proof of concept)

**Find it. Understand it. Trust it.** An SD Worx employee gets a client question they can't answer. They search the company knowledge base. The engine returns an answer with **visible trust signals** (relevance, reliability, freshness, context fit, duplicates, conflicts, owners). When documents are not enough, one click on **“Find someone who can clarify”** ranks the **3 most pertinent colleagues** to close the open gap, with contact details and a pre-filled message.

## Run it

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually http://localhost:5173).

## Demo flow

1. Pick one of the 3 incoming client calls on the home page, or type a question (keywords are matched to a scenario).
2. A short loading animation shows the search steps.
3. The answer page shows:
   - the call context and the answer, with a verdict and the gap to resolve
   - the trust panel: a confidence gauge, 5 metrics, and counts of duplicates, conflicts, outdated and unowned sources
   - the evidence table; click a row to see each extract with author, date, owner, country, and relevance/reliability/freshness scores
   - the signals the engine detected
4. **Find someone who can clarify** shows 3 ranked experts with a pertinence score, a factor breakdown, email and phone, availability, the gap items each one can close, and a draft message. It also lists people who were considered but not recommended, with the reason.

## Scenarios (all fictional)

| File | Scenario | Trust problem shown |
|---|---|---|
| `src/data/q1_northstar_setup_pricing.json` | Setup quote for Northstar Retail, 120 employees, Belgium | Comparables from other countries; repeated quotes are not independent |
| `src/data/q2_brightwave_crossborder_telework.json` | Home-office allowance for French-resident staff | A Teams claim contradicts an outdated, unowned guideline |
| `src/data/q3_veldhoven_bonus_handover.json` | Inherited client: is the split bonus still active? | A handover document contradicts the live config; the approval email is missing |

## What is real and what is mocked

- **Mocked:** the search itself. The extracts, scores and final answers are hardcoded in the JSON files, because a real AI search engine was out of scope for the time slot.
- **Computed:** expert pertinence = weighted sum of 5 factors (`src/scoring.js`: expertise 30%, country/client fit 25%, link to evidence 20%, recency 15%, availability 10%). Extract trust = 40% relevance + 35% reliability + 25% freshness. Gap coverage is computed from what each expert can close.
- No backend, no authentication, no real personal data. Emails use the reserved `.example` domain.

## Structure

```
src/
  App.jsx          header, home (search box), loading, answer view, app state
  components.jsx   trust panel, evidence and extracts, expert cards, contact modal
  scoring.js       expert ranking, question matching, formatting helpers
  styles.css       SD Worx-inspired styling
  data/*.json      the 3 hardcoded research scenarios
```
