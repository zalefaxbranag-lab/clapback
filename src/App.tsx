import { useState, useRef, useCallback, useEffect } from 'react';
import { generateResponse } from './lib/generateResponse';
import { type Lang, t, tArray } from './lib/i18n';
import {
  getHistory,
  addToHistory,
  updateReaction,
  clearHistory,
  type HistoryEntry,
} from './lib/storage';
import {
  getAiConfig,
  saveAiConfig,
  clearAiConfig,
  generateWithAI,
  type Provider,
} from './lib/ai';

// ─── Types ───────────────────────────────────────────────────────────────────

type Screen = 'landing' | 'customize' | 'cooking' | 'result' | 'history' | 'settings';

// ─── App ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState<Screen>('landing');
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [tone, setTone] = useState(65);
  const [length, setLength] = useState(60);
  const [result, setResult] = useState('');
  const [resultId, setResultId] = useState('');
  const [cookingMsg, setCookingMsg] = useState('');
  const [copied, setCopied] = useState(false);
  const [lang, setLang] = useState<Lang>(() => {
    const saved = localStorage.getItem('clapback_lang');
    if (saved === 'fr' || saved === 'en') return saved;
    return navigator.language.startsWith('fr') ? 'fr' : 'en';
  });
  const [history, setHistory] = useState<HistoryEntry[]>(getHistory);
  const [aiMode, setAiMode] = useState(() => !!getAiConfig());
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Persist language choice
  useEffect(() => {
    localStorage.setItem('clapback_lang', lang);
  }, [lang]);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setScreenshot(e.target?.result as string);
      setScreen('customize');
    };
    reader.readAsDataURL(file);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const pickRandom = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

  const handleCook = async () => {
    setScreen('cooking');
    const msgs = tArray(lang, 'cookingMessages');
    setCookingMsg(pickRandom(msgs));
    const interval = setInterval(() => setCookingMsg(pickRandom(msgs)), 2000);

    try {
      let response: string;
      const aiConfig = getAiConfig();

      if (aiConfig && screenshot) {
        // AI mode: send screenshot to vision API
        try {
          response = await generateWithAI({
            config: aiConfig,
            screenshotBase64: screenshot,
            tone,
            length,
            lang,
          });
        } catch (aiErr) {
          console.warn('AI failed, falling back to templates:', aiErr);
          // Show brief error then fallback
          setCookingMsg(t(lang, 'aiError'));
          await new Promise((r) => setTimeout(r, 1200));
          response = await generateResponse({ tone, length, lang });
        }
      } else {
        // Template mode
        response = await generateResponse({ tone, length, lang });
      }

      setResult(response);
      const entry = addToHistory({ text: response, tone, lang });
      setResultId(entry.id);
      setHistory(getHistory());
      setScreen('result');
    } catch {
      setResult(lang === 'fr' ? 'bestie les vibes ont crash\u00e9... r\u00e9essaie ?' : 'bestie the vibes broke... try again?');
      setScreen('result');
    } finally {
      clearInterval(interval);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = result;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleStartOver = () => {
    setScreenshot(null);
    setResult('');
    setTone(65);
    setLength(60);
    setCopied(false);
    setScreen('landing');
  };

  const handleReaction = (reaction: string) => {
    if (resultId) {
      updateReaction(resultId, reaction);
      setHistory(getHistory());
    }
  };

  const handleClearHistory = () => {
    clearHistory();
    setHistory([]);
  };

  const getToneLabel = () => {
    if (tone < 25) return { emoji: '😇', label: t(lang, 'toneGentle') };
    if (tone < 50) return { emoji: '😌', label: t(lang, 'toneReal') };
    if (tone < 75) return { emoji: '💅', label: t(lang, 'toneAssertive') };
    return { emoji: '👑', label: t(lang, 'toneMainChar') };
  };

  const getLengthLabel = () => {
    if (length < 33) return t(lang, 'lenShort');
    if (length < 66) return t(lang, 'lenMedium');
    return t(lang, 'lenFull');
  };

  const currentReaction = history.find((h) => h.id === resultId)?.reaction;

  return (
    <div className="min-h-[100dvh] bg-[#0a0a0f] text-white flex flex-col pb-[env(safe-area-inset-bottom)]">
      {/* Header */}
      <header className="flex items-center justify-between px-5 pt-[max(0.75rem,env(safe-area-inset-top))] pb-2">
        <button onClick={handleStartOver} className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-lg shadow-lg shadow-purple-500/20 group-hover:shadow-purple-500/40 transition-shadow">
            ⚡
          </div>
          <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            {t(lang, 'appName')}
          </span>
        </button>
        <div className="flex items-center gap-2">
          {/* Language toggle */}
          <button
            onClick={() => setLang(lang === 'en' ? 'fr' : 'en')}
            className="text-xs font-bold px-2.5 py-1.5 rounded-lg bg-white/[0.06] border border-white/[0.08] text-white/50 hover:text-white/80 hover:bg-white/[0.1] transition-all active:scale-95"
          >
            {t(lang, 'langToggle')}
          </button>
          {screen !== 'landing' && screen !== 'history' && (
            <button
              onClick={handleStartOver}
              className="text-sm text-white/40 hover:text-white/70 transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5"
            >
              {t(lang, 'startOver')}
            </button>
          )}
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col px-5 pb-20 no-scrollbar overflow-y-auto">
        {screen === 'landing' && (
          <LandingScreen lang={lang} fileInputRef={fileInputRef} onDrop={handleDrop} />
        )}
        {screen === 'customize' && (
          <CustomizeScreen
            lang={lang}
            screenshot={screenshot}
            tone={tone}
            setTone={setTone}
            length={length}
            setLength={setLength}
            getToneLabel={getToneLabel}
            getLengthLabel={getLengthLabel}
            onCook={handleCook}
            aiMode={aiMode}
          />
        )}
        {screen === 'cooking' && <CookingScreen message={cookingMsg} />}
        {screen === 'result' && (
          <ResultScreen
            lang={lang}
            result={result}
            copied={copied}
            onCopy={handleCopy}
            onRegenerate={handleCook}
            onStartOver={handleStartOver}
            getToneLabel={getToneLabel}
            onReaction={handleReaction}
            currentReaction={currentReaction}
          />
        )}
        {screen === 'history' && (
          <HistoryScreen
            lang={lang}
            history={history}
            onClear={handleClearHistory}
          />
        )}
        {screen === 'settings' && (
          <SettingsScreen
            lang={lang}
            onAiModeChange={setAiMode}
          />
        )}
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#0a0a0f]/90 backdrop-blur-xl border-t border-white/[0.06] pb-[env(safe-area-inset-bottom)]">
        <div className="flex max-w-md mx-auto">
          <button
            onClick={() => (screen === 'history' || screen === 'settings') ? handleStartOver() : undefined}
            className={`flex-1 flex flex-col items-center gap-0.5 py-3 transition-colors ${
              screen !== 'history' && screen !== 'settings' ? 'text-purple-400' : 'text-white/30 hover:text-white/50'
            }`}
          >
            <span className="text-lg">⚡</span>
            <span className="text-[10px] font-semibold">{t(lang, 'navHome')}</span>
          </button>
          <button
            onClick={() => { setHistory(getHistory()); setScreen('history'); }}
            className={`flex-1 flex flex-col items-center gap-0.5 py-3 transition-colors relative ${
              screen === 'history' ? 'text-purple-400' : 'text-white/30 hover:text-white/50'
            }`}
          >
            <span className="text-lg">🧾</span>
            <span className="text-[10px] font-semibold">{t(lang, 'navHistory')}</span>
            {history.length > 0 && (
              <span className="absolute top-2 right-1/4 w-2 h-2 bg-pink-500 rounded-full" />
            )}
          </button>
          <button
            onClick={() => setScreen('settings')}
            className={`flex-1 flex flex-col items-center gap-0.5 py-3 transition-colors relative ${
              screen === 'settings' ? 'text-purple-400' : 'text-white/30 hover:text-white/50'
            }`}
          >
            <span className="text-lg">⚙️</span>
            <span className="text-[10px] font-semibold">{t(lang, 'navSettings')}</span>
            {aiMode && (
              <span className="absolute top-2 right-1/4 w-2 h-2 bg-green-500 rounded-full" />
            )}
          </button>
        </div>
      </nav>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileInput}
      />

      {/* Confetti overlay */}
      {copied && <ConfettiOverlay />}
    </div>
  );
}

// ─── Confetti ────────────────────────────────────────────────────────────────

function ConfettiOverlay() {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    emoji: ['💅', '✨', '🔥', '👑', '💜', '⚡'][i % 6],
    left: Math.random() * 100,
    delay: Math.random() * 0.5,
    duration: 1 + Math.random() * 1.5,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute text-xl"
          style={{
            left: `${p.left}%`,
            top: '-20px',
            animation: `confettiFall ${p.duration}s ease-in ${p.delay}s forwards`,
          }}
        >
          {p.emoji}
        </div>
      ))}
      <style>{`
        @keyframes confettiFall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

// ─── Landing Screen ──────────────────────────────────────────────────────────

function LandingScreen({
  lang,
  fileInputRef,
  onDrop,
}: {
  lang: Lang;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onDrop: (e: React.DragEvent) => void;
}) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-7 fade-in-up">
      <div className="float">
        <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 flex items-center justify-center text-6xl shadow-2xl shadow-purple-500/30 pulse-glow">
          ⚡
        </div>
      </div>

      <div className="text-center space-y-3 fade-in-up-delay-1">
        <h1 className="text-4xl font-black tracking-tight">
          <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
            {t(lang, 'appName')}
          </span>
        </h1>
        <p className="text-white/50 text-lg font-medium max-w-xs mx-auto leading-relaxed">
          {t(lang, 'tagline')}<br />
          <span className="text-white/70">{t(lang, 'taglineHighlight')}</span> ✨
        </p>
      </div>

      <div className="w-full max-w-sm fade-in-up-delay-2">
        <div
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-purple-500/30 rounded-2xl p-8 text-center cursor-pointer hover:border-purple-500/60 hover:bg-purple-500/5 transition-all active:scale-[0.98]"
        >
          <div className="text-4xl mb-3">📱</div>
          <p className="text-white/70 font-semibold text-base">{t(lang, 'uploadCta')}</p>
          <p className="text-white/30 text-sm mt-1.5">{t(lang, 'uploadSub')}</p>
        </div>
      </div>

      <div className="w-full max-w-sm space-y-3 fade-in-up-delay-3">
        <p className="text-xs text-white/30 text-center font-medium uppercase tracking-wider">
          {t(lang, 'howItWorks')}
        </p>
        <div className="flex gap-3">
          {[
            { emoji: '📸', key: 'step1' as const },
            { emoji: '🎚️', key: 'step2' as const },
            { emoji: '🔥', key: 'step3' as const },
          ].map((step, i) => (
            <div key={i} className="flex-1 bg-white/[0.03] rounded-xl p-3 text-center border border-white/[0.05]">
              <div className="text-xl mb-1">{step.emoji}</div>
              <p className="text-[11px] text-white/40 font-medium leading-tight">{t(lang, step.key)}</p>
            </div>
          ))}
        </div>
      </div>

      <p className="text-[10px] text-white/20 text-center mt-auto pt-4">
        {t(lang, 'privacy')} 🔒
      </p>
    </div>
  );
}

// ─── Customize Screen ────────────────────────────────────────────────────────

function CustomizeScreen({
  lang,
  screenshot,
  tone,
  setTone,
  length,
  setLength,
  getToneLabel,
  getLengthLabel,
  onCook,
  aiMode,
}: {
  lang: Lang;
  screenshot: string | null;
  tone: number;
  setTone: (v: number) => void;
  length: number;
  setLength: (v: number) => void;
  getToneLabel: () => { emoji: string; label: string };
  getLengthLabel: () => string;
  onCook: () => void;
  aiMode: boolean;
}) {
  const toneInfo = getToneLabel();

  return (
    <div className="flex-1 flex flex-col gap-5 fade-in-up">
      {screenshot && (
        <div className="w-full max-w-sm mx-auto fade-in-up">
          <p className="text-xs text-white/30 font-medium uppercase tracking-wider mb-2">
            {t(lang, 'evidence')} 📸
          </p>
          <div className="rounded-2xl overflow-hidden border border-white/[0.08] shadow-xl shadow-black/50 max-h-48">
            <img src={screenshot} alt="Chat screenshot" className="w-full h-full object-cover object-top" />
          </div>
        </div>
      )}

      <div className="w-full max-w-sm mx-auto space-y-5 fade-in-up-delay-1">
        {/* Tone slider */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-white/60">{t(lang, 'vibeCheck')}</span>
            <span className="text-sm font-bold flex items-center gap-1.5 bg-white/[0.06] px-3 py-1 rounded-full">
              <span>{toneInfo.emoji}</span>
              <span className="text-white/70">{toneInfo.label}</span>
            </span>
          </div>
          <input type="range" min={0} max={100} value={tone} onChange={(e) => setTone(Number(e.target.value))} />
          <div className="flex justify-between text-[11px] text-white/25 font-medium px-0.5">
            <span>😇 {t(lang, 'gentleBestie')}</span>
            <span>{t(lang, 'mainCharacter')} 👑</span>
          </div>
        </div>

        {/* Length slider */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-white/60">{t(lang, 'replyLength')}</span>
            <span className="text-sm font-bold text-white/70 bg-white/[0.06] px-3 py-1 rounded-full">
              {getLengthLabel()}
            </span>
          </div>
          <input type="range" min={0} max={100} value={length} onChange={(e) => setLength(Number(e.target.value))} />
          <div className="flex justify-between text-[11px] text-white/25 font-medium px-0.5">
            <span>{t(lang, 'shortSweet')}</span>
            <span>{t(lang, 'fullSend')} 📝</span>
          </div>
        </div>
      </div>

      {/* Vibe preset buttons */}
      <div className="w-full max-w-sm mx-auto fade-in-up-delay-2">
        <div className="grid grid-cols-4 gap-2">
          {([
            { emoji: '😇', key: 'presetGentle' as const, min: 0, max: 24 },
            { emoji: '😌', key: 'presetReal' as const, min: 25, max: 49 },
            { emoji: '💅', key: 'presetAssertive' as const, min: 50, max: 74 },
            { emoji: '👑', key: 'presetMainChar' as const, min: 75, max: 100 },
          ]).map((v) => (
            <button
              key={v.key}
              onClick={() => setTone(Math.floor((v.min + v.max) / 2))}
              className={`p-2.5 rounded-xl text-center transition-all border active:scale-95 ${
                tone >= v.min && tone <= v.max
                  ? 'bg-purple-500/20 border-purple-500/50 shadow-lg shadow-purple-500/10'
                  : 'bg-white/[0.03] border-white/[0.05] hover:bg-white/[0.06]'
              }`}
            >
              <div className="text-xl">{v.emoji}</div>
              <div className="text-[10px] text-white/50 mt-0.5 font-medium">{t(lang, v.key)}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Cook button */}
      <div className="w-full max-w-sm mx-auto mt-auto pt-3 fade-in-up-delay-3">
        <button
          onClick={onCook}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 font-bold text-lg shadow-xl shadow-purple-500/25 hover:shadow-purple-500/40 active:scale-[0.97] transition-all relative"
        >
          {t(lang, 'cookReply')} 🔥
          {aiMode && (
            <span className="absolute top-2 right-3 text-[10px] bg-green-500/90 text-white px-2 py-0.5 rounded-full font-bold">
              {t(lang, 'aiPowered')}
            </span>
          )}
        </button>
        <p className="text-[10px] text-white/20 text-center mt-2.5">
          {aiMode ? (t(lang, 'aiPowered') + ' ✨ — ') : ''}{t(lang, 'noDataLeaves')}
        </p>
      </div>
    </div>
  );
}

// ─── Cooking Screen ──────────────────────────────────────────────────────────

function CookingScreen({ message }: { message: string }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-8 fade-in-up">
      <div className="relative">
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-5xl shadow-2xl shadow-purple-500/40 pulse-glow">
          👩‍🍳
        </div>
        <div className="absolute -top-2 -right-2 text-lg bounce-in" style={{ animationDelay: '0.2s' }}>✨</div>
        <div className="absolute -bottom-1 -left-3 text-lg bounce-in" style={{ animationDelay: '0.5s' }}>💫</div>
        <div className="absolute -top-3 left-1/2 text-sm bounce-in" style={{ animationDelay: '0.8s' }}>⭐</div>
      </div>

      <div className="text-center space-y-3">
        <p className="text-white/70 font-semibold text-base">{message}</p>
        <div className="flex items-center justify-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-purple-400 typing-dot" />
          <div className="w-2 h-2 rounded-full bg-pink-400 typing-dot" />
          <div className="w-2 h-2 rounded-full bg-purple-400 typing-dot" />
        </div>
      </div>

      <div className="w-48 h-1.5 bg-white/[0.08] rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shimmer" style={{ width: '100%' }} />
      </div>
    </div>
  );
}

// ─── Result Screen ───────────────────────────────────────────────────────────

function ResultScreen({
  lang,
  result,
  copied,
  onCopy,
  onRegenerate,
  onStartOver,
  getToneLabel,
  onReaction,
  currentReaction,
}: {
  lang: Lang;
  result: string;
  copied: boolean;
  onCopy: () => void;
  onRegenerate: () => void;
  onStartOver: () => void;
  getToneLabel: () => { emoji: string; label: string };
  onReaction: (r: string) => void;
  currentReaction?: string;
}) {
  const toneInfo = getToneLabel();
  const [displayText, setDisplayText] = useState('');
  const [typing, setTyping] = useState(true);

  // Typewriter effect
  useEffect(() => {
    setDisplayText('');
    setTyping(true);
    let i = 0;
    const interval = setInterval(() => {
      if (i < result.length) {
        setDisplayText(result.slice(0, i + 1));
        i++;
      } else {
        setTyping(false);
        clearInterval(interval);
      }
    }, 18);
    return () => clearInterval(interval);
  }, [result]);

  const reactions = [
    { emoji: '🔥', label: t(lang, 'reactionFire'), key: 'fire' },
    { emoji: '💅', label: t(lang, 'reactionSlay'), key: 'slay' },
    { emoji: '🍽️', label: t(lang, 'reactionAte'), key: 'ate' },
    { emoji: '😐', label: t(lang, 'reactionMid'), key: 'mid' },
  ];

  return (
    <div className="flex-1 flex flex-col gap-4 fade-in-up">
      <div className="text-center space-y-1 pt-3">
        <div className="text-3xl bounce-in">💅</div>
        <h2 className="text-xl font-black text-white/90 fade-in-up-delay-1">
          {t(lang, 'resultHeader')}
        </h2>
        <p className="text-sm text-white/40 fade-in-up-delay-2">
          {toneInfo.emoji} {toneInfo.label} {t(lang, 'modeLabel')}
        </p>
      </div>

      {/* Response card */}
      <div className="w-full max-w-sm mx-auto fade-in-up-delay-2">
        <div className="bg-white/[0.05] rounded-2xl p-5 border border-white/[0.08] shadow-xl shadow-purple-500/5 relative">
          <p className="text-white/85 text-[15px] leading-relaxed font-medium">
            {displayText}
            {typing && <span className="inline-block w-0.5 h-4 bg-purple-400 ml-0.5 align-middle animate-pulse" />}
          </p>
        </div>
      </div>

      {/* Reactions */}
      <div className="w-full max-w-sm mx-auto fade-in-up-delay-3">
        <div className="flex justify-center gap-2">
          {reactions.map((r) => (
            <button
              key={r.key}
              onClick={() => onReaction(r.key)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm transition-all active:scale-90 ${
                currentReaction === r.key
                  ? 'bg-purple-500/25 border border-purple-500/50 shadow-md shadow-purple-500/10'
                  : 'bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08]'
              }`}
            >
              <span>{r.emoji}</span>
              <span className="text-[11px] text-white/50 font-medium">{r.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="w-full max-w-sm mx-auto space-y-3">
        <button
          onClick={onCopy}
          className={`w-full py-3.5 rounded-2xl font-bold text-base transition-all active:scale-[0.97] ${
            copied
              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
              : 'bg-gradient-to-r from-purple-500 to-pink-500 shadow-xl shadow-purple-500/25 hover:shadow-purple-500/40'
          }`}
        >
          {copied ? `${t(lang, 'copiedMsg')} 💅` : `${t(lang, 'copyReply')} 📋`}
        </button>

        <div className="flex gap-3">
          <button
            onClick={onRegenerate}
            className="flex-1 py-3 rounded-xl bg-white/[0.06] border border-white/[0.08] text-white/60 font-semibold text-sm hover:bg-white/[0.1] transition-all active:scale-[0.97]"
          >
            {t(lang, 'cookAgain')} 🔄
          </button>
          <button
            onClick={onStartOver}
            className="flex-1 py-3 rounded-xl bg-white/[0.06] border border-white/[0.08] text-white/60 font-semibold text-sm hover:bg-white/[0.1] transition-all active:scale-[0.97]"
          >
            {t(lang, 'newChat')} 📸
          </button>
        </div>
      </div>

      {/* Pro tip */}
      <div className="w-full max-w-sm mx-auto mt-auto pt-3">
        <div className="bg-white/[0.03] rounded-xl p-3 border border-white/[0.05]">
          <p className="text-[11px] text-white/30 text-center leading-relaxed">
            <span className="text-white/50 font-semibold">{t(lang, 'proTip')}</span> {t(lang, 'proTipText')} 💜
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── History Screen ──────────────────────────────────────────────────────────

function HistoryScreen({
  lang,
  history,
  onClear,
}: {
  lang: Lang;
  history: HistoryEntry[];
  onClear: () => void;
}) {
  const [justCleared, setJustCleared] = useState(false);

  const handleClear = () => {
    onClear();
    setJustCleared(true);
    setTimeout(() => setJustCleared(false), 2000);
  };

  const copyEntry = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
  };

  const getToneEmoji = (tone: number) => {
    if (tone < 25) return '😇';
    if (tone < 50) return '😌';
    if (tone < 75) return '💅';
    return '👑';
  };

  const timeAgo = (ts: number) => {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return lang === 'fr' ? "maintenant" : "just now";
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  };

  return (
    <div className="flex-1 flex flex-col gap-4 fade-in-up">
      <div className="flex items-center justify-between pt-2">
        <h2 className="text-xl font-black text-white/90 flex items-center gap-2">
          🧾 {t(lang, 'history')}
        </h2>
        {history.length > 0 && (
          <button
            onClick={handleClear}
            className="text-xs text-white/30 hover:text-red-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-500/10"
          >
            {justCleared ? `✓ ${t(lang, 'clearConfirm')}` : t(lang, 'clearHistory')}
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center">
          <div className="text-5xl opacity-30">🧾</div>
          <p className="text-white/40 font-semibold">{t(lang, 'noHistory')}</p>
          <p className="text-white/20 text-sm">{t(lang, 'noHistorySub')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((entry, i) => (
            <div
              key={entry.id}
              className="bg-white/[0.04] rounded-2xl p-4 border border-white/[0.06] fade-in-up"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-base">{getToneEmoji(entry.tone)}</span>
                  {entry.reaction && (
                    <span className="text-xs bg-purple-500/20 px-2 py-0.5 rounded-full">
                      {entry.reaction === 'fire' ? '🔥' : entry.reaction === 'slay' ? '💅' : entry.reaction === 'ate' ? '🍽️' : '😐'}
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-white/20 font-medium">{timeAgo(entry.createdAt)}</span>
              </div>
              <p className="text-white/70 text-sm leading-relaxed line-clamp-3">{entry.text}</p>
              <button
                onClick={() => copyEntry(entry.text)}
                className="mt-2.5 text-[11px] text-purple-400/70 hover:text-purple-400 font-semibold transition-colors"
              >
                {t(lang, 'copyReply')} 📋
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Settings Screen ─────────────────────────────────────────────────────────

function SettingsScreen({
  lang,
  onAiModeChange,
}: {
  lang: Lang;
  onAiModeChange: (v: boolean) => void;
}) {
  const existing = getAiConfig();
  const [provider, setProvider] = useState<Provider>(existing?.provider || 'openai');
  const [keyInput, setKeyInput] = useState(existing?.apiKey || '');
  const [saved, setSaved] = useState(false);
  const hasKey = !!existing;

  const handleSave = () => {
    if (!keyInput.trim()) return;
    saveAiConfig({ provider, apiKey: keyInput.trim() });
    onAiModeChange(true);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleRemove = () => {
    clearAiConfig();
    setKeyInput('');
    onAiModeChange(false);
  };

  return (
    <div className="flex-1 flex flex-col gap-5 fade-in-up">
      <div className="pt-2">
        <h2 className="text-xl font-black text-white/90 flex items-center gap-2">
          ⚙️ {t(lang, 'settingsTitle')}
        </h2>
      </div>

      {/* Info card */}
      <div className="w-full max-w-sm mx-auto">
        <div className="bg-purple-500/10 rounded-2xl p-4 border border-purple-500/20">
          <p className="text-sm text-white/60 leading-relaxed">
            {t(lang, 'noKeyInfo')}
          </p>
        </div>
      </div>

      {/* Status badge */}
      <div className="w-full max-w-sm mx-auto">
        <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl ${
          hasKey ? 'bg-green-500/10 border border-green-500/20' : 'bg-white/[0.04] border border-white/[0.06]'
        }`}>
          <span className={`w-2.5 h-2.5 rounded-full ${hasKey ? 'bg-green-500' : 'bg-white/20'}`} />
          <span className="text-sm font-semibold text-white/70">
            {hasKey ? `${t(lang, 'aiPowered')} ✨ — ${existing.provider === 'openai' ? 'OpenAI' : 'Claude'}` : t(lang, 'templateMode')}
          </span>
        </div>
      </div>

      {/* Provider selector */}
      <div className="w-full max-w-sm mx-auto space-y-2">
        <label className="text-sm font-semibold text-white/60">{t(lang, 'aiProvider')}</label>
        <div className="flex gap-2">
          {(['openai', 'anthropic'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setProvider(p)}
              className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all active:scale-95 border ${
                provider === p
                  ? 'bg-purple-500/20 border-purple-500/50 text-white/90'
                  : 'bg-white/[0.03] border-white/[0.06] text-white/40 hover:bg-white/[0.06]'
              }`}
            >
              {p === 'openai' ? '🤖 OpenAI' : '🟣 Claude'}
            </button>
          ))}
        </div>
      </div>

      {/* API key input */}
      <div className="w-full max-w-sm mx-auto space-y-2">
        <label className="text-sm font-semibold text-white/60">{t(lang, 'apiKey')}</label>
        <input
          type="password"
          value={keyInput}
          onChange={(e) => setKeyInput(e.target.value)}
          placeholder={t(lang, 'apiKeyPlaceholder')}
          className="w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/[0.1] text-white/90 text-sm placeholder:text-white/25 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 transition-all"
        />
      </div>

      {/* Actions */}
      <div className="w-full max-w-sm mx-auto space-y-2">
        <button
          onClick={handleSave}
          disabled={!keyInput.trim()}
          className={`w-full py-3 rounded-xl font-bold text-sm transition-all active:scale-[0.97] ${
            saved
              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
              : keyInput.trim()
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg shadow-purple-500/20'
                : 'bg-white/[0.06] text-white/20 cursor-not-allowed'
          }`}
        >
          {saved ? `✓ ${t(lang, 'apiKeySaved')}` : t(lang, 'saveKey')}
        </button>
        {hasKey && (
          <button
            onClick={handleRemove}
            className="w-full py-2.5 rounded-xl text-sm font-semibold text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            {t(lang, 'removeKey')}
          </button>
        )}
      </div>

      {/* Privacy note */}
      <div className="w-full max-w-sm mx-auto mt-auto pt-3">
        <div className="bg-white/[0.03] rounded-xl p-3 border border-white/[0.05]">
          <p className="text-[11px] text-white/30 text-center leading-relaxed">
            🔒 {t(lang, 'settingsInfo')}
          </p>
        </div>
      </div>
    </div>
  );
}
