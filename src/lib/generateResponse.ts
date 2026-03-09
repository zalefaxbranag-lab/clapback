/**
 * Mock AI response generator.
 *
 * In production, replace `generateResponse` with a call to your LLM API
 * (OpenAI, Claude, etc.) passing the uploaded image + tone/length params.
 *
 * The mock uses pre-written templates bucketed by tone level so the app
 * feels alive without any backend.
 */

interface GenerateParams {
  tone: number;    // 0 = gentle bestie, 100 = main character energy
  length: number;  // 0 = short, 100 = full paragraph
}

// Response pools bucketed by tone
const gentleResponses = [
  "Hey, I totally get why you'd ask! It's just flowers from a friend — nothing to read into. I'd love for us to talk about it if it's bothering you though. Communication is everything 💛",
  "I hear you, and I appreciate that you care! They're just flowers from a friend. I'm always gonna be honest with you, so just ask me anything, okay?",
  "That's sweet that you noticed! A friend grabbed them for me. No hidden storyline here — just someone being nice. You're still my person 💕",
  "I know it might look a certain way, but it's genuinely just a nice gesture from a friend. I'd always tell you if there was more to it. Trust goes both ways!",
  "Aw, no need to stress about it! Just a friend being thoughtful. You know you're the one I'm texting back at 2am, not them 😊",
];

const balancedResponses = [
  "I get the curiosity, but the tone feels a little intense for flowers. They're from a friend — that's the whole story. I'm happy to talk about it, but let's keep it chill?",
  "They're flowers from a friend, not a plot twist. I'm being straight with you. If something's bugging you, let's actually talk about it instead of the one-word interrogation.",
  "Look, I understand the concern, but the way you're asking makes me feel like I did something wrong — and I didn't. It's just flowers. Can we talk like adults about this?",
  "I appreciate that you care enough to ask, but a period after 'Who' hits different and you know it. They're from a friend. Let's not make this a whole thing.",
  "Real talk — the possessive energy isn't it. They're from a friend. I'm telling you because I want to be open, not because I owe an interrogation answer.",
];

const assertiveResponses = [
  "I get that you're curious, but the way you're asking feels more like an interrogation than a conversation. It's flowers from a friend — not a mystery to solve. If you want details, maybe try asking without the courtroom energy?",
  "The 'Who.' with a period is giving detective mode and honestly? Not the vibe. They're flowers. From a friend. If you trust me, cool. If not, that's a bigger conversation we need to have.",
  "Bestie, I mean babe — flowers aren't a crime. A friend got them for me. The fact that your first instinct is suspicion instead of 'that's nice' says more about us than about any bouquet.",
  "I was literally about to tell you the whole story unprompted, but the interrogation approach made me not want to. They're from a classmate. Maybe next time lead with curiosity, not an accusation?",
  "Respectfully, the energy you're bringing to a bouquet of flowers is a lot. It's from a friend. I'm telling you because I want to, not because I have to defend myself. Tone matters.",
  "Not gonna lie, the way you asked that felt controlling. It's flowers from a friend. I shouldn't have to justify a nice gesture from someone. If this is really about trust, let's have that real conversation.",
];

const mainCharacterResponses = [
  "The way you said 'Who.' like you're a detective in a crime drama is sending me. It's flowers from a friend. If my friends being nice to me is a problem, that's a you thing to work through, not a me thing to apologize for.",
  "I was gonna tell you the whole cute story about how my classmate surprised me with flowers, but the possessive energy killed the vibe. It's giving insecurity, not protectiveness. Flowers are flowers. Relax.",
  "Babe. They're sunflowers. From a friend. Not a love letter, not a proposal — literally just petals. The fact that you went full interrogation mode over a plant is telling. Maybe reflect on that one.",
  "The audacity of 'Who.' with a period like I'm on trial for receiving foliage. A friend got them because friends do nice things. I'm not going to apologize for people caring about me — that's actually a flex.",
  "Let me paint you a picture: someone was kind to me. I smiled. I took a photo because they were pretty. That's the entire plot. No twist. No sequel. If that triggers your inner detective, we need to talk about boundaries, not bouquets.",
  "I'm not about to make myself small because flowers made you uncomfortable. A friend got them. Period. The real question isn't 'who got you these' — it's why a kind gesture makes you react like this. Let's unpack that.",
];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function trimToLength(text: string, lengthPercent: number): string {
  if (lengthPercent > 60) return text; // full response

  const sentences = text.split(/(?<=[.!?])\s+/);
  if (lengthPercent < 30) {
    // Short: 1-2 sentences
    return sentences.slice(0, Math.min(2, sentences.length)).join(' ');
  }
  // Medium: ~60% of sentences
  const count = Math.max(2, Math.ceil(sentences.length * 0.6));
  return sentences.slice(0, count).join(' ');
}

export function generateResponse({ tone, length }: GenerateParams): Promise<string> {
  // Simulate API delay for that satisfying loading feel
  return new Promise((resolve) => {
    const delay = 1500 + Math.random() * 1500; // 1.5-3s
    setTimeout(() => {
      let pool: string[];

      if (tone < 25) {
        pool = gentleResponses;
      } else if (tone < 50) {
        pool = balancedResponses;
      } else if (tone < 75) {
        pool = assertiveResponses;
      } else {
        pool = mainCharacterResponses;
      }

      const raw = pickRandom(pool);
      const result = trimToLength(raw, length);
      resolve(result);
    }, delay);
  });
}

// Status messages shown while "cooking"
export const cookingMessages = [
  "bestie is analyzing the drama...",
  "reading between the lines rn...",
  "channeling main character energy...",
  "crafting the perfect clapback...",
  "this reply is about to go crazy...",
  "ok wait this is gonna be good...",
  "loading slay.exe...",
  "calibrating the sass levels...",
];

export function getRandomCookingMessage(): string {
  return pickRandom(cookingMessages);
}
