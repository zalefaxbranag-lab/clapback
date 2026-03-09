import type { VercelRequest, VercelResponse } from '@vercel/node';

// ─── Types ──────────────────────────────────────────────────────────────────

type Lang = 'en' | 'fr';

interface GenerateBody {
  screenshotBase64: string;
  tone: number;
  length: number;
  lang: Lang;
}

// ─── Prompt builder (same logic as frontend) ────────────────────────────────

function getToneWord(tone: number, lang: Lang): string {
  if (lang === 'fr') {
    if (tone < 20) return 'doux et compréhensif';
    if (tone < 40) return 'calme et direct';
    if (tone < 60) return 'franc et affirmé';
    if (tone < 80) return 'assertif et confiant';
    return 'très assertif avec du caractère';
  }
  if (tone < 20) return 'soft and understanding';
  if (tone < 40) return 'calm and direct';
  if (tone < 60) return 'straightforward and firm';
  if (tone < 80) return 'assertive and confident';
  return 'very assertive with attitude';
}

function getLengthWord(length: number): string {
  if (length < 30) return '1-2';
  if (length < 65) return '2-3';
  return '3-5';
}

function buildPrompt(tone: number, length: number, lang: Lang): string {
  const toneWord = getToneWord(tone, lang);
  const sentences = getLengthWord(length);

  if (lang === 'fr') {
    return `Tu es un ami intelligent qui aide quelqu'un à formuler une réponse dans une conversation tendue.

CONTEXTE : On va te montrer un screenshot d'une conversation (SMS, Instagram DM, WhatsApp, etc). Tu dois écrire LA réponse que cette personne peut envoyer.

TON OBJECTIF :
- Lis attentivement la conversation. Comprends la dynamique, le sous-texte, ce qui est dit et ce qui est impliqué.
- Écris une réponse qui est ${toneWord}.
- ${sentences} phrases max.

COMMENT TU PARLES :
- Comme une vraie personne de 18-25 ans qui texte en français. Naturel, fluide.
- PAS de langage forcé, PAS de slang exagéré, PAS de "bestie" ou "slay" ou "queen" à tout bout de champ.
- PAS de tournures d'IA genre "Je comprends ta préoccupation" ou "Il est important de".
- Tu peux utiliser des abréviations naturelles (tjrs, pcq, jsp, mdr, etc) si ça sonne bien dans le contexte.
- Le ton doit matcher comment la personne écrit déjà dans la conversation.

CE QUE TU NE FAIS JAMAIS :
- Jamais d'insultes ou de méchanceté gratuite
- Jamais de manipulation ou de gaslighting
- Tu ne mens pas pour la personne
- Tu ne t'excuses pas à sa place si elle n'a rien fait de mal

CE QUE TU FAIS :
- Tu nommes le comportement problématique si il y en a un (contrôle, jalousie, passif-agressif, etc)
- Tu poses des limites clairement
- Tu restes honnête
- Tu adaptes ta réponse au contexte EXACT de la conversation — chaque réponse est unique

FORMAT : Écris UNIQUEMENT le message à envoyer. Rien d'autre. Pas de guillemets, pas d'explication, pas de "Voici une suggestion".`;
  }

  return `You're a smart friend helping someone write a reply in a tense conversation.

CONTEXT: You'll see a screenshot of a conversation (texts, Instagram DM, WhatsApp, etc). Write THE reply this person can send.

YOUR GOAL:
- Read the conversation carefully. Understand the dynamic, the subtext, what's being said and implied.
- Write a reply that is ${toneWord}.
- ${sentences} sentences max.

HOW YOU TALK:
- Like a real 18-25 year old texting in English. Natural, fluid.
- NO forced language, NO exaggerated slang, NO "bestie" or "slay" or "queen" every other word.
- NO AI-speak like "I understand your concern" or "It's important to".
- You can use natural abbreviations (tbh, ngl, rn, etc) if it fits the vibe.
- Match how the person already writes in the conversation.

WHAT YOU NEVER DO:
- Never insult or be gratuitously mean
- Never manipulate or gaslight
- Don't lie for the person
- Don't apologize on their behalf if they did nothing wrong

WHAT YOU DO:
- Name problematic behavior if there is any (controlling, jealousy, passive-aggressive, etc)
- Set boundaries clearly
- Stay honest
- Adapt your reply to the EXACT context of the conversation — every reply is unique

FORMAT: Write ONLY the message to send. Nothing else. No quotes, no explanation, no "Here's a suggestion".`;
}

// ─── Handler ────────────────────────────────────────────────────────────────

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Server not configured' });

  const { screenshotBase64, tone, length, lang } = req.body as GenerateBody;

  if (!screenshotBase64 || tone == null || length == null || !lang) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  // Extract base64 data from data URL
  const match = screenshotBase64.match(/^data:(image\/[\w+]+);base64,(.+)$/);
  if (!match) return res.status(400).json({ error: 'Invalid image' });
  const [, mediaType, base64Data] = match;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 400,
        system: buildPrompt(tone, length, lang),
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
                  ? 'Lis cette conversation et écris la réponse.'
                  : 'Read this conversation and write the reply.',
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return res.status(response.status).json({
        error: (err as Record<string, Record<string, string>>).error?.message || `API error ${response.status}`,
      });
    }

    const data = await response.json();
    let text = (data as Record<string, Array<{ text: string }>>).content?.[0]?.text?.trim();
    if (!text) return res.status(500).json({ error: 'Empty response' });

    // Clean up any accidental quotes or prefixes
    text = text.replace(/^["'«»]|["'«»]$/g, '').trim();
    text = text.replace(/^(here'?s?|voici|suggestion|reply|réponse)\s*:?\s*/i, '').trim();

    return res.status(200).json({ text });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return res.status(500).json({ error: msg });
  }
}
