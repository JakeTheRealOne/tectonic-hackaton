# Clarify — Tectonic prototype

A self-contained demo of identifying the right people to fill an organisational knowledge gap.

## Run

Open `dist/index.html` in a browser, or run `python3 -m http.server 5173 --directory dist` and visit http://localhost:5173.

## Demo journey

1. Enter or select: **What should we quote Northstar Retail for a managed-payroll setup for 120 employees in Belgium?**
2. Click Search or press Enter. A simulated search displays three fictional projects with dates, relevance, freshness and similarity tags.
3. Read the unresolved Belgian pricing and implementation gap.
4. Click **Find someone who can clarify**. The browser ranks a five-person fictional pool and shows the top three, with reasons and a score breakdown.
5. **New search** resets the demo for filming.

## What works and what is simulated

- Search is hardcoded for one question; it does not retrieve real documents or call an AI service. Unsupported queries receive an explicit message.
- All people, client data, quotes, expertise assessments and activity records are fictional.
- Candidate ranking is computed locally: 50% context + 30% recency + 20% contribution score. Weights are prototype assumptions.
- Context scores are manually assigned for the specific gap. Recency decreases linearly from 100 to 0 over 365 days, measured as of 30 September 2026. Contribution scores are 10 points per distinct relevant document, capped at 100.
- Match scores are not probabilities of correctness. Repeated copies of a quote are not independent evidence.
- No authentication, uploads, external APIs, telemetry, credentials or real employee records. No external assets are required.
- Browser-agent tools are progressive enhancements and work only where the proposed WebMCP API is supported.

## Submission remaining

A public GitHub repository, a demo video shorter than three minutes, a short description, and Aikido before/after audit screenshots. This prototype has not yet been audited by Aikido.
