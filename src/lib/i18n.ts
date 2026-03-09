export type Lang = 'en' | 'fr';

const translations = {
  en: {
    // Header
    appName: 'ClapBack',
    startOver: 'start over',

    // Landing
    tagline: 'your ai bestie for crafting',
    taglineHighlight: 'main character replies',
    uploadCta: 'drop that screenshot bestie',
    uploadSub: 'tap to upload or drag & drop',
    howItWorks: 'how it works',
    step1: 'screenshot the chat',
    step2: 'set the vibe',
    step3: 'get your reply',
    privacy: 'your screenshots stay on your device. always.',

    // Customize
    evidence: 'the evidence',
    vibeCheck: 'vibe check',
    replyLength: 'reply length',
    gentleBestie: 'gentle bestie',
    mainCharacter: 'main character',
    shortSweet: 'short & sweet',
    fullSend: 'full send',
    cookReply: 'cook my reply',
    noDataLeaves: 'no screenshot data leaves your phone',

    // Tone labels
    toneGentle: 'gentle bestie',
    toneReal: 'keeping it real',
    toneAssertive: 'assertive queen',
    toneMainChar: 'main character',

    // Length labels
    lenShort: 'short & sweet',
    lenMedium: 'just right',
    lenFull: 'full send',

    // Vibe presets
    presetGentle: 'gentle',
    presetReal: 'real',
    presetAssertive: 'assertive',
    presetMainChar: 'main char',

    // Cooking
    cookingMessages: [
      'bestie is analyzing the drama...',
      'reading between the lines rn...',
      'channeling main character energy...',
      'crafting the perfect clapback...',
      'this reply is about to go crazy...',
      'ok wait this is gonna be good...',
      'loading slay.exe...',
      'calibrating the sass levels...',
    ],

    // Result
    resultHeader: 'ok this kinda ate',
    modeLabel: 'mode',
    copyReply: 'copy reply',
    copiedMsg: 'copied! now go send it',
    cookAgain: 'cook again',
    newChat: 'new chat',
    proTip: 'pro tip:',
    proTipText: "setting boundaries isn't toxic — it's self-respect. you deserve healthy communication",

    // Reactions
    reactionSlay: 'slay',
    reactionAte: 'ate',
    reactionMid: 'mid',
    reactionFire: 'fire',

    // History
    history: 'receipts',
    noHistory: 'no receipts yet bestie',
    noHistorySub: 'cook your first reply to see it here',
    clearHistory: 'clear all',
    clearConfirm: 'cleared!',

    // Nav
    navHome: 'home',
    navHistory: 'receipts',

    // Language
    langToggle: 'FR',
  },

  fr: {
    // Header
    appName: 'ClapBack',
    startOver: 'recommencer',

    // Landing
    tagline: 'ta bestie IA pour crafter des',
    taglineHighlight: "r\u00e9ponses de queen",
    uploadCta: 'drop ton screenshot bestie',
    uploadSub: 'tape pour upload ou glisse',
    howItWorks: 'comment \u00e7a marche',
    step1: 'screenshot le chat',
    step2: 'choisis la vibe',
    step3: 'r\u00e9cup ta r\u00e9ponse',
    privacy: 'tes screenshots restent sur ton t\u00e9l. toujours.',

    // Customize
    evidence: 'la preuve',
    vibeCheck: 'vibe check',
    replyLength: 'longueur',
    gentleBestie: 'bestie douce',
    mainCharacter: 'perso principal',
    shortSweet: 'court & mignon',
    fullSend: 'full envoi',
    cookReply: 'cuisine ma r\u00e9ponse',
    noDataLeaves: 'aucune donn\u00e9e ne quitte ton t\u00e9l',

    // Tone labels
    toneGentle: 'bestie douce',
    toneReal: 'on garde le real',
    toneAssertive: 'queen assertive',
    toneMainChar: 'perso principal',

    // Length labels
    lenShort: 'court & mignon',
    lenMedium: 'parfait',
    lenFull: 'full envoi',

    // Vibe presets
    presetGentle: 'douce',
    presetReal: 'real',
    presetAssertive: 'assertive',
    presetMainChar: 'queen',

    // Cooking
    cookingMessages: [
      'bestie analyse le drama...',
      'lecture entre les lignes rn...',
      'on canalise le main character energy...',
      'on craft le clapback parfait...',
      'cette r\u00e9ponse va \u00eatre ouf...',
      'ok attends \u00e7a va \u00eatre bon...',
      'chargement slay.exe...',
      'calibrage du niveau sass...',
    ],

    // Result
    resultHeader: 'ok \u00e7a mange un peu',
    modeLabel: 'mode',
    copyReply: 'copier la r\u00e9ponse',
    copiedMsg: 'copi\u00e9! maintenant envoie',
    cookAgain: 'recuisiner',
    newChat: 'nouveau chat',
    proTip: 'conseil:',
    proTipText: "poser des limites c'est pas toxique — c'est du respect de soi. tu m\u00e9rites une communication saine",

    // Reactions
    reactionSlay: 'slay',
    reactionAte: 'a mang\u00e9',
    reactionMid: 'mid',
    reactionFire: 'feu',

    // History
    history: 're\u00e7us',
    noHistory: 'pas encore de re\u00e7us bestie',
    noHistorySub: 'cuisine ta premi\u00e8re r\u00e9ponse pour la voir ici',
    clearHistory: 'tout effacer',
    clearConfirm: 'effac\u00e9!',

    // Nav
    navHome: 'accueil',
    navHistory: 're\u00e7us',

    // Language
    langToggle: 'EN',
  },
} as const;

export type TranslationKey = keyof typeof translations.en;

export function t(lang: Lang, key: TranslationKey): string {
  const val = translations[lang][key];
  if (Array.isArray(val)) return val[0];
  return val as string;
}

export function tArray(lang: Lang, key: TranslationKey): string[] {
  const val = translations[lang][key];
  if (Array.isArray(val)) return val as unknown as string[];
  return [val as string];
}
