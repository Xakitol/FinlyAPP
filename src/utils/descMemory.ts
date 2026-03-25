export interface DescMemoryEntry {
  incomeCount: number;
  expenseCount: number;
  lastType: 'income' | 'expense';
  lastSeenAt: string; // ISO date
  categoryByType: {
    income?: string;
    expense?: string;
  };
}

export type DescMemory = Record<string, DescMemoryEntry>;
export type Confidence = 'high' | 'suggestion' | 'ambiguous';

const STORAGE_KEY = 'finly_desc_memory';

// ── Migration from old flat format ────────────────────────────────────────────

function migrate(raw: Record<string, unknown>): DescMemory {
  const result: DescMemory = {};
  for (const [key, value] of Object.entries(raw)) {
    if (!value || typeof value !== 'object') continue;
    const v = value as Record<string, unknown>;
    if (typeof v.type === 'string' && (v.type === 'income' || v.type === 'expense')) {
      // Old format: { type, category }
      const type = v.type as 'income' | 'expense';
      const category = typeof v.category === 'string' ? v.category : '';
      result[key] = {
        incomeCount: type === 'income' ? 1 : 0,
        expenseCount: type === 'expense' ? 1 : 0,
        lastType: type,
        lastSeenAt: '',
        categoryByType: { [type]: category },
      };
    } else if (typeof v.incomeCount === 'number') {
      // Already new format
      result[key] = v as DescMemoryEntry;
    }
  }
  return result;
}

// ── Storage ───────────────────────────────────────────────────────────────────

export function loadDescMemory(): DescMemory {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null');
    if (!raw || typeof raw !== 'object') return {};
    return migrate(raw as Record<string, unknown>);
  } catch {
    return {};
  }
}

export function saveDescMemory(memory: DescMemory): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(memory));
}

// ── Logic ─────────────────────────────────────────────────────────────────────

/**
 * Returns confidence level for a memory entry.
 * - 'high'      → seen 3+ times, only one direction
 * - 'suggestion'→ seen 1–2 times, only one direction
 * - 'ambiguous' → seen in both income and expense
 */
export function getConfidence(entry: DescMemoryEntry): Confidence {
  const bothSeen = entry.incomeCount > 0 && entry.expenseCount > 0;
  if (bothSeen) return 'ambiguous';
  const total = entry.incomeCount + entry.expenseCount;
  return total >= 3 ? 'high' : 'suggestion';
}

/**
 * Returns the dominant type for high/suggestion entries, null for ambiguous.
 */
export function getDominantType(entry: DescMemoryEntry): 'income' | 'expense' | null {
  if (getConfidence(entry) === 'ambiguous') return null;
  return entry.incomeCount > entry.expenseCount ? 'income' : 'expense';
}

/**
 * Auto-classify a description from memory.
 * Returns null if unknown or ambiguous — caller must not auto-apply those.
 */
export function autoClassify(
  memory: DescMemory,
  description: string,
): { type: 'income' | 'expense'; category?: string; confidence: Confidence } | null {
  const key = description.trim().toLowerCase();
  const entry = memory[key];
  if (!entry) return null;
  const confidence = getConfidence(entry);
  if (confidence === 'ambiguous') return null;
  const type = getDominantType(entry)!;
  return { type, category: entry.categoryByType[type], confidence };
}

/**
 * Find all memory entries whose key includes the query.
 */
export function getSuggestions(
  memory: DescMemory,
  query: string,
): Array<{ description: string; entry: DescMemoryEntry; confidence: Confidence }> {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return Object.entries(memory)
    .filter(([key]) => key.includes(q))
    .map(([description, entry]) => ({ description, entry, confidence: getConfidence(entry) }))
    .slice(0, 5);
}

/**
 * Record a completed transaction into memory and return the updated memory.
 * Does NOT save to localStorage — caller must call saveDescMemory().
 */
export function recordTransaction(
  memory: DescMemory,
  description: string,
  type: 'income' | 'expense',
  category: string,
): DescMemory {
  const key = description.trim().toLowerCase();
  if (!key) return memory;
  const prev = memory[key] ?? {
    incomeCount: 0,
    expenseCount: 0,
    lastType: type,
    lastSeenAt: '',
    categoryByType: {},
  };
  return {
    ...memory,
    [key]: {
      incomeCount: prev.incomeCount + (type === 'income' ? 1 : 0),
      expenseCount: prev.expenseCount + (type === 'expense' ? 1 : 0),
      lastType: type,
      lastSeenAt: new Date().toISOString(),
      categoryByType: {
        ...prev.categoryByType,
        [type]: category,
      },
    },
  };
}

/**
 * Remove a key from memory.
 */
export function removeFromMemory(memory: DescMemory, description: string): DescMemory {
  const key = description.trim().toLowerCase();
  const next = { ...memory };
  delete next[key];
  return next;
}
