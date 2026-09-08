/**
 * AI analyzer — decision support for report triage.
 *
 * Primary path: a real LLM (OpenAI-compatible endpoint, e.g. agentrouter.org)
 * that reads the report text and returns a structured triage suggestion.
 * Fallback path: a deterministic, rule-based analyzer that mirrors the SQL
 * scoring in database/functions/calculate_report_priority.sql:
 *
 *   category base weight 0–40 + severity keywords 0–25 + confidence 0–20
 *   → 0–100 score → CRITICAL / HIGH / MEDIUM / LOW
 *
 * AI output is ALWAYS a suggestion — the barangay reviewer confirms.
 */

const CATEGORY_WEIGHTS = {
  'flooding': 40, 'public safety': 38, 'water supply': 32, 'road damage': 30,
  'infrastructure': 28, 'drainage': 26, 'illegal dumping': 22, 'garbage': 18,
  'streetlight': 14, 'traffic': 12, 'noise': 8,
};

const CRITICAL_TERMS = /(deep flood|chest-deep|neck-deep|trapped|evacuat|landslide|collapse|electrocut|explosion|fire|injur|casualt|dying|hazard)/i;
const HIGH_TERMS = /(flood|overflow|broken pipe|no water|contaminat|sewage|sinkhole|live wire|open wire|structural damage|danger)/i;
const MEDIUM_TERMS = /(leak|crack|pothole|blocked|clogged|overflowing trash|foul smell|outage|not working|damaged)/i;
const LOW_TERMS = /(minor|small|slight|slow)/i;

const KEYWORD_SET = [
  'flood', 'knee-deep', 'pothole', 'garbage', 'trash', 'drain', 'streetlight',
  'leak', 'overflow', 'blocked', 'clogged', 'outage', 'noise', 'dumped', 'smell',
];

const PRIORITIES = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

/** Categories the DB knows about — the LLM must pick from these. */
const VALID_CATEGORIES = [
  'flooding', 'public safety', 'water supply', 'road damage', 'infrastructure',
  'drainage', 'illegal dumping', 'garbage', 'streetlight', 'traffic', 'noise',
];

const AI_TIMEOUT_MS = 25_000;

/** Map the frontend's category labels to the DB's category names. */
function normalizeCategory(category) {
  const c = String(category || '').toLowerCase().trim();
  const aliases = {
    'broken streetlight': 'streetlight', 'road': 'road damage',
    'streetlights': 'streetlight', 'water': 'water supply',
    'environment': 'illegal dumping',
  };
  return aliases[c] || c;
}

function scoreToPriority(score) {
  if (score >= 75) return 'CRITICAL';
  if (score >= 50) return 'HIGH';
  if (score >= 25) return 'MEDIUM';
  return 'LOW';
}

/* ------------------------------------------------------------------ */
/* Rule-based fallback (the original stage-1 analyzer)                 */
/* ------------------------------------------------------------------ */
export function analyzeReportRules(input) {
  const title = input.title || '';
  const description = input.description || '';
  const text = `${title} ${description}`;

  const category = normalizeCategory(input.category);
  const base = CATEGORY_WEIGHTS[category] ?? 10;

  let keywordScore = 0;
  if (CRITICAL_TERMS.test(text)) keywordScore = 25;
  else if (HIGH_TERMS.test(text)) keywordScore = 18;
  else if (MEDIUM_TERMS.test(text)) keywordScore = 10;
  else if (LOW_TERMS.test(text)) keywordScore = 3;

  const detectedKeywords = KEYWORD_SET.filter((k) => text.toLowerCase().includes(k));

  // Self-reported confidence of the rule engine: higher when the text
  // contains strong severity signals and the category is well-known.
  const categoryKnown = category in CATEGORY_WEIGHTS;
  const confidence = Math.min(
    0.55 + (keywordScore / 25) * 0.25 + (categoryKnown ? 0.15 : 0) + (detectedKeywords.length ? 0.05 : 0),
    0.97
  );

  const score = Math.min(base + keywordScore + confidence * 20, 100);

  const severityPhrase =
    keywordScore === 25 ? 'Immediate safety risk' :
    keywordScore === 18 ? 'Urgent issue' :
    keywordScore === 10 ? 'Standard issue' : 'Minor issue';

  const summary =
    `${severityPhrase} — classified as ${category || 'other'}` +
    (detectedKeywords.length ? ` (signals: ${detectedKeywords.slice(0, 5).join(', ')})` : '') +
    `. Suggested priority: ${scoreToPriority(score)}.`;

  return {
    analysisType: 'TEXT',
    categoryPrediction: categoryKnown ? category : null,
    priorityPrediction: scoreToPriority(score),
    confidenceScore: Number(confidence.toFixed(2)),
    summary,
    detectedKeywords,
    score: Math.round(score),
    engine: 'rules',
    modelName: 'rule-analyzer',
    modelVersion: '1.0.0',
  };
}

/* ------------------------------------------------------------------ */
/* Real LLM path (OpenAI-compatible /chat/completions)                 */
/* ------------------------------------------------------------------ */
function buildPrompt(input) {
  const category = normalizeCategory(input.category);
  return [
    { role: 'system', content:
      `You are a triage assistant for a barangay (village) government in Tagum City, Philippines. ` +
      `Classify citizen problem reports and suggest a priority for the barangay review queue. ` +
      `Respond with ONLY a JSON object, no markdown, in exactly this shape: ` +
      `{"category": string|null, "priority": "CRITICAL"|"HIGH"|"MEDIUM"|"LOW", ` +
      `"confidence": number between 0 and 1, "summary": string, ` +
      `"keywords": string[], "reasoning": string}. ` +
      `"category" must be one of: ${VALID_CATEGORIES.join(', ')} — or null if none fit. ` +
      `"summary" is one or two plain sentences a reviewer can scan quickly. ` +
      `"keywords" are the concrete problem signals found in the text (max 6). ` +
      `"reasoning" is one short sentence on why this priority. ` +
      `CRITICAL = immediate danger to life/property; HIGH = urgent, worsening risk; ` +
      `MEDIUM = standard issue needing action; LOW = minor. Be conservative: when unsure, prefer the lower priority.` },
    { role: 'user', content:
      `Title: ${input.title || '(none)'}\n` +
      `Description: ${input.description || '(none)'}\n` +
      `Resident-selected category: ${category || '(none)'}` },
  ];
}

/** Parse + clamp the model's JSON into the analyzer output shape. */
function coerceModelResponse(json, fallback) {
  const priority = PRIORITIES.includes(json.priority) ? json.priority : fallback.priorityPrediction;
  let category = typeof json.category === 'string' ? normalizeCategory(json.category) : null;
  if (category && !VALID_CATEGORIES.includes(category)) category = fallback.categoryPrediction;
  const confidence = Math.min(Math.max(Number(json.confidence) || 0, 0), 0.99);
  const keywords = Array.isArray(json.keywords)
    ? json.keywords.filter((k) => typeof k === 'string').slice(0, 6)
    : fallback.detectedKeywords;
  const summary = (typeof json.summary === 'string' && json.summary.trim())
    ? json.summary.trim().slice(0, 500)
    : fallback.summary;

  return {
    analysisType: 'TEXT',
    categoryPrediction: category,
    priorityPrediction: priority,
    confidenceScore: Number(confidence.toFixed(2)),
    summary,
    detectedKeywords: keywords,
    score: Math.round(
      Math.min((PRIORITIES.length - PRIORITIES.indexOf(priority)) * 25 * confidence + 10, 100)
    ),
    reasoning: (typeof json.reasoning === 'string' ? json.reasoning : '').slice(0, 500),
    engine: 'llm',
  };
}

async function callModel(input, fallback) {
  const apiKey = process.env.AI_API_KEY;
  if (!apiKey) return null;

  const baseUrl = (process.env.AI_BASE_URL || 'https://agentrouter.org/v1').replace(/\/+$/, '');
  const model = process.env.AI_MODEL || 'glm-5.3';
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);

  try {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: buildPrompt(input),
        temperature: 0.1,
        max_tokens: 600,
      }),
    });
    if (!res.ok) {
      console.warn(`[ai] model ${model} responded ${res.status}; falling back to rules`);
      return null;
    }
    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) {
      console.warn('[ai] empty model response; falling back to rules');
      return null;
    }
    // The model may wrap JSON in a fence despite instructions — strip it.
    const match = content.match(/\{[\s\S]*\}/);
    if (!match) {
      console.warn('[ai] no JSON object in model response; falling back to rules');
      return null;
    }
    const parsed = JSON.parse(match[0]);
    const coerced = coerceModelResponse(parsed, fallback);
    return {
      ...coerced,
      modelName: model,
      modelVersion: data.model_version || data.model || model,
    };
  } catch (err) {
    console.warn(`[ai] model call failed (${err.message || err}); falling back to rules`);
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * @param {{ title?: string, description?: string, category?: string,
 *           aiConfidence?: number }} input
 * @returns {Promise<{ analysisType: 'TEXT', categoryPrediction: string|null,
 *               priorityPrediction: 'CRITICAL'|'HIGH'|'MEDIUM'|'LOW',
 *               confidenceScore: number, summary: string,
 *               detectedKeywords: string[], score: number,
 *               engine: 'llm'|'rules', modelName: string,
 *               modelVersion?: string, reasoning?: string }>}
 */
export async function analyzeReport(input) {
  const fallback = analyzeReportRules(input);
  const llm = await callModel(input, fallback);
  return llm || fallback;
}
