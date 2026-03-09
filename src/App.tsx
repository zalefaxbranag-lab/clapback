import { useState, useRef, useCallback, useEffect } from 'react';
import { generateResponse, getRandomCookingMessage } from './lib/generateResponse';

// ─── Types ───────────────────────────────────────────────────────────────────

type Screen = 'landing' | 'customize' | 'cooking' | 'result';

// ─── App ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState<Screen>('landing');
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [tone, setTone] = useState(65);
  const [length, setLength] = useState(60);
  const [result, setResult] = useState('');
  const [cookingMsg, setCookingMsg] = useState('');
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file upload
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

  // Generate response
  const handleCook = async () => {
    setScreen('cooking');
    setCookingMsg(getRandomCookingMessage());

    // Rotate cooking messages
    const interval = setInterval(() => {
      setCookingMsg(getRandomCookingMessage());
    }, 2000);

    try {
      const response = await generateResponse({ tone, length });
      setResult(response);
      setScreen('result');
    } catch {
      setResult("bestie the vibes broke... try again? 😭");
      setScreen('result');
    } finally {
      clearInterval(interval);
    }
  };

  // Copy to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const ta = document.createElement('textarea');
      ta.value = result;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Regenerate with same settings
  const handleRegenerate = () => {
    handleCook();
  };

  // Start over
  const handleStartOver = () => {
    setScreenshot(null);
    setResult('');
    setTone(65);
    setLength(60);
    setScreen('landing');
  };

  // Tone label
  const getToneLabel = () => {
    if (tone < 25) return { emoji: '😇', label: 'gentle bestie' };
    if (tone < 50) return { emoji: '😌', label: 'keeping it real' };
    if (tone < 75) return { emoji: '💅', label: 'assertive queen' };
    return { emoji: '👑', label: 'main character' };
  };

  const getLengthLabel = () => {
    if (length < 33) return 'short & sweet';
    if (length < 66) return 'just right';
    return 'full send';
  };

  return (
    <div className="min-h-[100dvh] bg-[#0a0a0f] text-white flex flex-col">
      {/* Header - always visible */}
      <header className="flex items-center justify-between px-5 pt-5 pb-2">
        <button
          onClick={handleStartOver}
          className="flex items-center gap-2 group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-lg shadow-lg shadow-purple-500/20 group-hover:shadow-purple-500/40 transition-shadow">
            ⚡
          </div>
          <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            ClapBack
          </span>
        </button>
        {screen !== 'landing' && (
          <button
            onClick={handleStartOver}
            className="text-sm text-white/40 hover:text-white/70 transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5"
          >
            start over
          </button>
        )}
      </header>

      {/* Main content area */}
      <main className="flex-1 flex flex-col px-5 pb-6">
        {screen === 'landing' && (
          <LandingScreen
            fileInputRef={fileInputRef}
            onFileInput={handleFileInput}
            onDrop={handleDrop}
          />
        )}
        {screen === 'customize' && (
          <CustomizeScreen
            screenshot={screenshot}
            tone={tone}
            setTone={setTone}
            length={length}
            setLength={setLength}
            getToneLabel={getToneLabel}
            getLengthLabel={getLengthLabel}
            onCook={handleCook}
          />
        )}
        {screen === 'cooking' && (
          <CookingScreen message={cookingMsg} />
        )}
        {screen === 'result' && (
          <ResultScreen
            result={result}
            copied={copied}
            onCopy={handleCopy}
            onRegenerate={handleRegenerate}
            onStartOver={handleStartOver}
            tone={tone}
            getToneLabel={getToneLabel}
          />
        )}
      </main>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileInput}
      />
    </div>
  );
}

// ─── Landing Screen ──────────────────────────────────────────────────────────

function LandingScreen({
  fileInputRef,
  onFileInput,
  onDrop,
}: {
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDrop: (e: React.DragEvent) => void;
}) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-8 fade-in-up">
      {/* Hero mascot */}
      <div className="float">
        <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 flex items-center justify-center text-6xl shadow-2xl shadow-purple-500/30 pulse-glow">
          ⚡
        </div>
      </div>

      {/* Hero text */}
      <div className="text-center space-y-3 fade-in-up-delay-1">
        <h1 className="text-4xl font-black tracking-tight">
          <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
            ClapBack
          </span>
        </h1>
        <p className="text-white/50 text-lg font-medium max-w-xs mx-auto leading-relaxed">
          your ai bestie for crafting<br />
          <span className="text-white/70">main character replies</span> ✨
        </p>
      </div>

      {/* Upload area */}
      <div className="w-full max-w-sm fade-in-up-delay-2">
        <div
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-purple-500/30 rounded-2xl p-8 text-center cursor-pointer hover:border-purple-500/60 hover:bg-purple-500/5 transition-all active:scale-[0.98]"
        >
          <div className="text-4xl mb-3">📱</div>
          <p className="text-white/70 font-semibold text-base">
            drop that screenshot bestie
          </p>
          <p className="text-white/30 text-sm mt-1.5">
            tap to upload or drag & drop
          </p>
        </div>
      </div>

      {/* How it works */}
      <div className="w-full max-w-sm space-y-3 fade-in-up-delay-3">
        <p className="text-xs text-white/30 text-center font-medium uppercase tracking-wider">how it works</p>
        <div className="flex gap-3">
          {[
            { emoji: '📸', text: 'screenshot the chat' },
            { emoji: '🎚️', text: 'set the vibe' },
            { emoji: '🔥', text: 'get your reply' },
          ].map((step, i) => (
            <div
              key={i}
              className="flex-1 bg-white/[0.03] rounded-xl p-3 text-center border border-white/[0.05]"
            >
              <div className="text-xl mb-1">{step.emoji}</div>
              <p className="text-[11px] text-white/40 font-medium leading-tight">{step.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Subtle footer */}
      <p className="text-[10px] text-white/20 text-center mt-auto pt-4">
        your screenshots stay on your device. always. 🔒
      </p>
    </div>
  );
}

// ─── Customize Screen ────────────────────────────────────────────────────────

function CustomizeScreen({
  screenshot,
  tone,
  setTone,
  length,
  setLength,
  getToneLabel,
  getLengthLabel,
  onCook,
}: {
  screenshot: string | null;
  tone: number;
  setTone: (v: number) => void;
  length: number;
  setLength: (v: number) => void;
  getToneLabel: () => { emoji: string; label: string };
  getLengthLabel: () => string;
  onCook: () => void;
}) {
  const toneInfo = getToneLabel();

  return (
    <div className="flex-1 flex flex-col gap-5 fade-in-up">
      {/* Screenshot preview */}
      {screenshot && (
        <div className="w-full max-w-sm mx-auto fade-in-up">
          <p className="text-xs text-white/30 font-medium uppercase tracking-wider mb-2">
            the evidence 📸
          </p>
          <div className="rounded-2xl overflow-hidden border border-white/[0.08] shadow-xl shadow-black/50 max-h-52">
            <img
              src={screenshot}
              alt="Chat screenshot"
              className="w-full h-full object-cover object-top"
            />
          </div>
        </div>
      )}

      {/* Sliders */}
      <div className="w-full max-w-sm mx-auto space-y-6 fade-in-up-delay-1">
        {/* Tone slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-white/60">vibe check</span>
            <span className="text-sm font-bold flex items-center gap-1.5 bg-white/[0.06] px-3 py-1 rounded-full">
              <span>{toneInfo.emoji}</span>
              <span className="text-white/70">{toneInfo.label}</span>
            </span>
          </div>

          <input
            type="range"
            min={0}
            max={100}
            value={tone}
            onChange={(e) => setTone(Number(e.target.value))}
          />

          <div className="flex justify-between text-[11px] text-white/25 font-medium px-0.5">
            <span>😇 gentle bestie</span>
            <span>main character 👑</span>
          </div>
        </div>

        {/* Length slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-white/60">reply length</span>
            <span className="text-sm font-bold text-white/70 bg-white/[0.06] px-3 py-1 rounded-full">
              {getLengthLabel()}
            </span>
          </div>

          <input
            type="range"
            min={0}
            max={100}
            value={length}
            onChange={(e) => setLength(Number(e.target.value))}
          />

          <div className="flex justify-between text-[11px] text-white/25 font-medium px-0.5">
            <span>short & sweet</span>
            <span>full send 📝</span>
          </div>
        </div>
      </div>

      {/* Vibe preview cards */}
      <div className="w-full max-w-sm mx-auto fade-in-up-delay-2">
        <div className="grid grid-cols-4 gap-2">
          {[
            { emoji: '😇', label: 'gentle', min: 0, max: 24 },
            { emoji: '😌', label: 'real', min: 25, max: 49 },
            { emoji: '💅', label: 'assertive', min: 50, max: 74 },
            { emoji: '👑', label: 'main char', min: 75, max: 100 },
          ].map((v) => (
            <button
              key={v.label}
              onClick={() => setTone(Math.floor((v.min + v.max) / 2))}
              className={`p-2.5 rounded-xl text-center transition-all border ${
                tone >= v.min && tone <= v.max
                  ? 'bg-purple-500/20 border-purple-500/50 shadow-lg shadow-purple-500/10'
                  : 'bg-white/[0.03] border-white/[0.05] hover:bg-white/[0.06]'
              }`}
            >
              <div className="text-xl">{v.emoji}</div>
              <div className="text-[10px] text-white/50 mt-0.5 font-medium">{v.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Cook button */}
      <div className="w-full max-w-sm mx-auto mt-auto pt-4 fade-in-up-delay-3">
        <button
          onClick={onCook}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 font-bold text-lg shadow-xl shadow-purple-500/25 hover:shadow-purple-500/40 active:scale-[0.97] transition-all"
        >
          cook my reply 🔥
        </button>
        <p className="text-[10px] text-white/20 text-center mt-3">
          no screenshot data leaves your phone
        </p>
      </div>
    </div>
  );
}

// ─── Cooking Screen (Loading) ────────────────────────────────────────────────

function CookingScreen({ message }: { message: string }) {
  const [dots, setDots] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((d) => (d + 1) % 4);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-8 fade-in-up">
      {/* Cooking animation */}
      <div className="relative">
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-5xl shadow-2xl shadow-purple-500/40 pulse-glow">
          👩‍🍳
        </div>
        {/* Sparkle particles */}
        <div className="absolute -top-2 -right-2 text-lg bounce-in" style={{ animationDelay: '0.2s' }}>✨</div>
        <div className="absolute -bottom-1 -left-3 text-lg bounce-in" style={{ animationDelay: '0.5s' }}>💫</div>
        <div className="absolute -top-3 left-1/2 text-sm bounce-in" style={{ animationDelay: '0.8s' }}>⭐</div>
      </div>

      {/* Status text */}
      <div className="text-center space-y-2">
        <p className="text-white/70 font-semibold text-base">
          {message}
        </p>
        <div className="flex items-center justify-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-purple-400 typing-dot"></div>
          <div className="w-2 h-2 rounded-full bg-pink-400 typing-dot"></div>
          <div className="w-2 h-2 rounded-full bg-purple-400 typing-dot"></div>
        </div>
      </div>

      {/* Loading bar */}
      <div className="w-48 h-1.5 bg-white/[0.08] rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shimmer" style={{ width: '100%' }}></div>
      </div>
    </div>
  );
}

// ─── Result Screen ───────────────────────────────────────────────────────────

function ResultScreen({
  result,
  copied,
  onCopy,
  onRegenerate,
  onStartOver,
  tone,
  getToneLabel,
}: {
  result: string;
  copied: boolean;
  onCopy: () => void;
  onRegenerate: () => void;
  onStartOver: () => void;
  tone: number;
  getToneLabel: () => { emoji: string; label: string };
}) {
  const toneInfo = getToneLabel();

  return (
    <div className="flex-1 flex flex-col gap-5 fade-in-up">
      {/* Header */}
      <div className="text-center space-y-1 pt-4">
        <div className="text-3xl bounce-in">💅</div>
        <h2 className="text-xl font-black text-white/90 fade-in-up-delay-1">
          ok this kinda ate
        </h2>
        <p className="text-sm text-white/40 fade-in-up-delay-2">
          {toneInfo.emoji} {toneInfo.label} mode
        </p>
      </div>

      {/* Response card */}
      <div className="w-full max-w-sm mx-auto fade-in-up-delay-2">
        <div className="bg-white/[0.05] rounded-2xl p-5 border border-white/[0.08] shadow-xl shadow-purple-500/5">
          <p className="text-white/85 text-[15px] leading-relaxed font-medium">
            {result}
          </p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="w-full max-w-sm mx-auto space-y-3 fade-in-up-delay-3">
        {/* Primary: Copy */}
        <button
          onClick={onCopy}
          className={`w-full py-3.5 rounded-2xl font-bold text-base transition-all active:scale-[0.97] ${
            copied
              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
              : 'bg-gradient-to-r from-purple-500 to-pink-500 shadow-xl shadow-purple-500/25 hover:shadow-purple-500/40'
          }`}
        >
          {copied ? 'copied! now go send it 💅' : 'copy reply 📋'}
        </button>

        {/* Secondary actions */}
        <div className="flex gap-3">
          <button
            onClick={onRegenerate}
            className="flex-1 py-3 rounded-xl bg-white/[0.06] border border-white/[0.08] text-white/60 font-semibold text-sm hover:bg-white/[0.1] transition-all active:scale-[0.97]"
          >
            cook again 🔄
          </button>
          <button
            onClick={onStartOver}
            className="flex-1 py-3 rounded-xl bg-white/[0.06] border border-white/[0.08] text-white/60 font-semibold text-sm hover:bg-white/[0.1] transition-all active:scale-[0.97]"
          >
            new chat 📸
          </button>
        </div>
      </div>

      {/* Fun footer tips */}
      <div className="w-full max-w-sm mx-auto mt-auto pt-4">
        <div className="bg-white/[0.03] rounded-xl p-3 border border-white/[0.05]">
          <p className="text-[11px] text-white/30 text-center leading-relaxed">
            <span className="text-white/50 font-semibold">pro tip:</span> setting boundaries isn't toxic — it's self-respect.
            you deserve healthy communication 💜
          </p>
        </div>
      </div>
    </div>
  );
}
