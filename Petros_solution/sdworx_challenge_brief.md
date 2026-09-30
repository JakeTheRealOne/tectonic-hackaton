# Tectonic Hackathon — SD Worx Challenge: Brief for Handoff

> Source: "Tectonic Hackathon – Participants Guide" (13-page PDF, Canva). The SD Worx challenge page was image-only and was read visually. KBC challenge content is deliberately excluded.
> Context: the user's team (Petro + teammates) has chosen the **SD Worx** challenge. Team size, time-slot length, and chosen direction are **not yet known**.

---

## 1. Challenge

**Title:** *Unlock the Knowledge Within — Find it. Understand it. Trust it.*

**Core question (verbatim):** "How might we turn fragmented organisational knowledge into a trusted shared resource?"

**Task:** Build a **focused proof of concept** that makes organisational knowledge easier to **find, trust or share**. Choose **one meaningful problem**; there is no need to solve everything.

### About SD Worx (as stated)
- HR, payroll and workforce operations across Europe; 80+ years old.
- 10,000+ employees, 100,000+ customers, 6M+ payslips; payroll reach into 100+ countries.
- Scale = great expertise, but knowledge becomes harder to navigate.

### The problem as framed
- Knowledge lives in policies, manuals, procedures, checklists, analyses, emails, chats, Teams channels, shared files, workflows, business applications, operational data, and in experts' heads.
- **Finding information is only the first step.** An AI assistant can summarise ten documents; the hard question is whether an answer is **reliable, current, and relevant to this customer / country / situation**.
- They call this "fundamentally a **trust problem**". A good solution shows not just an answer but **why it deserves confidence, where uncertainty remains, and who can help when documents are not enough**.

### Scenarios given in the brief ("real stories, real friction")
1. Urgent customer question. An AI assistant finds three documents: one recently updated, one with no owner, one possibly for another country. A colleague then shares contradictory information in a Teams conversation. The employee has information but still cannot act with confidence.
2. A payroll consultant inherits a client portfolio. Years ago a handover was one document plus a one-hour conversation. Today, knowledge is spread across documents, chats, workflows, apps, business data and experts in different teams.

### Questions the solution should help answer
What is reliable? What is current? What applies in this context? Where are the gaps? Who has relevant expertise? Which answer should a person trust?

### Inspiration areas (inspiration, not a checklist)
| Area | Question |
|---|---|
| **Trust** | How might people recognise whether information is relevant and reliable? |
| **Capture** | How might valuable knowledge become accessible beyond inboxes, documents and siloed teams? |
| **Detect** | How might conflicting, duplicated, missing or outdated knowledge become visible? |
| **Connect** | How might people find the right expertise when documents are not enough? |

### Guidance on approach
- **Do not start with prescribed technology.** Start with the moment of doubt, friction or uncertainty to change.
- Focus on **one role, one workflow, one knowledge source, or one trust signal**.
- Make the moment of doubt **tangible**, then show how the PoC moves someone from **"I found something" to "I understand why I can rely on it."**
- Strongest ideas will **not hide complexity behind a black box**; they make trust **visible, explainable and useful**.
- Combine technical ingenuity with a deep understanding of human behaviour. "Build something bold."

---

## 2. Judging

| Criterion | Meaning in the guide |
|---|---|
| Creativity | How original is the idea? |
| Technical ability | Does it work? |
| Fit | Did you solve the challenge? |
| Security | How secure is it? |

- Weights are **not stated** except Aikido: the security audit is **10% of the submission assessment**.
- Implication: a plain "chatbot over documents" is exactly what the brief says is insufficient.

---

## 3. Submission (Builderbase platform)

One team member logs in and fills the overview fields:
- Short description
- **Demo video under 3 minutes**
- GitHub repo link
- **Aikido screenshots (before and after)**

### Rules & fair play (relevant points)
- Build only within the official hackathon time slot.
- One project per team, submitted on time via the official platform.
- **Final means final**: no code or submission edits after the final submission.
- **Keep the GitHub repo public** and accessible until judging is complete.
- **Include a short README**: what the project is, how to run it, anything unfinished.
- Check that all links (repo, demo, materials) are accessible to judges.
- **Never upload passwords, API keys or confidential data.**
- No harassment, discrimination, plagiarism or cheating. Judges' decisions are final; violations may lead to disqualification.

---

## 4. Security requirement: Aikido (mandatory)

The AI Code Audit checks business logic flaws, **IDOR**, authentication weaknesses and authorization (permission-check) flaws. It reasons about actual logic and access patterns, not just known signatures.

Process:
1. Create an account via `https://app.aikido.dev/ai-pentests/discounts/hackathon-tectonic-aikido` using **Continue with GitHub**.
2. Connect the hackathon repo.
3. Run the AI Code Audit (credits provided) for the **baseline scan**.
4. Fix the issues and mark them resolved.
5. Score = **remaining issues**. Submit screenshots of the platform **before and after**.

Design implication: if the PoC has users, roles, per-country or per-customer data, or document access levels, authn/authz and IDOR safety must be designed in from the start.

---

## 5. Optional technical partners and credits

| Partner | How to get credits |
|---|---|
| **Cursor** (coding agent) | Join Discord (`https://discord.gg/5UwpfTF7M`), go to `#coupon-codes`, click "Start Redemption", select the event, use the registration email, receive code from bot |
| **ElevenLabs** (text-to-speech, synthetic voices) | Join Discord (`discord.com/invite/VnBvbbcdEC`), same `#coupon-codes` flow |
| **Google Cloud** | Use the team link in **Builderbase**, enter email to get GCP credentials; **valid for 1 week only**, so claim them when building starts |

Only Aikido is explicitly required; the others appear optional.

---

## 6. Candidate directions (discussed, none chosen yet)

| Option | Idea | Strength | Risk |
|---|---|---|---|
| **A. Trust layer on answers** (Trust) | Each answer shows freshness, owner, applicable country, corroboration, and a transparent confidence breakdown | Most direct match to the central question | Looks like RAG plus badges unless signals are genuinely computed |
| **B. Conflict and staleness detector** (Detect) | Ingests policies, chat excerpts and procedures; flags contradictions, duplicates, outdated items | Hard to fake, demos well, less crowded | Answer side is weaker; needs a role or workflow framing for Fit |
| **C. Expert routing on low confidence** (Connect) | System says "documents aren't enough" and points to the right person | Memorable; uses human-expertise angle | Needs a believable expertise graph from synthetic data |
| **D. Consultant portfolio handover** (Capture) | Rebuilds client-specific knowledge from emails, notes, documents | Concrete story from the brief | Needs realistic data; overlaps the authz and privacy surface Aikido checks |

Tentative view from the analysis: **A + B combine well** (detection makes trust signals real; the "what should I trust?" view is the demo), with **C** as a fallback step, not the core. D carries the most data-realism risk.

---

## 7. Open questions and unknowns

- **Is any dataset provided by SD Worx?** The guide does not say. Check Builderbase or the Discord. If none, synthetic data or public Belgian payroll and social-security material is needed, which limits how credible a country-applicability signal can be.
- Team size and length of the time slot (determines scope).
- Chosen direction and tech stack (not decided).
- Weights of Creativity, Technical ability and Fit (not stated).

## 8. Working preferences of the user (Petro)

- Concise, precise answers, with reasoning and methodology explained.
- Wants several options with tradeoffs and to be asked for his opinion, not a single directive; values honest disagreement.
- Prefers tables and visual comparisons; English for this content.
- Wants explicit admission of uncertainty rather than guessing.
