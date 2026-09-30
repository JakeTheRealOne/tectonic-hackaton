# Knowledge Compass — SD Worx challenge (proof of concept)

**Find it. Understand it. Trust it.** An SD Worx employee gets a client question they can't answer. They search the company knowledge base. The engine returns an answer with **visible trust signals** (relevance, reliability, freshness, context fit, duplicates, conflicts, owners). When documents are not enough, one click on **“Find someone who can clarify”** ranks the **3 most pertinent colleagues** to close the open gap, with contact details and a pre-filled message.

> Tectonic Hackathon · Team BelgianEast · All clients, people, documents and figures are fictional.

---

## How to run it

The app is a static React website (Vite). There is **no backend and no database**. The only "server" you need is the small development server Vite provides, or any static file host.

### Requirement: Node.js

Install **Node.js 18 or newer** (LTS recommended) from https://nodejs.org. This also installs `npm`. To check:

```bash
node --version
npm --version
```

### Option A — Run it on your own computer (development mode)

```bash
git clone <repo-url>
cd <repo-folder>/Petros_solution
npm install        # only the first time, downloads React and Vite into node_modules/
npm run dev
```

Open the URL shown in the terminal, usually **http://localhost:5173**. Stop the server with `Ctrl + C`.

### Option B — Open it from another device on the same Wi-Fi (phone, laptop of a teammate)

On the computer that runs the code:

```bash
npm run dev -- --host
```

Vite prints two addresses:

```
➜  Local:   http://localhost:5173/
➜  Network: http://192.168.x.x:5173/
```

On the other device (connected to the **same network**), open the **Network** address.
If it doesn't load, Windows Firewall is probably blocking it: allow Node.js on *private networks* when Windows asks, or temporarily switch the Wi-Fi profile to *Private*. Public or guest Wi-Fi (e.g. at the hackathon venue) may block device-to-device traffic entirely. In that case, use Option D.

### Option C — Production build (faster, what you would deploy)

```bash
npm run build      # creates the dist/ folder (plain HTML, CSS and JS)
npm run preview    # serves dist/ at http://localhost:4173
```

Add `-- --host` to `npm run preview` to share it on the network as in Option B.

> Opening `dist/index.html` by double-clicking it does **not** work, because browsers block JavaScript modules on `file://`. Always serve it through `npm run preview` or a host.

### Option D — Put it online (any device, anywhere)

Because `dist/` is just static files, any free static host works:

| Host | How |
|---|---|
| **Netlify Drop** (fastest) | Run `npm run build`, then drag the `dist/` folder onto https://app.netlify.com/drop |
| **Vercel** | Import the GitHub repo, set *Root directory* = `Petros_solution`. It detects Vite automatically |
| **GitHub Pages** | Build, then publish the contents of `dist/` (for example with the `gh-pages` package or a GitHub Action) |

The build uses relative paths (`base: './'` in `vite.config.js`), so it works from a sub-URL such as `username.github.io/repo/`.

---

## Using the demo

The search is **hardcoded** for 3 scenarios. Click one of the 3 call cards on the home page, or type a question containing **at least 2 keywords** of a scenario:

| Scenario | Example question | Keywords |
|---|---|---|
| Northstar setup quote | *What should we quote Northstar Retail for a managed-payroll setup for 120 employees in Belgium?* | northstar, quote, price, setup, fee, cost, estimate, managed, payroll, 120 |
| Brightwave cross-border telework | *Can Brightwave Logistics pay a tax-free home-office allowance to staff living in France?* | brightwave, telework, home office, allowance, tax-free, france, french, cross-border |
| Veldhoven inherited client | *Is the split year-end bonus arrangement for Veldhoven Foods still active this December?* | veldhoven, bonus, year-end, split, december, handover, inherited |

Any other question shows a message asking you to pick one of the scenarios.

### Flow

1. **Search.** A large search box, plus the 3 incoming client calls.
2. **Loading.** An animation shows the search steps and the number of documents scanned.
3. **Answer page:**
   - the call context and the answer, with a **verdict** and the **gap to resolve**
   - the **trust panel**: a confidence gauge, 5 metrics, and counts of independent sources, duplicates, conflicts, outdated and unowned documents
   - the **evidence table**; click a row to open each extract with author, date, owner, country, and relevance/reliability/freshness scores
   - the **signals** the engine detected (conflicts, gaps, outdated documents)
4. **Find someone who can clarify.** Shows 3 ranked experts, each with:
   - a pertinence score and its factor breakdown
   - email, phone, availability and languages
   - the gap items they can close
   - a **Draft message** button, with the question, evidence and gap pre-filled

   The page also shows how many gap items the 3 experts cover together, and the people who were **considered but not recommended**, with the reason.

---

## What is real and what is mocked

- **Mocked:** the search itself. The extracts, their scores and the final answers are hardcoded in `src/data/*.json`, because a real AI search engine was out of scope for the time slot.
- **Computed** in `src/scoring.js`:
  - Expert pertinence = expertise 30% + country/client fit 25% + link to the evidence 20% + recent involvement 15% + availability 10%
  - Extract trust = 40% relevance + 35% reliability + 25% freshness
  - Gap coverage = which open points each recommended expert can close
- **Security:** no backend, no login, no API keys, no real personal data. Emails use the reserved `.example` domain. Being a presentation mockup, it has no access control.

## Project structure

```
Petros_solution/
  index.html          page shell, fonts
  package.json        scripts: dev / build / preview
  vite.config.js      Vite + React config
  src/
    main.jsx          React entry point
    App.jsx           header, home (search box), loading, answer view, app state
    components.jsx    trust panel, evidence and extracts, expert cards, contact modal
    scoring.js        expert ranking, question matching, formatting helpers
    styles.css        SD Worx-inspired styling
    data/
      q1_northstar_setup_pricing.json
      q2_brightwave_crossborder_telework.json
      q3_veldhoven_bonus_handover.json
```

### Adding a scenario

Copy one of the JSON files in `src/data/`, change its content and keywords, and add it to the `QUESTIONS` array at the top of `src/App.jsx`.

## Unfinished / out of scope

- No real search or AI. Answers exist only for the 3 scenarios.
- The "History" and "Expert directory" links in the header are placeholders.
- No authentication or authorization (presentation mockup only).
