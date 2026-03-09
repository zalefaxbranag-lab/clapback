/**
 * AI API integration for contextual response generation.
 *
 * Supports OpenAI (GPT-4o vision) and Anthropic (Claude) APIs.
 * The user provides their own API key, stored in localStorage.
 * The screenshot is sent directly to the provider — never to us.
 */

import type { Lang } from './i18n';

export type Provider = 'openai' | 'anthropic';

interface AiConfig {
  provider: Provider;
  apiKey: string;
}

interface AiGenerateParams {
  config: AiConfig;
  screenshotBase64: string; // data URL
  tone: number;
  length: number;
  lang: Lang;
}

const STORAGE_KEY = 'clapback_ai_config';

export function getAiConfig(): AiConfig | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const config = JSON.parse(raw);
    if (config.apiKey && config.provider) return config;
    return null;
  } catch {
    return null;
  }
}

export function saveAiConfig(config: AiConfig): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

export function clearAiConfig(): void {
  localStorage.removeItem(STORAGE_KEY);
}

function getToneInstruction(tone: number, lang: Lang): string {
  if (lang === 'fr') {
    if (tone < 25) return "Ton doux et bienveillant. Gentille mais honnte. Montre que tu comprends l'autre personne tout en exprimant tes sentiments calmement.";
    if (tone < 50) return "Ton direct mais respectueux. Dis les choses clairement sans tourner autour du pot, mais sans agressivit.";
    if (tone < 75) return "Ton assertif et confiant. Tu poses tes limites fermement. Tu ne t'excuses pas d'exister. Style 'queen energy'.";
    return "Ton 'main character energy'. Ultra confiant, un peu sass, mais jamais mchant. Tu retournes la situation avec intelligence. Tu ne te laisses pas marcher dessus.";
  }
  if (tone < 25) return "Gentle and warm tone. Kind but honest. Show understanding while calmly expressing your feelings.";
  if (tone < 50) return "Direct but respectful. Say things clearly without beating around the bush, but without aggression.";
  if (tone < 75) return "Assertive and confident. Set boundaries firmly. Don't apologize for existing. 'Queen energy' style.";
  return "Main character energy. Ultra confident, a bit sassy, but never mean. Flip the situation with intelligence. Don't let yourself be walked over.";
}

function getLengthInstruction(length: number, lang: Lang): string {
  if (lang === 'fr') {
    if (length < 33) return "Rponds en 1-2 phrases max. Court et percutant.";
    if (length < 66) return "Rponds en 2-3 phrases. Concis mais complet.";
    return "Rponds en un paragraphe complet de 4-6 phrases. Dtaill et argument.";
  }
  if (length < 33) return "Reply in 1-2 sentences max. Short and impactful.";
  if (length < 66) return "Reply in 2-3 sentences. Concise but complete.";
  return "Reply in a full paragraph of 4-6 sentences. Detailed and well-argued.";
}

function buildSystemPrompt(tone: number, length: number, lang: Lang): string {
  const toneInst = getToneInstruction(tone, lang);
  const lengthInst = getLengthInstruction(length, lang);

  if (lang === 'fr') {
    return `Tu es ClapBack, une IA bestie qui aide les gens  rdiger des rponses assertives et intelligentes dans des conversations difficiles.

RGLES:
- Analyse le screenshot de conversation fourni
- Gnre UNE rponse que l'utilisateur peut envoyer
- ${toneInst}
- ${lengthInst}
- Rponds UNIQUEMENT en franais
- Utilise du langage naturel de jeune (pas forc mais authentique)
- NE SOIS JAMAIS insultant, mchant ou toxique
- Focus sur : poser des limites, communiquer sainement, self-respect
- Ne commence PAS par "Hey" ou un greeting, va droit au but
- Rponds UNIQUEMENT avec le texte de la rponse, rien d'autre (pas de guillemets, pas d'explication)`;
  }

  return `You are ClapBack, an AI bestie that helps people craft assertive and smart replies in difficult conversations.

RULES:
- Analyze the provided conversation screenshot
- Generate ONE reply the user can send
- ${toneInst}
- ${lengthInst}
- Reply ONLY in English
- Use natural, casual language (not forced but authentic)
- NEVER be insulting, mean, or toxic
- Focus on: setting boundaries, healthy communication, self-respect
- Do NOT start with "Hey" or a greeting, get straight to the point
- Reply ONLY with the response text, nothing else (no quotes, no explanation)`;
}

// ─── OpenAI ──────────────────────────────────────────────────────────────────

async function generateWithOpenAI(params: AiGenerateParams): Promise<string> {
  const { config, screenshotBase64, tone, length, lang } = params;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      max_tokens: 500,
      messages: [
        { role: 'system', content: buildSystemPrompt(tone, length, lang) },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: lang === 'fr'
                ? 'Analyse cette conversation et gnre une rponse assertive que je peux envoyer.'
                : 'Analyze this conversation and generate an assertive reply I can send.',
            },
            {
              type: 'image_url',
              image_url: { url: screenshotBase64, detail: 'low' },
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `OpenAI error: ${response.status}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error('Empty response from OpenAI');
  return text;
}

// ─── Anthropic ───────────────────────────────────────────────────────────────

async function generateWithAnthropic(params: AiGenerateParams): Promise<string> {
  const { config, screenshotBase64, tone, length, lang } = params;

  // Extract base64 data and media type from data URL
  const match = screenshotBase64.match(/^data:(image\/\w+);base64,(.+)$/);
  if (!match) throw new Error('Invalid image format');
  const [, mediaType, base64Data] = match;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': config.apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 500,
      system: buildSystemPrompt(tone, length, lang),
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: mediaType, data: base64Data },
            },
            {
              type: 'text',
              text: lang === 'fr'
                ? 'Analyse cette conversation et gnre une rponse assertive que je peux envoyer.'
                : 'Analyze this conversation and generate an assertive reply I can send.',
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `Claude error: ${response.status}`);
  }

  const data = await response.json();
  const text = data.content?.[0]?.text?.trim();
  if (!text) throw new Error('Empty response from Claude');
  return text;
}

// ─── Main export ─────────────────────────────────────────────────────────────

export async function generateWithAI(params: AiGenerateParams): Promise<string> {
  if (params.config.provider === 'anthropic') {
    return generateWithAnthropic(params);
  }
  return generateWithOpenAI(params);
}
