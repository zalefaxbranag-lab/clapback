export interface HistoryEntry {
  id: string;
  text: string;
  tone: number;
  lang: string;
  reaction?: string;
  createdAt: number;
}

const HISTORY_KEY = 'clapback_history';
const MAX_ENTRIES = 50;

export function getHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addToHistory(entry: Omit<HistoryEntry, 'id' | 'createdAt'>): HistoryEntry {
  const full: HistoryEntry = {
    ...entry,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
  };
  const history = [full, ...getHistory()].slice(0, MAX_ENTRIES);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  return full;
}

export function updateReaction(id: string, reaction: string): void {
  const history = getHistory().map((e) =>
    e.id === id ? { ...e, reaction: e.reaction === reaction ? undefined : reaction } : e
  );
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

export function clearHistory(): void {
  localStorage.removeItem(HISTORY_KEY);
}
