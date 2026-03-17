import * as XLSX from 'xlsx';
import type { DescMemory } from './descMemory';
import { autoClassify } from './descMemory';

export interface ParsedRow {
  id: string;
  date: string;          // YYYY-MM-DD or '' if unparseable
  description: string;
  amount: number;        // always positive
  type: 'income' | 'expense';
  category: string;
  confidence: 'high' | 'suggestion' | 'ambiguous' | 'inferred' | 'unknown';
  needsReview: boolean;
  isPdfRow?: boolean;    // PDF rows are always flagged for review
}

// ── Category keyword inference ─────────────────────────────────────────────────

const EXPENSE_CATEGORY_KEYWORDS: Array<[string, string[]]> = [
  ['מזון',      ['סופר', 'מעדניה', 'מאפייה', 'קניות', 'שוק', 'פירות', 'ירקות', 'supermarket', 'grocery', 'food', 'makor', 'rami levy', 'רמי לוי', 'shufersal', 'שופרסל', 'victory', 'ויקטורי']],
  ['תחבורה',   ['דלק', 'תחנה', 'חניה', 'אוטובוס', 'רכבת', 'מונית', 'fuel', 'parking', 'taxi', 'uber', 'bolt', 'waze']],
  ['דיור',     ['שכר דירה', 'ועד בית', 'ארנונה', 'rent', 'arnona']],
  ['בילויים',  ['מסעדה', 'קפה', 'בר', 'קולנוע', 'הצגה', 'בידור', 'restaurant', 'cafe', 'coffee', 'cinema', 'bar', 'pizza', 'פיצה']],
  ['בריאות',   ['בית מרקחת', 'רופא', 'מרפאה', 'ביקור', 'pharmacy', 'doctor', 'medical', 'clalit', 'maccabi', 'מכבי', 'כללית']],
  ['מנויים',   ['netflix', 'spotify', 'youtube', 'disney', 'apple', 'נטפליקס', 'מנוי', 'subscription', 'hbo', 'amazon prime']],
  ['ביטוחים',  ['ביטוח', 'insurance', 'פניקס', 'הפניקס', 'הראל', 'מנורה', 'clal']],
  ['חשבונות',  ['חשמל', 'מים', 'גז', 'אינטרנט', 'טלפון', 'electricity', 'water', 'internet', 'phone', 'hot', 'partner', 'cellcom', 'bezeq', 'bezek', 'בזק', 'פרטנר', 'סלקום']],
];

const INCOME_CATEGORY_KEYWORDS: Array<[string, string[]]> = [
  ['משכורת',    ['משכורת', 'שכר', 'salary', 'wage', 'עובד', 'employer']],
  ['פרילנס',    ['פרילנס', 'עבודה עצמאית', 'invoice', 'freelance', 'חשבונית']],
  ['השקעות',   ['דיבידנד', 'ריבית', 'רווח', 'investment', 'dividend', 'interest', 'תיק']],
  ['שכר דירה', ['שכר דירה', 'rent income', 'rental', 'שוכר']],
];

function inferCategory(description: string, type: 'income' | 'expense'): string {
  const lower = description.toLowerCase();
  const banks = type === 'expense' ? EXPENSE_CATEGORY_KEYWORDS : INCOME_CATEGORY_KEYWORDS;
  for (const [category, keywords] of banks) {
    if (keywords.some((kw) => lower.includes(kw.toLowerCase()))) return category;
  }
  return '';
}

// ── Amount parsing ─────────────────────────────────────────────────────────────

function parseAmount(raw: string | number | null | undefined): number | null {
  if (raw === null || raw === undefined || raw === '') return null;
  if (typeof raw === 'number') return isNaN(raw) ? null : Math.abs(raw);
  // Handle Israeli format: 1,234.56 or 1234.56 or (1234) for negative
  let s = String(raw).trim().replace(/[₪\s]/g, '');
  // Parentheses = negative
  if (s.startsWith('(') && s.endsWith(')')) s = '-' + s.slice(1, -1);
  // Remove thousands separators (commas before digits)
  s = s.replace(/,(?=\d)/g, '');
  const n = parseFloat(s);
  return isNaN(n) ? null : Math.abs(n);
}

function rawToSigned(raw: string | number | null | undefined): number | null {
  if (raw === null || raw === undefined || raw === '') return null;
  if (typeof raw === 'number') return isNaN(raw) ? null : raw;
  let s = String(raw).trim().replace(/[₪\s]/g, '');
  if (s.startsWith('(') && s.endsWith(')')) s = '-' + s.slice(1, -1);
  s = s.replace(/,(?=\d)/g, '');
  const n = parseFloat(s);
  return isNaN(n) ? null : n;
}

// ── Date parsing ───────────────────────────────────────────────────────────────

function parseDate(raw: string | number | null | undefined): string {
  if (raw === null || raw === undefined || raw === '') return '';
  // Excel serial date number
  if (typeof raw === 'number') {
    const d = XLSX.SSF.parse_date_code(raw);
    if (d) {
      const mm = String(d.m).padStart(2, '0');
      const dd = String(d.d).padStart(2, '0');
      return `${d.y}-${mm}-${dd}`;
    }
    return '';
  }
  const s = String(raw).trim();
  // Already ISO
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  // DD/MM/YYYY or DD.MM.YYYY
  const dmyMatch = s.match(/^(\d{1,2})[./\-](\d{1,2})[./\-](\d{2,4})$/);
  if (dmyMatch) {
    const [, d, m, y] = dmyMatch;
    const year = y.length === 2 ? '20' + y : y;
    return `${year}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  // MM/DD/YYYY (US format — less common but possible)
  const mdyMatch = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (mdyMatch) {
    const [, m, d, y] = mdyMatch;
    // Heuristic: if m > 12 it's actually DD/MM/YYYY
    if (parseInt(m) > 12) return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  return '';
}

// ── Column detection ───────────────────────────────────────────────────────────

interface ColumnMap {
  date: number | null;
  description: number | null;
  amount: number | null;   // single signed column
  debit: number | null;    // expense
  credit: number | null;   // income
}

const DATE_PATTERNS = ['תאריך', 'date', 'Date', 'תאריך ביצוע', 'תאריך ערך', 'תאריך פעולה'];
const DESC_PATTERNS = ['תיאור', 'תיאור פעולה', 'תיאור העסקה', 'פירוט', 'description', 'Description', 'details', 'Details', 'פרטי עסקה', 'תנועה'];
const DEBIT_PATTERNS = ['חיוב', 'חובה', 'הוצאה', 'סכום חיוב', 'debit', 'Debit', 'charge', 'חיובים'];
const CREDIT_PATTERNS = ['זכות', 'הכנסה', 'סכום זכות', 'credit', 'Credit', 'הפקדה'];
const AMOUNT_PATTERNS = ['סכום', 'amount', 'Amount', 'סכום עסקה', 'total'];

function detectColumns(headers: (string | number | null | undefined)[]): ColumnMap {
  const cols: ColumnMap = { date: null, description: null, amount: null, debit: null, credit: null };
  headers.forEach((h, i) => {
    const s = String(h ?? '').trim();
    if (cols.date === null && DATE_PATTERNS.some((p) => s.includes(p) || p.includes(s))) cols.date = i;
    if (cols.description === null && DESC_PATTERNS.some((p) => s.includes(p) || p.includes(s))) cols.description = i;
    if (cols.debit === null && DEBIT_PATTERNS.some((p) => s.includes(p))) cols.debit = i;
    if (cols.credit === null && CREDIT_PATTERNS.some((p) => s.includes(p))) cols.credit = i;
    if (cols.amount === null && cols.debit === null && cols.credit === null && AMOUNT_PATTERNS.some((p) => s.toLowerCase() === p.toLowerCase())) cols.amount = i;
  });
  return cols;
}

// ── Row application ────────────────────────────────────────────────────────────

let _rowCounter = 0;

function applyMemory(
  rows: Omit<ParsedRow, 'confidence' | 'needsReview'>[],
  memory: DescMemory,
): ParsedRow[] {
  return rows.map((row) => {
    const classified = autoClassify(memory, row.description);
    if (classified) {
      const cat = classified.category || inferCategory(row.description, classified.type);
      return {
        ...row,
        type: classified.confidence === 'high' ? classified.type : row.type,
        category: classified.confidence === 'high' ? cat : (row.category || cat),
        confidence: classified.confidence,
        needsReview: classified.confidence !== 'high',
      };
    }
    // No memory — infer from keywords only
    const category = inferCategory(row.description, row.type);
    return { ...row, category, confidence: 'unknown' as const, needsReview: true };
  });
}

// ── Sheet → rows ───────────────────────────────────────────────────────────────

function sheetToRows(
  sheet: XLSX.WorkSheet,
  memory: DescMemory,
  isPdf = false,
): ParsedRow[] {
  const json = XLSX.utils.sheet_to_json<(string | number | null)[]>(sheet, {
    header: 1,
    defval: null,
    blankrows: false,
  });
  if (json.length < 2) return [];

  // Find the header row (first row that has 3+ non-empty string cells)
  let headerIdx = 0;
  for (let i = 0; i < Math.min(json.length, 8); i++) {
    const row = json[i];
    const nonEmpty = row.filter((c) => c !== null && c !== '').length;
    if (nonEmpty >= 3) { headerIdx = i; break; }
  }

  const headers = json[headerIdx];
  const cols = detectColumns(headers);

  const raw: Omit<ParsedRow, 'confidence' | 'needsReview'>[] = [];

  for (let i = headerIdx + 1; i < json.length; i++) {
    const row = json[i];
    if (!row || row.every((c) => c === null || c === '')) continue;

    const dateStr = cols.date !== null ? parseDate(row[cols.date]) : '';
    const description = String(row[cols.description ?? 0] ?? '').trim();
    if (!description) continue;

    let amount = 0;
    let type: 'income' | 'expense' = 'expense';

    if (cols.debit !== null || cols.credit !== null) {
      const debit = cols.debit !== null ? parseAmount(row[cols.debit]) : null;
      const credit = cols.credit !== null ? parseAmount(row[cols.credit]) : null;
      if ((debit ?? 0) > 0) { amount = debit!; type = 'expense'; }
      else if ((credit ?? 0) > 0) { amount = credit!; type = 'income'; }
      else continue;
    } else if (cols.amount !== null) {
      const signed = rawToSigned(row[cols.amount]);
      if (signed === null) continue;
      amount = Math.abs(signed);
      // Convention: positive in a bank statement is usually credit (income), negative = debit (expense)
      // But some exports use positive = expense. We default to: negative = income (deposit), positive = expense.
      // Most Israeli bank exports: positive debit = expense
      type = signed < 0 ? 'income' : 'expense';
    } else continue;

    if (amount <= 0) continue;

    raw.push({
      id: `import-${++_rowCounter}`,
      date: dateStr,
      description,
      amount,
      type,
      category: '',
      isPdfRow: isPdf,
    });
  }

  return applyMemory(raw, memory);
}

// ── PDF text extraction ────────────────────────────────────────────────────────

async function parsePdfRows(buffer: ArrayBuffer, memory: DescMemory): Promise<ParsedRow[]> {
  // Dynamic import to avoid SSR issues
  const pdfjsLib = await import('pdfjs-dist');
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.mjs',
    import.meta.url,
  ).href;

  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
  let fullText = '';
  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p);
    const content = await page.getTextContent();
    fullText += content.items.map((item) => ('str' in item ? item.str : '')).join(' ') + '\n';
  }

  // Attempt to extract rows by finding patterns: date + amount
  // Date pattern: DD/MM/YYYY or YYYY-MM-DD
  const datePattern = /\b(\d{1,2}[./]\d{1,2}[./]\d{2,4}|\d{4}-\d{2}-\d{2})\b/g;
  const amountPattern = /\b\d{1,6}(?:,\d{3})*(?:\.\d{1,2})?\b/g;

  const lines = fullText.split('\n').map((l) => l.trim()).filter(Boolean);
  const raw: Omit<ParsedRow, 'confidence' | 'needsReview'>[] = [];

  for (const line of lines) {
    const dates = line.match(datePattern);
    const amounts = line.match(amountPattern);
    if (!dates || !amounts) continue;

    const date = parseDate(dates[0]);
    // Use the last numeric value on the line as the amount (usually correct for bank rows)
    const amount = parseAmount(amounts[amounts.length - 1]);
    if (!amount || amount <= 0) continue;

    // Description = text between the date and the amount (rough heuristic)
    const desc = line.replace(datePattern, '').replace(amountPattern, '').replace(/\s+/g, ' ').trim();
    if (!desc) continue;

    raw.push({
      id: `import-${++_rowCounter}`,
      date,
      description: desc,
      amount,
      type: 'expense', // default — user must review PDF rows
      category: '',
      isPdfRow: true,
    });
  }

  return applyMemory(raw, memory).map((r) => ({
    ...r,
    needsReview: true, // always require review for PDF
    confidence: r.confidence === 'high' ? 'suggestion' : r.confidence, // downgrade high for PDF
  }));
}

// ── Public API ─────────────────────────────────────────────────────────────────

export async function parseFile(file: File, memory: DescMemory): Promise<ParsedRow[]> {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';

  if (ext === 'pdf') {
    const buffer = await file.arrayBuffer();
    return parsePdfRows(buffer, memory);
  }

  // xlsx or csv — both handled by SheetJS
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array', cellDates: false });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  return sheetToRows(sheet, memory);
}
