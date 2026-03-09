/**
 * Mock AI response generator with EN/FR support.
 *
 * In production, replace `generateResponse` with a call to your LLM API
 * (OpenAI, Claude, etc.) passing the uploaded image + tone/length/lang params.
 */

import type { Lang } from './i18n';

interface GenerateParams {
  tone: number;
  length: number;
  lang: Lang;
}

// ─── English responses ───────────────────────────────────────────────────────

const en = {
  gentle: [
    "Hey, I totally get why you'd ask! It's just flowers from a friend — nothing to read into. I'd love for us to talk about it if it's bothering you though. Communication is everything 💛",
    "I hear you, and I appreciate that you care! They're just flowers from a friend. I'm always gonna be honest with you, so just ask me anything, okay?",
    "That's sweet that you noticed! A friend grabbed them for me. No hidden storyline here — just someone being nice. You're still my person 💕",
    "I know it might look a certain way, but it's genuinely just a nice gesture from a friend. I'd always tell you if there was more to it. Trust goes both ways!",
    "Aw, no need to stress about it! Just a friend being thoughtful. You know you're the one I'm texting back at 2am, not them 😊",
  ],
  balanced: [
    "I get the curiosity, but the tone feels a little intense for flowers. They're from a friend — that's the whole story. I'm happy to talk about it, but let's keep it chill?",
    "They're flowers from a friend, not a plot twist. I'm being straight with you. If something's bugging you, let's actually talk about it instead of the one-word interrogation.",
    "Look, I understand the concern, but the way you're asking makes me feel like I did something wrong — and I didn't. It's just flowers. Can we talk like adults about this?",
    "I appreciate that you care enough to ask, but a period after 'Who' hits different and you know it. They're from a friend. Let's not make this a whole thing.",
    "Real talk — the possessive energy isn't it. They're from a friend. I'm telling you because I want to be open, not because I owe an interrogation answer.",
  ],
  assertive: [
    "I get that you're curious, but the way you're asking feels more like an interrogation than a conversation. It's flowers from a friend — not a mystery to solve. If you want details, maybe try asking without the courtroom energy?",
    "The 'Who.' with a period is giving detective mode and honestly? Not the vibe. They're flowers. From a friend. If you trust me, cool. If not, that's a bigger conversation we need to have.",
    "Bestie, I mean babe — flowers aren't a crime. A friend got them for me. The fact that your first instinct is suspicion instead of 'that's nice' says more about us than about any bouquet.",
    "I was literally about to tell you the whole story unprompted, but the interrogation approach made me not want to. They're from a classmate. Maybe next time lead with curiosity, not an accusation?",
    "Respectfully, the energy you're bringing to a bouquet of flowers is a lot. It's from a friend. I'm telling you because I want to, not because I have to defend myself. Tone matters.",
    "Not gonna lie, the way you asked that felt controlling. It's flowers from a friend. I shouldn't have to justify a nice gesture from someone. If this is really about trust, let's have that real conversation.",
  ],
  mainCharacter: [
    "The way you said 'Who.' like you're a detective in a crime drama is sending me. It's flowers from a friend. If my friends being nice to me is a problem, that's a you thing to work through, not a me thing to apologize for.",
    "I was gonna tell you the whole cute story about how my classmate surprised me with flowers, but the possessive energy killed the vibe. It's giving insecurity, not protectiveness. Flowers are flowers. Relax.",
    "Babe. They're sunflowers. From a friend. Not a love letter, not a proposal — literally just petals. The fact that you went full interrogation mode over a plant is telling. Maybe reflect on that one.",
    "The audacity of 'Who.' with a period like I'm on trial for receiving foliage. A friend got them because friends do nice things. I'm not going to apologize for people caring about me — that's actually a flex.",
    "Let me paint you a picture: someone was kind to me. I smiled. I took a photo because they were pretty. That's the entire plot. No twist. No sequel. If that triggers your inner detective, we need to talk about boundaries, not bouquets.",
    "I'm not about to make myself small because flowers made you uncomfortable. A friend got them. Period. The real question isn't 'who got you these' — it's why a kind gesture makes you react like this. Let's unpack that.",
  ],
};

// ─── French responses ────────────────────────────────────────────────────────

const fr = {
  gentle: [
    "Hey, je comprends totalement pourquoi tu demandes ! C'est juste des fleurs d'un ami — y'a rien \u00e0 lire entre les lignes. J'aimerais qu'on en parle si \u00e7a te d\u00e9range. La communication c'est tout 💛",
    "Je t'entends, et j'appr\u00e9cie que tu t'en soucies ! C'est juste des fleurs d'un ami. Je serai toujours honn\u00eate avec toi, donc demande-moi ce que tu veux, okay ?",
    "C'est mignon que t'aies remarqu\u00e9 ! Un ami me les a prises. Pas de sc\u00e9nario cach\u00e9 — juste quelqu'un de gentil. T'es toujours ma personne 💕",
    "Je sais que \u00e7a peut avoir l'air bizarre, mais c'est sinc\u00e8rement juste un geste sympa d'un ami. Je te dirais toujours s'il y avait plus. La confiance c'est dans les deux sens !",
    "T'inqui\u00e8te pas pour \u00e7a ! Juste un ami attentionn\u00e9. Tu sais que c'est toi que je texte \u00e0 2h du mat, pas eux 😊",
  ],
  balanced: [
    "Je comprends la curiosit\u00e9, mais le ton est un peu intense pour des fleurs. Elles viennent d'un ami — c'est toute l'histoire. On peut en parler, mais restons chill ?",
    "C'est des fleurs d'un ami, pas un plot twist. Je suis honn\u00eate avec toi. Si un truc te d\u00e9range, parlons-en au lieu de l'interrogatoire en un mot.",
    "Regarde, je comprends l'inqui\u00e9tude, mais ta fa\u00e7on de demander me donne l'impression d'avoir fait quelque chose de mal — et c'est pas le cas. C'est juste des fleurs. On peut parler comme des adultes ?",
    "J'appr\u00e9cie que tu demandes, mais un point apr\u00e8s 'Qui' \u00e7a hit diff\u00e9remment et tu le sais. Elles viennent d'un ami. Faisons pas tout un truc de \u00e7a.",
    "Parlons vrai — l'\u00e9nergie possessive c'est pas \u00e7a. Elles viennent d'un ami. Je te dis parce que je veux \u00eatre ouverte, pas parce que je te dois une r\u00e9ponse d'interrogatoire.",
  ],
  assertive: [
    "Je comprends ta curiosit\u00e9, mais ta fa\u00e7on de demander ressemble plus \u00e0 un interrogatoire qu'\u00e0 une conversation. C'est des fleurs d'un ami — pas un myst\u00e8re \u00e0 r\u00e9soudre. Si tu veux des d\u00e9tails, essaie de demander sans l'\u00e9nergie tribunal ?",
    "Le 'Qui.' avec un point c'est le mode d\u00e9tective et honn\u00eatement ? Pas la vibe. C'est des fleurs. D'un ami. Si tu me fais confiance, cool. Sinon, c'est une plus grande conversation qu'on doit avoir.",
    "Bestie, je veux dire babe — les fleurs c'est pas un crime. Un ami me les a offertes. Le fait que ton premier r\u00e9flexe soit la suspicion au lieu de 'c'est joli' en dit plus sur nous que sur n'importe quel bouquet.",
    "J'\u00e9tais litt\u00e9ralement sur le point de te raconter toute l'histoire sans qu'on me le demande, mais l'approche interrogatoire m'a enlev\u00e9 l'envie. C'est d'un camarade de classe. La prochaine fois, commence par la curiosit\u00e9, pas l'accusation ?",
    "Respectueusement, l'\u00e9nergie que tu mets dans un bouquet de fleurs c'est beaucoup. C'est d'un ami. Je te dis parce que je le veux, pas parce que je dois me d\u00e9fendre. Le ton compte.",
  ],
  mainCharacter: [
    "La fa\u00e7on dont t'as dit 'Qui.' comme si t'\u00e9tais un d\u00e9tective dans un drama policier me tue. C'est des fleurs d'un ami. Si mes amis qui sont gentils avec moi c'est un probl\u00e8me, c'est un truc \u00e0 toi \u00e0 r\u00e9gler, pas un truc \u00e0 moi de m'excuser.",
    "J'allais te raconter toute la cute histoire de comment mon camarade m'a surprise avec des fleurs, mais l'\u00e9nergie possessive a tu\u00e9 la vibe. \u00c7a donne ins\u00e9curit\u00e9, pas protection. Des fleurs c'est des fleurs. Relaxe.",
    "Babe. C'est des tournesols. D'un ami. Pas une lettre d'amour, pas une demande — litt\u00e9ralement juste des p\u00e9tales. Le fait que t'es pass\u00e9 en mode interrogatoire pour une plante, c'est r\u00e9v\u00e9lateur. R\u00e9fl\u00e9chis \u00e0 \u00e7a.",
    "L'audace du 'Qui.' avec un point comme si j'\u00e9tais en proc\u00e8s pour avoir re\u00e7u du feuillage. Un ami me les a offertes parce que les amis font des trucs sympas. Je vais pas m'excuser que les gens tiennent \u00e0 moi — c'est un flex en fait.",
    "Laisse-moi te peindre un tableau : quelqu'un a \u00e9t\u00e9 gentil avec moi. J'ai souri. J'ai pris une photo parce que c'\u00e9tait joli. C'est tout le sc\u00e9nario. Pas de twist. Pas de suite. Si \u00e7a d\u00e9clenche ton d\u00e9tective int\u00e9rieur, faut qu'on parle de limites, pas de bouquets.",
    "Je vais pas me faire petite parce que des fleurs t'ont mis mal \u00e0 l'aise. Un ami me les a offertes. Point. La vraie question c'est pas 'qui t'a offert \u00e7a' — c'est pourquoi un geste gentil te fait r\u00e9agir comme \u00e7a. D\u00e9ballons \u00e7a.",
  ],
};

const pools = { en, fr };

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function trimToLength(text: string, lengthPercent: number): string {
  if (lengthPercent > 60) return text;
  const sentences = text.split(/(?<=[.!?])\s+/);
  if (lengthPercent < 30) {
    return sentences.slice(0, Math.min(2, sentences.length)).join(' ');
  }
  const count = Math.max(2, Math.ceil(sentences.length * 0.6));
  return sentences.slice(0, count).join(' ');
}

export function generateResponse({ tone, length, lang }: GenerateParams): Promise<string> {
  return new Promise((resolve) => {
    const delay = 1500 + Math.random() * 1500;
    setTimeout(() => {
      const p = pools[lang];
      let pool: string[];

      if (tone < 25) pool = p.gentle;
      else if (tone < 50) pool = p.balanced;
      else if (tone < 75) pool = p.assertive;
      else pool = p.mainCharacter;

      const raw = pickRandom(pool);
      resolve(trimToLength(raw, length));
    }, delay);
  });
}
