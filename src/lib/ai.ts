/**
 * ClapBack AI — calls the server-side API (Sonnet 4.5).
 * No API key needed client-side. Zero config for users.
 */

import type { Lang } from './i18n';

interface AiGenerateParams {
  screenshotBase64: string;
  tone: number;
  length: number;
  lang: Lang;
}

export async function generateWithAI(params: AiGenerateParams): Promise<string> {
  const { screenshotBase64, tone, length, lang } = params;

  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ screenshotBase64, tone, length, lang }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `Erreur ${response.status}`);
  }

  return data.text;
}
