// Scoring and matching logic. Answers are hardcoded in src/data/*.json;
// expert pertinence is computed here from visible, weighted factors so the
// ranking is explainable rather than a black box.

export const DEMO_TODAY = new Date('2026-09-30');

export const EXPERT_FACTORS = [
  { key: 'expertise', label: 'Topic expertise', weight: 0.3, hint: 'Owns or regularly works on this subject' },
  { key: 'context', label: 'Country & client fit', weight: 0.25, hint: 'Same country, client or situation' },
  { key: 'evidence', label: 'Link to the evidence', weight: 0.2, hint: 'Authored or owns the documents found' },
  { key: 'recency', label: 'Recent involvement', weight: 0.15, hint: 'Worked on this topic recently' },
  { key: 'availability', label: 'Availability', weight: 0.1, hint: 'Can realistically answer today' },
];

export const ANSWER_METRICS = [
  { key: 'relevance', label: 'Relevance', hint: 'How closely the evidence matches the question' },
  { key: 'reliability', label: 'Source reliability', hint: 'Official, owned and approved sources score higher' },
  { key: 'freshness', label: 'Freshness', hint: 'Age of the evidence, weighted by relevance' },
  { key: 'contextFit', label: 'Context fit', hint: 'Applies to this client, country and situation' },
  { key: 'coverage', label: 'Coverage', hint: 'Share of the question the evidence answers' },
];

export function scoreExpert(expert) {
  const total = EXPERT_FACTORS.reduce((sum, f) => sum + (expert.factors[f.key] ?? 0) * f.weight, 0);
  return Math.round(total);
}

export function rankExperts(experts) {
  return experts
    .map((e) => ({ ...e, score: scoreExpert(e) }))
    .sort((a, b) => b.score - a.score);
}

export function gapCoverage(gapItems, experts) {
  return gapItems.map((item) => ({
    item,
    by: experts.filter((e) => e.covers.includes(item)).map((e) => e.name),
  }));
}

function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9à-ÿ€£\- ]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 2);
}

// Picks the hardcoded scenario that best matches free text. Returns null if
// nothing matches well enough, so the UI can say so instead of guessing.
export function matchQuestion(text, questions) {
  const tokens = new Set(tokenize(text));
  const lower = text.toLowerCase();
  let best = null;
  let bestScore = 0;
  for (const q of questions) {
    let score = 0;
    for (const kw of q.keywords) {
      if (kw.includes(' ') ? lower.includes(kw) : tokens.has(kw)) score += 1;
    }
    if (score > bestScore) {
      bestScore = score;
      best = q;
    }
  }
  return bestScore >= 2 ? best : null;
}

export function level(value) {
  if (value >= 75) return 'high';
  if (value >= 50) return 'medium';
  return 'low';
}

export function levelLabel(value) {
  return { high: 'High', medium: 'Moderate', low: 'Low' }[level(value)];
}

export function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function ageLabel(iso) {
  const days = Math.round((DEMO_TODAY - new Date(iso)) / 86400000);
  if (days < 1) return 'today';
  if (days < 31) return `${days} d ago`;
  const months = Math.round(days / 30.4);
  if (months < 12) return `${months} mo ago`;
  const years = (days / 365).toFixed(1).replace(/\.0$/, '');
  return `${years} y ago`;
}

export function trustOf(extract) {
  const s = extract.scores;
  return Math.round(s.relevance * 0.4 + s.reliability * 0.35 + s.freshness * 0.25);
}

export function buildContactMessage(question, expert) {
  const first = expert.name.split(' ')[0];
  const found = question.groups
    .map((g) => `- ${g.headline} (${g.meta}): ${g.assessment}`)
    .join('\n');
  return `Hi ${first},

A client asked me a question I can't answer with confidence from our documents. Could you help?

Client: ${question.context.client} (${question.context.country}, ${question.context.headcount} employees)
Question: ${question.question}

What I found:
${found}

What is still open:
${question.answer.gap}

Search confidence was ${question.answer.metrics.confidence}/100. I reached out because: ${expert.reasons[0].toLowerCase()}.

Thanks a lot!`;
}
