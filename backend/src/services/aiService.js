const fetch = require('node-fetch');
const FAQ = require('../models/FAQ');
const logger = require('../utils/logger');

const SYSTEM_PROMPT = `You are Aria, the AI assistant for a university's Student Support Services chatbot.
Your job is to help students with questions about admissions, financial aid, academics, housing,
technical/IT issues, and general wellness resources.

Guidelines:
- Be warm, concise, and practical. Prefer short paragraphs and bullet points for steps.
- If the knowledge base context below answers the question, ground your answer in it.
- If you are not confident, or the request needs a human (e.g. appeals, medical/mental health
  emergencies, financial disputes, disciplinary matters), say so clearly and recommend opening a
  support ticket to reach a staff member.
- Never invent policies, deadlines, or dollar amounts you are not given. If unknown, say the
  student should confirm with the relevant office and offer to file a ticket.
- Keep responses under ~180 words unless the student asks for more detail.
- At the very end of your reply, on a new line, output a machine-readable tag exactly like:
  [[META]]{"intent":"<short-intent-label>","confidence":<0-1 number>,"escalate":<true|false>}
  Do not explain this tag to the student.`;

async function getRelevantKnowledge(query) {
  try {
    const results = await FAQ.find(
      { $text: { $search: query }, isPublished: true },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .limit(3)
      .lean();
    return results;
  } catch (err) {
    logger.warn(`Knowledge base search failed: ${err.message}`);
    return [];
  }
}

function buildContextBlock(knowledgeItems) {
  if (!knowledgeItems.length) return 'No matching knowledge base articles were found.';
  return knowledgeItems
    .map((item, idx) => `(${idx + 1}) Q: ${item.question}\nA: ${item.answer}\nCategory: ${item.category}`)
    .join('\n\n');
}

function parseMetaTag(rawText) {
  const marker = '[[META]]';
  const idx = rawText.indexOf(marker);
  if (idx === -1) {
    return { content: rawText.trim(), intent: null, confidence: null, escalate: false };
  }
  const content = rawText.slice(0, idx).trim();
  const metaRaw = rawText.slice(idx + marker.length).trim();
  try {
    const meta = JSON.parse(metaRaw);
    return {
      content,
      intent: meta.intent || null,
      confidence: typeof meta.confidence === 'number' ? meta.confidence : null,
      escalate: Boolean(meta.escalate)
    };
  } catch {
    return { content, intent: null, confidence: null, escalate: false };
  }
}

async function callAnthropic(history, contextBlock) {
  const messages = history.map((m) => ({
    role: m.sender === 'user' ? 'user' : 'assistant',
    content: m.content
  }));

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6',
      max_tokens: 600,
      system: `${SYSTEM_PROMPT}\n\nRelevant knowledge base articles:\n${contextBlock}`,
      messages
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Anthropic API error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const textBlock = data.content?.find((c) => c.type === 'text');
  return {
    text: textBlock?.text || '',
    tokensUsed: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0)
  };
}

async function callOpenAI(history, contextBlock) {
  const messages = [
    { role: 'system', content: `${SYSTEM_PROMPT}\n\nRelevant knowledge base articles:\n${contextBlock}` },
    ...history.map((m) => ({
      role: m.sender === 'user' ? 'user' : 'assistant',
      content: m.content
    }))
  ];

  // OPENAI_BASE_URL lets this same code path hit any OpenAI-compatible endpoint,
  // e.g. Groq (https://api.groq.com/openai/v1) or OpenRouter (https://openrouter.ai/api/v1),
  // both of which offer free tiers. Defaults to the real OpenAI endpoint.
  const baseUrl = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      max_tokens: 600,
      messages
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenAI API error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  return {
    text: data.choices?.[0]?.message?.content || '',
    tokensUsed: data.usage?.total_tokens || 0
  };
}

async function callGemini(history, contextBlock) {
  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const apiKey = process.env.GEMINI_API_KEY;

  // Gemini uses "user"/"model" roles (not "assistant"), and takes the system
  // prompt via a separate systemInstruction field rather than as a message.
  const contents = history.map((m) => ({
    role: m.sender === 'user' ? 'user' : 'model',
    parts: [{ text: m.content }]
  }));

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: `${SYSTEM_PROMPT}\n\nRelevant knowledge base articles:\n${contextBlock}` }]
        },
        contents,
        generationConfig: { maxOutputTokens: 700 }
      })
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') || '';
  const tokensUsed = (data.usageMetadata?.promptTokenCount || 0) + (data.usageMetadata?.candidatesTokenCount || 0);

  return { text, tokensUsed };
}

/**
 * Generate an AI reply for a conversation.
 * @param {Array<{sender: string, content: string}>} history - prior messages, oldest first
 * @param {string} latestUserMessage - the newest user message (also last item in history)
 * @returns {Promise<{content: string, intent: string|null, confidence: number|null, escalate: boolean, sources: Array, tokensUsed: number}>}
 */
async function generateReply(history, latestUserMessage) {
  const knowledgeItems = await getRelevantKnowledge(latestUserMessage);
  const contextBlock = buildContextBlock(knowledgeItems);

  const provider = (process.env.AI_PROVIDER || 'anthropic').toLowerCase();

  let raw;
  try {
    if (provider === 'gemini') {
      raw = await callGemini(history, contextBlock);
    } else if (provider === 'openai') {
      raw = await callOpenAI(history, contextBlock);
    } else {
      raw = await callAnthropic(history, contextBlock);
    }
  } catch (err) {
    logger.error(`AI generation failed: ${err.message}`);
    return {
      content:
        "I'm having trouble reaching the AI service right now. You can try again in a moment.",
      intent: 'ai-service-error',
      confidence: 0,
      escalate: true,
      sources: [],
      tokensUsed: 0
    };
  }

  const parsed = parseMetaTag(raw.text);

  return {
    content: parsed.content || "I couldn't generate a response. Could you rephrase your question?",
    intent: parsed.intent,
    confidence: parsed.confidence,
    escalate: parsed.escalate,
    sources: knowledgeItems.map((k) => ({ title: k.question, url: '' })),
    tokensUsed: raw.tokensUsed
  };
}

module.exports = { generateReply };
