export type Lang = 'en' | 'fr';

const translations = {
  en: {
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
      'AI is reading the toxicity levels...',
      'your reply is being manifested...',
    ],

    // Result
    resultHeader: 'ok this kinda ate',
    modeLabel: 'mode',
    copyReply: 'copy reply',
    copiedMsg: 'copied! now go send it',
    cookAgain: 'cook again',
    newChat: 'new chat',
    proTip: 'pro tip:',
    proTipText: "setting boundaries isn't toxic \u2014 it's self-respect. you deserve healthy communication",

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
    navSettings: 'settings',

    // Language
    langToggle: 'FR',

    // Settings
    settingsTitle: 'settings',
    aiProvider: 'AI provider',
    apiKey: 'API key',
    apiKeyPlaceholder: 'paste your API key here',
    apiKeySaved: 'saved!',
    saveKey: 'save key',
    removeKey: 'remove key',
    settingsInfo: 'your key is stored locally and sent directly to the AI provider. we never see it.',
    noKeyInfo: 'without a key, ClapBack uses pre-written templates. with a key, AI reads your screenshot and writes a custom reply.',
    providerOpenAI: 'OpenAI',
    providerAnthropic: 'Claude',
    aiPowered: 'AI',
    templateMode: 'templates',

    // Errors
    aiError: 'AI had a moment... trying templates instead',
  },

  fr: {
    appName: 'ClapBack',
    startOver: 'recommencer',

    // Landing
    tagline: 'ta bestie IA pour des',
    taglineHighlight: "r\u00e9ponses de boss",
    uploadCta: 'balance ton screen bestie',
    uploadSub: 'appuie pour upload ou glisse-d\u00e9pose',
    howItWorks: 'comment \u00e7a marche',
    step1: 'screen la convo',
    step2: 'choisis ta vibe',
    step3: 'chope ta r\u00e9ponse',
    privacy: 'tes screens restent sur ton tel. point final.',

    // Customize
    evidence: 'la pi\u00e8ce \u00e0 conviction',
    vibeCheck: 'vibe check',
    replyLength: 'longueur',
    gentleBestie: 'mode doux',
    mainCharacter: 'perso principal',
    shortSweet: 'court & pr\u00e9cis',
    fullSend: 'full envoi',
    cookReply: 'go cuisine',
    noDataLeaves: 'rien ne quitte ton t\u00e9l\u00e9phone',

    // Tone labels
    toneGentle: 'mode doux',
    toneReal: 'on reste real',
    toneAssertive: 'queen mode',
    toneMainChar: 'perso principal',

    // Length labels
    lenShort: 'court & pr\u00e9cis',
    lenMedium: 'nickel',
    lenFull: 'full envoi',

    // Vibe presets
    presetGentle: 'doux',
    presetReal: 'real',
    presetAssertive: 'queen',
    presetMainChar: 'boss',

    // Cooking
    cookingMessages: [
      'bestie analyse le drama l\u00e0...',
      'on d\u00e9crypte les messages...',
      'canalisation du main character energy...',
      'on craft le clapback parfait...',
      'cette r\u00e9ponse va tout casser...',
      'ok attends \u00e7a va \u00eatre une tuerie...',
      'chargement de slay.exe...',
      'calibrage du niveau sass...',
      "l'IA lit les red flags...",
      'ta r\u00e9ponse est en train de se manifester...',
    ],

    // Result
    resultHeader: '\u00e7a c\'est du lourd',
    modeLabel: 'mode',
    copyReply: 'copier',
    copiedMsg: 'copi\u00e9 ! envoie \u00e7a',
    cookAgain: 'recuisiner',
    newChat: 'nouvelle convo',
    proTip: 'rappel :',
    proTipText: "poser ses limites c'est pas \u00eatre toxique \u2014 c'est du respect de soi. tu m\u00e9rites mieux",

    // Reactions
    reactionSlay: 'slay',
    reactionAte: 'a g\u00e9r\u00e9',
    reactionMid: 'bof',
    reactionFire: 'feu',

    // History
    history: 'historique',
    noHistory: 'rien ici pour le moment bestie',
    noHistorySub: 'cuisine ta premi\u00e8re r\u00e9ponse pour la voir ici',
    clearHistory: 'tout vider',
    clearConfirm: 'vid\u00e9 !',

    // Nav
    navHome: 'accueil',
    navHistory: 'historique',
    navSettings: 'r\u00e9glages',

    // Language
    langToggle: 'EN',

    // Settings
    settingsTitle: 'r\u00e9glages',
    aiProvider: 'fournisseur IA',
    apiKey: 'cl\u00e9 API',
    apiKeyPlaceholder: 'colle ta cl\u00e9 API ici',
    apiKeySaved: 'enregistr\u00e9 !',
    saveKey: 'sauvegarder',
    removeKey: 'supprimer la cl\u00e9',
    settingsInfo: 'ta cl\u00e9 est stock\u00e9e localement et envoy\u00e9e directement au fournisseur IA. on la voit jamais.',
    noKeyInfo: "sans cl\u00e9, ClapBack utilise des r\u00e9ponses pr\u00e9-\u00e9crites. avec une cl\u00e9, l'IA lit ton screen et \u00e9crit une r\u00e9ponse sur mesure.",
    providerOpenAI: 'OpenAI',
    providerAnthropic: 'Claude',
    aiPowered: 'IA',
    templateMode: 'mod\u00e8les',

    // Errors
    aiError: "l'IA a bug\u00e9... on passe aux mod\u00e8les",
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
