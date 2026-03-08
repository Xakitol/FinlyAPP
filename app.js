/**
 * MyMoneyApp - app.js
 * UTF-8  |  ניהול כלכלי משפחת טולדנו
 */

const STORAGE_KEY  = 'mymoneyapp_transactions';
const CATEGORY_KEY = 'mymoneyapp_categories';
const BUDGET_KEY   = 'mymoneyapp_budget';

const DEFAULT_CATEGORIES = [
  'משכורת', 'שכר דירה', 'מזון וקניות', 'חשבונות', 'בריאות',
  'בידור', 'תחבורה', 'חינוך', 'חיסכון', 'אחר',
];

// ── Encoding guard ────────────────────────────────────────────────────────
// Detects corrupted (non-Hebrew / garbled) strings saved from old bad encoding
function isValidHebrewString(str) {
  if (typeof str !== 'string' || str.trim() === '') return false;
  // A valid Hebrew string must contain at least one Hebrew letter (U+05D0–U+05EA)
  return /[\u05D0-\u05EA]/.test(str);
}

function sanitizeStoredData() {
  // 1. Reset categories if ANY entry is garbled
  const rawCats = localStorage.getItem(CATEGORY_KEY);
  if (rawCats) {
    try {
      const parsed = JSON.parse(rawCats);
      const hasGarbled = !Array.isArray(parsed) ||
        parsed.some(c => !isValidHebrewString(c));
      if (hasGarbled) {
        console.warn('[MyMoneyApp] Detected corrupted categories – resetting to defaults.');
        localStorage.removeItem(CATEGORY_KEY);
      }
    } catch {
      localStorage.removeItem(CATEGORY_KEY);
    }
  }

  // 2. Remove individual transactions whose name/category looks corrupted
  const rawTx = localStorage.getItem(STORAGE_KEY);
  if (rawTx) {
    try {
      const parsed = JSON.parse(rawTx);
      if (!Array.isArray(parsed)) {
        localStorage.removeItem(STORAGE_KEY);
        return;
      }
      // Keep transactions whose names are either valid Hebrew or plain ASCII
      const cleaned = parsed.filter(t =>
        typeof t.name === 'string' &&
        t.name.trim() !== '' &&
        !/[\u00C0-\u00FF\u0080-\u00BF]/.test(t.name) // strip Latin-1 supplement garbage
      );
      if (cleaned.length !== parsed.length) {
        console.warn(`[MyMoneyApp] Removed ${parsed.length - cleaned.length} corrupted transaction(s).`);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }
}

// Run cleanup BEFORE loading state
sanitizeStoredData();

// ── State ─────────────────────────────────────────────────────────────────
let transactions = loadFromStorage(STORAGE_KEY, []);
let categories   = loadFromStorage(CATEGORY_KEY, null);
if (!categories) {
  categories = [...DEFAULT_CATEGORIES];
  saveCategories();
}
let budget = loadFromStorage(BUDGET_KEY, 0);

// ── DOM ───────────────────────────────────────────────────────────────────
const form             = document.getElementById('transaction-form');
const nameInput        = document.getElementById('transaction-name');
const amountInput      = document.getElementById('transaction-amount');
const typeBtnExpense   = document.getElementById('type-btn-expense');
const typeBtnIncome    = document.getElementById('type-btn-income');
let currentType        = 'expense';
const categorySelect   = document.getElementById('transaction-category');
const addCategoryBtn   = document.getElementById('add-category-btn');
const tbody            = document.getElementById('transactions-body');
const emptyState       = document.getElementById('empty-state');
const clearAllBtn      = document.getElementById('clear-all-btn');
const totalIncomeEl    = document.getElementById('total-income');
const totalExpensesEl  = document.getElementById('total-expenses');
const balanceEl        = document.getElementById('balance');
const budgetInputEl    = document.getElementById('budget-input');
const budgetBarWrap    = document.getElementById('budget-bar-wrap');
const budgetFill       = document.getElementById('budget-fill');
const budgetSpentLabel = document.getElementById('budget-spent-label');
const budgetPctLabel   = document.getElementById('budget-pct-label');
const budgetStatusMsg  = document.getElementById('budget-status-msg');

// Modal
const modal            = document.getElementById('category-modal');
const modalClose       = document.getElementById('modal-close');
const newCategoryInput = document.getElementById('new-category-input');
const saveCategoryBtn  = document.getElementById('save-category-btn');
const categoryListEl   = document.getElementById('category-list');

// ── Toast ─────────────────────────────────────────────────────────────────
const toastEl = document.createElement('div');
toastEl.classList.add('toast');
document.body.appendChild(toastEl);
let toastTimer = null;

function showToast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2600);
}

// ── Storage ───────────────────────────────────────────────────────────────
function loadFromStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

function saveTransactions() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}

function saveCategories() {
  localStorage.setItem(CATEGORY_KEY, JSON.stringify(categories));
}

// ── Formatting ────────────────────────────────────────────────────────────
function formatCurrency(amount) {
  return '\u20AA' + Math.abs(amount).toLocaleString('he-IL', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('he-IL', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

// ── Categories ────────────────────────────────────────────────────────────
function renderCategorySelect() {
  const prev = categorySelect.value;
  categorySelect.innerHTML = categories
    .map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`)
    .join('');
  if (prev && categories.includes(prev)) categorySelect.value = prev;
}

function renderCategoryModal() {
  categoryListEl.innerHTML = categories.map((c, i) => {
    const isDefault = DEFAULT_CATEGORIES.includes(c);
    return `<li>
      <span>${escapeHtml(c)}</span>
      ${isDefault
        ? '<span class="cat-default-tag">ברירת מחדל</span>'
        : `<button class="btn-delete-cat" data-index="${i}" title="מחק">&#x2715;</button>`}
    </li>`;
  }).join('');
}

// Open / close modal
addCategoryBtn.addEventListener('click', () => {
  renderCategoryModal();
  modal.classList.add('open');
  newCategoryInput.focus();
});

modalClose.addEventListener('click', () => modal.classList.remove('open'));
modal.addEventListener('click', e => { if (e.target === modal) modal.classList.remove('open'); });

// ── Type Toggle ───────────────────────────────────────────────────
[typeBtnExpense, typeBtnIncome].forEach(btn => {
  btn.addEventListener('click', () => {
    currentType = btn.dataset.type;
    typeBtnExpense.classList.toggle('active', currentType === 'expense');
    typeBtnIncome.classList.toggle('active', currentType === 'income');
  });
});

// ── Budget Save ─────────────────────────────────────────────────
document.getElementById('save-budget-btn').addEventListener('click', () => {
  const val = parseFloat(budgetInputEl.value);
  if (!val || val <= 0) { showToast('⚠️ הזן יעד תקציב תקין.'); return; }
  budget = val;
  localStorage.setItem(BUDGET_KEY, JSON.stringify(budget));
  updateBudgetBar();
  showToast('✅ יעד התקציב נשמר!');
});

// ── Budget Bar ─────────────────────────────────────────────────
function updateBudgetBar() {
  if (!budget || budget <= 0) { budgetBarWrap.classList.remove('visible'); return; }
  const totalExp = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const pct      = Math.min((totalExp / budget) * 100, 100);
  budgetBarWrap.classList.add('visible');
  budgetFill.style.width = pct + '%';
  budgetSpentLabel.textContent = formatCurrency(totalExp) + ' הוצאו';
  budgetPctLabel.textContent   = Math.round(pct) + '%';
  const isWarn = pct >= 80;
  budgetFill.classList.toggle('warn', isWarn);
  document.body.classList.toggle('budget-warn', isWarn);
  if (pct >= 100)       budgetStatusMsg.textContent = '⚠️ חרגת מהתקציב!';
  else if (isWarn)      budgetStatusMsg.textContent = '⚠️ קרוב לגבול';
  else                  budgetStatusMsg.textContent = '✓ בתוך התקציב';
}

// ── Pie Chart ──────────────────────────────────────────────────
let pieChart = null;
const PASTEL_COLORS = [
  'rgba(255,179,186,0.88)', 'rgba(255,223,186,0.88)', 'rgba(178,236,200,0.88)',
  'rgba(186,225,255,0.88)', 'rgba(220,190,255,0.88)', 'rgba(255,243,176,0.88)',
  'rgba(200,240,220,0.88)', 'rgba(255,210,190,0.88)', 'rgba(190,220,255,0.88)',
  'rgba(240,200,230,0.88)',
];
const PASTEL_BORDERS = PASTEL_COLORS.map(c => c.replace('0.88', '1').replace('rgba','rgba').replace(/,\d+\)$/,',1)'));

function updatePieChart() {
  const byCategory = {};
  transactions.filter(t => t.type === 'expense').forEach(t => {
    const cat = t.category || 'אחר';
    byCategory[cat] = (byCategory[cat] || 0) + t.amount;
  });
  const labels = Object.keys(byCategory);
  const data   = Object.values(byCategory);
  const canvas = document.getElementById('pie-chart');
  const emptyMsg = document.getElementById('chart-empty-msg');
  if (!labels.length) {
    canvas.style.display = 'none';
    emptyMsg.style.display = 'block';
    if (pieChart) { pieChart.destroy(); pieChart = null; }
    return;
  }
  canvas.style.display = 'block';
  emptyMsg.style.display = 'none';
  const colors  = labels.map((_, i) => PASTEL_COLORS[i % PASTEL_COLORS.length]);
  const borders = labels.map((_, i) => PASTEL_BORDERS[i % PASTEL_BORDERS.length]);
  if (pieChart) {
    pieChart.data.labels = labels;
    pieChart.data.datasets[0].data = data;
    pieChart.data.datasets[0].backgroundColor = colors;
    pieChart.data.datasets[0].borderColor = borders;
    pieChart.update();
  } else {
    pieChart = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{ data, backgroundColor: colors, borderColor: borders,
          borderWidth: 2.5, hoverOffset: 10 }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              font: { family: "'Segoe UI', Tahoma, Arial, sans-serif", size: 12 },
              color: document.body.classList.contains('dark-mode') ? '#c0a880' : '#4a3825',
              padding: 14, boxWidth: 14, borderRadius: 4,
            }
          },
          tooltip: {
            callbacks: {
              label: ctx => {
                const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                const pct   = ((ctx.parsed / total) * 100).toFixed(1);
                return ` ${ctx.label}: ${formatCurrency(ctx.parsed)} (${pct}%)`;
              }
            }
          }
        }
      }
    });
  }
}

// Save new category
saveCategoryBtn.addEventListener('click', addNewCategory);
newCategoryInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') { e.preventDefault(); addNewCategory(); }
});

function addNewCategory() {
  const name = newCategoryInput.value.trim();
  if (!name) { showToast('\u26A0\uFE0F נא להזין שם קטגוריה.'); return; }
  if (categories.some(c => c.toLowerCase() === name.toLowerCase())) {
    showToast('\u26A0\uFE0F קטגוריה זו כבר קיימת.'); return;
  }
  categories.push(name);
  saveCategories();
  renderCategorySelect();
  renderCategoryModal();
  newCategoryInput.value = '';
  newCategoryInput.focus();
  showToast('\u2705 קטגוריה "' + name + '" נוספה!');
}

// Reset to defaults
document.getElementById('reset-categories-btn').addEventListener('click', () => {
  if (confirm('לאפס את רשימת הקטגוריות לברירת המחדל? קטגוריות מותאמות אישית יימחקו.')) {
    categories = [...DEFAULT_CATEGORIES];
    saveCategories();
    renderCategorySelect();
    renderCategoryModal();
    showToast('\u2705 הקטגוריות אופסו לברירת מחדל.');
  }
});

// Delete custom category
categoryListEl.addEventListener('click', e => {
  const btn = e.target.closest('.btn-delete-cat');
  if (!btn) return;
  const idx  = Number(btn.dataset.index);
  const name = categories[idx];
  categories.splice(idx, 1);
  saveCategories();
  renderCategorySelect();
  renderCategoryModal();
  showToast('\uD83D\uDDD1\uFE0F קטגוריה "' + name + '" נמחקה.');
});

// ── Summary ───────────────────────────────────────────────────────────────
function updateSummary() {
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((s, t) => s + t.amount, 0);
  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((s, t) => s + t.amount, 0);
  const balance = totalIncome - totalExpenses;

  totalIncomeEl.textContent   = formatCurrency(totalIncome);
  totalExpensesEl.textContent = formatCurrency(totalExpenses);
  balanceEl.textContent       = formatCurrency(balance);
  balanceEl.style.color = balance >= 0 ? 'var(--income-color)' : 'var(--expense-color)';
  updatePieChart();
  updateBudgetBar();
}

// ── Table ─────────────────────────────────────────────────────────────────
function renderTable(animateFirst = false) {
  tbody.innerHTML = '';

  if (transactions.length === 0) {
    emptyState.classList.add('visible');
    updateSummary();
    return;
  }
  emptyState.classList.remove('visible');

  [...transactions].reverse().forEach((t, idx) => {
    const tr = document.createElement('tr');
    if (animateFirst && idx === 0) tr.classList.add('row-enter');
    const isIncome = t.type === 'income';
    tr.innerHTML = `
      <td class="row-num">${transactions.length - idx}</td>
      <td>${escapeHtml(t.name)}</td>
      <td class="cat-cell">${escapeHtml(t.category || '\u2014')}</td>
      <td><span class="badge ${isIncome ? 'badge-income' : 'badge-expense'}">
        ${isIncome ? '\u2B06\uFE0F הכנסה' : '\u2B07\uFE0F הוצאה'}
      </span></td>
      <td class="${isIncome ? 'amount-income' : 'amount-expense'}">
        ${isIncome ? '+' : '-'}${formatCurrency(t.amount)}
      </td>
      <td class="date-cell">${formatDate(t.date)}</td>
      <td><button class="btn-delete" data-id="${t.id}" title="מחק">\uD83D\uDDD1\uFE0F</button></td>
    `;
    tbody.appendChild(tr);
  });
  updateSummary();
}

// ── Add ───────────────────────────────────────────────────────────────────
form.addEventListener('submit', e => {
  e.preventDefault();
  const name     = nameInput.value.trim();
  const amount   = parseFloat(amountInput.value);
  const type     = currentType;
  const category = categorySelect.value;

  if (!name || isNaN(amount) || amount <= 0) {
    showToast('\u26A0\uFE0F אנא מלא את כל השדות כראוי.');
    return;
  }
  transactions.push({ id: Date.now(), name, amount, type, category, date: new Date().toISOString() });
  saveTransactions();
  renderTable(true);
  nameInput.value = ''; amountInput.value = '';
  nameInput.focus();
  showToast(type === 'income' ? '\u2705 הכנסה נוספה בהצלחה!' : '\u2705 הוצאה נוספה בהצלחה!');
});

// ── Delete ────────────────────────────────────────────────────────────────
tbody.addEventListener('click', e => {
  const btn = e.target.closest('.btn-delete');
  if (!btn) return;
  const row = btn.closest('tr');
  const doDelete = () => {
    transactions = transactions.filter(t => t.id !== Number(btn.dataset.id));
    saveTransactions();
    renderTable();
    showToast('\uD83D\uDDD1\uFE0F התנועה נמחקה.');
  };
  if (row) {
    row.classList.add('row-exit');
    row.addEventListener('animationend', doDelete, { once: true });
  } else {
    doDelete();
  }
});

// ── Clear All ─────────────────────────────────────────────────────────────
clearAllBtn.addEventListener('click', () => {
  if (!transactions.length) { showToast('אין תנועות למחיקה.'); return; }
  if (confirm('האם אתה בטוח שברצונך למחוק את כל התנועות?')) {
    transactions = [];
    saveTransactions();
    renderTable();
    showToast('\uD83D\uDDD1\uFE0F כל התנועות נמחקו.');
  }
});

// ── Download Helper ──────────────────────────────────────────────────────
function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url  = URL.createObjectURL(blob);
  const a    = Object.assign(document.createElement('a'), { href: url, download: filename });
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ── Export CSV ────────────────────────────────────────────────────────────
document.getElementById('export-csv-btn').addEventListener('click', () => {
  if (!transactions.length) { showToast('\u26A0\uFE0F אין תנועות לייצוא.'); return; }
  const headers = ['#', '\u05EA\u05D9\u05D0\u05D5\u05E8', '\u05E7\u05D8\u05D2\u05D5\u05E8\u05D9\u05D4', '\u05E1\u05D5\u05D2', '\u05E1\u05DB\u05D5\u05DD', '\u05EA\u05D0\u05E8\u05D9\u05DA'];
  const rows = [...transactions].reverse().map((t, i) => [
    i + 1,
    `"${t.name.replace(/"/g, '""')}"`,
    `"${(t.category || '').replace(/"/g, '""')}"`,
    t.type === 'income' ? '\u05D4\u05DB\u05E0\u05E1\u05D4' : '\u05D4\u05D5\u05E6\u05D0\u05D4',
    t.amount.toFixed(2),
    new Date(t.date).toLocaleDateString('he-IL'),
  ]);
  const BOM = '\uFEFF'; // UTF-8 BOM so Excel reads Hebrew correctly
  const csv = BOM + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  downloadFile(csv, '\u05D3\u05D5\u05D7_\u05DE\u05E9\u05E4\u05D7\u05EA_\u05D8\u05D5\u05DC\u05D3\u05E0\u05D5.csv', 'text/csv;charset=utf-8;');
  showToast('\u2705 \u05E7\u05D5\u05D1\u05E5 CSV \u05D4\u05D5\u05E8\u05D3 \u05D1\u05D4\u05E6\u05DC\u05D7\u05D4!');
});

// ── Export PDF (print window) ─────────────────────────────────────────────
document.getElementById('export-pdf-btn').addEventListener('click', () => {
  if (!transactions.length) { showToast('\u26A0\uFE0F אין תנועות לייצוא.'); return; }
  const totalIncome   = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const balance       = totalIncome - totalExpenses;
  const rows = [...transactions].reverse().map((t, i) => {
    const isIncome = t.type === 'income';
    return `<tr>
      <td>${i + 1}</td>
      <td>${escapeHtml(t.name)}</td>
      <td>${escapeHtml(t.category || '\u2014')}</td>
      <td>${isIncome ? '\u05D4\u05DB\u05E0\u05E1\u05D4' : '\u05D4\u05D5\u05E6\u05D0\u05D4'}</td>
      <td style="color:${isIncome ? '#2E7D32' : '#c61e1e'};font-weight:700">${isIncome ? '+' : '-'}${formatCurrency(t.amount)}</td>
      <td>${new Date(t.date).toLocaleDateString('he-IL')}</td>
    </tr>`;
  }).join('');
  // Build a self-contained report in a hidden off-screen div for jsPDF
  const wrap = document.createElement('div');
  wrap.style.cssText = [
    'position:absolute', 'top:-9999px', 'left:0',
    'width:794px', 'background:#FDF6EC',
    'font-family:Arial,sans-serif', 'direction:rtl',
    'padding:36px 40px', 'color:#50433b', 'font-size:13px',
  ].join(';');
  wrap.innerHTML = `
    <div style="text-align:center;margin-bottom:22px">
      <div style="font-size:2.4rem">&#x1F468;&#x200D;&#x1F469;&#x200D;&#x1F467;&#x200D;&#x1F466;</div>
      <h1 style="font-size:1.45rem;color:#5D3317;margin-top:6px">\u05E0\u05D9\u05D4\u05D5\u05DC \u05DB\u05DC\u05DB\u05DC\u05D9 \u05DE\u05E9\u05E4\u05D7\u05EA \u05D8\u05D5\u05DC\u05D3\u05E0\u05D5</h1>
      <p style="font-size:.8rem;color:#7A5C3E;margin-top:4px">\u05D3\u05D5\u05D7 \u05DE\u05D9\u05D5\u05DD ${new Date().toLocaleDateString('he-IL')}</p>
    </div>
    <div style="display:flex;gap:12px;justify-content:center;margin-bottom:22px;flex-wrap:wrap">
      <div style="text-align:center;padding:10px 18px;border-radius:8px;border:2px solid #a68f76;background:#F5E8CC">
        <div style="font-size:.66rem;color:#7A5C3E;text-transform:uppercase;margin-bottom:3px">\u05E1\u05DA \u05D4\u05DB\u05E0\u05E1\u05D5\u05EA</div>
        <div style="font-size:1.15rem;font-weight:800;color:#2E7D32">${formatCurrency(totalIncome)}</div>
      </div>
      <div style="text-align:center;padding:10px 18px;border-radius:8px;border:2px solid #a68f76;background:#F5E8CC">
        <div style="font-size:.66rem;color:#7A5C3E;text-transform:uppercase;margin-bottom:3px">\u05E1\u05DA \u05D4\u05D5\u05E6\u05D0\u05D5\u05EA</div>
        <div style="font-size:1.15rem;font-weight:800;color:#c61e1e">${formatCurrency(totalExpenses)}</div>
      </div>
      <div style="text-align:center;padding:10px 18px;border-radius:8px;border:2px solid #a68f76;background:#F5E8CC">
        <div style="font-size:.66rem;color:#7A5C3E;text-transform:uppercase;margin-bottom:3px">\u05D9\u05EA\u05E8\u05D4</div>
        <div style="font-size:1.15rem;font-weight:800;color:${balance >= 0 ? '#2E7D32' : '#c61e1e'}">${formatCurrency(balance)}</div>
      </div>
    </div>
    <table style="width:100%;border-collapse:collapse;font-size:.82rem">
      <thead>
        <tr>
          <th style="background:#5D3317;color:#FDF6EC;padding:.5rem;text-align:right">#</th>
          <th style="background:#5D3317;color:#FDF6EC;padding:.5rem;text-align:right">\u05EA\u05D9\u05D0\u05D5\u05E8</th>
          <th style="background:#5D3317;color:#FDF6EC;padding:.5rem;text-align:right">\u05E7\u05D8\u05D2\u05D5\u05E8\u05D9\u05D4</th>
          <th style="background:#5D3317;color:#FDF6EC;padding:.5rem;text-align:right">\u05E1\u05D5\u05D2</th>
          <th style="background:#5D3317;color:#FDF6EC;padding:.5rem;text-align:right">\u05E1\u05DB\u05D5\u05DD</th>
          <th style="background:#5D3317;color:#FDF6EC;padding:.5rem;text-align:right">\u05EA\u05D0\u05E8\u05D9\u05DA</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    <div style="text-align:center;margin-top:22px;font-size:.7rem;color:#7A5C3E;border-top:1px solid #EDD9A3;padding-top:10px">
      \u05E0\u05D9\u05D4\u05D5\u05DC \u05DB\u05DC\u05DB\u05DC\u05D9 \u05DE\u05E9\u05E4\u05D7\u05EA \u05D8\u05D5\u05DC\u05D3\u05E0\u05D5 &copy; ${new Date().getFullYear()} &nbsp;|&nbsp; &#x1F48E; \u05DB\u05DC \u05D4\u05D6\u05DB\u05D5\u05D9\u05D5\u05EA \u05E9\u05DE\u05D5\u05E8\u05D5\u05EA
    </div>`;

  document.body.appendChild(wrap);
  showToast('\u23F3 \u05D9\u05D5\u05E6\u05E8 \u05E7\u05D5\u05D1\u05E5 PDF...');

  html2canvas(wrap, { scale: 2, useCORS: true, backgroundColor: '#FDF6EC', logging: false }).then(canvas => {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const imgData = canvas.toDataURL('image/png');
    const imgH = (canvas.height * pageW) / canvas.width;
    let remaining = imgH;
    let pos = 0;
    pdf.addImage(imgData, 'PNG', 0, pos, pageW, imgH);
    remaining -= pageH;
    while (remaining > 0) {
      pos = remaining - imgH;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, pos, pageW, imgH);
      remaining -= pageH;
    }
    pdf.save('\u05D3\u05D5\u05D7_\u05DE\u05E9\u05E4\u05D7\u05EA_\u05D8\u05D5\u05DC\u05D3\u05E0\u05D5.pdf');
    document.body.removeChild(wrap);
    showToast('\u2705 \u05E7\u05D5\u05D1\u05E5 PDF \u05D4\u05D5\u05E8\u05D3 \u05D1\u05D4\u05E6\u05DC\u05D7\u05D4!');
  }).catch(() => {
    document.body.removeChild(wrap);
    showToast('\u26A0\uFE0F \u05E9\u05D2\u05D9\u05D0\u05D4 \u05D1\u05D9\u05E6\u05D9\u05E8\u05EA \u05D4-PDF.');
  });
});

// ── Import Data ───────────────────────────────────────────────────────────
document.getElementById('import-file').addEventListener('change', function (e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (ev) {
    try {
      const data = JSON.parse(ev.target.result);
      let imported;
      if (Array.isArray(data)) {
        imported = data;
      } else if (data.transactions && Array.isArray(data.transactions)) {
        imported = data.transactions;
        if (data.categories && Array.isArray(data.categories)) {
          const newCats = data.categories.filter(isValidHebrewString);
          if (newCats.length) {
            categories = [...new Set([...categories, ...newCats])];
            saveCategories();
            renderCategorySelect();
          }
        }
      } else {
        showToast('\u26A0\uFE0F \u05E4\u05D5\u05E8\u05DE\u05D8 \u05D4\u05E7\u05D5\u05D1\u05E5 \u05D0\u05D9\u05E0\u05D5 \u05E0\u05EA\u05DE\u05DA.');
        return;
      }
      const valid = imported.filter(t =>
        t && typeof t.name === 'string' && t.name.trim() &&
        typeof t.amount === 'number' && t.amount > 0 &&
        ['income', 'expense'].includes(t.type)
      );
      if (!valid.length) { showToast('\u26A0\uFE0F \u05DC\u05D0 \u05E0\u05DE\u05E6\u05D0\u05D5 \u05EA\u05E0\u05D5\u05E2\u05D5\u05EA \u05EA\u05E7\u05D9\u05E0\u05D5\u05EA.'); return; }
      const maxId = transactions.reduce((m, t) => Math.max(m, t.id || 0), 0);
      valid.forEach((t, i) => { t.id = maxId + i + 1; if (!t.date) t.date = new Date().toISOString(); });
      transactions = [...transactions, ...valid];
      saveTransactions();
      renderTable(true);
      showToast('\u2705 \u05D9\u05D5\u05D1\u05D0\u05D5 ' + valid.length + ' \u05EA\u05E0\u05D5\u05E2\u05D5\u05EA \u05D1\u05D4\u05E6\u05DC\u05D7\u05D4!');
    } catch {
      showToast('\u26A0\uFE0F \u05E9\u05D2\u05D9\u05D0\u05D4 \u05D1\u05E7\u05E8\u05D9\u05D0\u05EA \u05D4\u05E7\u05D5\u05D1\u05E5. \u05D5\u05D3\u05D0 \u05E9\u05DE\u05D3\u05D5\u05D1\u05E8 \u05D1\u05E7\u05D5\u05D1\u05E5 JSON \u05EA\u05E7\u05D9\u05DF.');
    }
    e.target.value = '';
  };
  reader.readAsText(file, 'UTF-8');
});

// ── Floating Currency Shapes ──────────────────────────────────────────────
(function initFloaters() {
  const canvas = document.getElementById('balloon-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
  resize();
  window.addEventListener('resize', () => {
    resize();
    floaters.forEach(f => {
      f.x = Math.random() * canvas.width;
      f.y = Math.random() * canvas.height;
    });
  });

  function randomBetween(a, b) { return a + Math.random() * (b - a); }
  function lerpColor(c1, c2, t) { return c1.map((v,i) => Math.round(v + (c2[i]-v)*t)); }

  // Warm beige / cream / brown palettes per symbol
  const COLOR_MAP = {
    shekel:  { light: [[245,225,195],[235,210,175],[250,235,210]], dark: [[180,140,80],[160,120,60],[190,155,90]]  },
    dollar:  { light: [[220,205,180],[235,220,195],[240,228,208]], dark: [[140,110,60],[120,95,45],[155,125,70]]   },
    bitcoin: { light: [[255,230,175],[248,215,155],[255,238,192]], dark: [[200,155,50],[180,135,30],[210,165,65]]  },
    chart:   { light: [[210,195,170],[225,210,185],[238,222,200]], dark: [[130,105,70],[110,88,55],[145,118,82]]   },
  };

  // 22 floaters: ₪×6  $×6  ₿×5  chart×5
  const POOL = [
    ...Array(6).fill('shekel'),
    ...Array(6).fill('dollar'),
    ...Array(5).fill('bitcoin'),
    ...Array(5).fill('chart'),
  ];

  const LABEL = { shekel:'\u20AA', dollar:'$', bitcoin:'\u20BF', chart:null };

  const floaters = POOL.map(type => {
    const palette = COLOR_MAP[type].light;
    return {
      type,
      x:         randomBetween(80, Math.max(200, canvas.width  - 80)),
      y:         randomBetween(80, Math.max(200, canvas.height - 80)),
      sz:        randomBetween(36, 62),               // font / shape size
      hoverAmpY: randomBetween(16, 34),
      hoverAmpX: randomBetween(8,  22),
      hoverSpY:  randomBetween(0.010, 0.022),
      hoverSpX:  randomBetween(0.006, 0.015),
      phaseY:    Math.random() * Math.PI * 2,
      phaseX:    Math.random() * Math.PI * 2,
      rot:       randomBetween(-0.18, 0.18),          // very slight tilt
      colorIdx:  Math.floor(Math.random() * palette.length),
      colorT:    Math.random(),
      colorSp:   randomBetween(0.003, 0.008),
      alpha:     randomBetween(0.58, 0.80),
      // mini chart bars (only used when type==='chart')
      bars:      Array.from({length:5}, () => randomBetween(0.30, 1.0)),
    };
  });

  let t = 0;

  /* ── draw the ₪ / $ / ₿ symbol as a puffy 3D shape ── */
  function drawCurrencySymbol(cx, cy, f, r, g, b) {
    const isDark = document.body.classList.contains('dark-mode');
    const label  = LABEL[f.type];
    const fSize  = f.sz;

    ctx.save();
    ctx.font = `900 ${fSize}px "Segoe UI Emoji", "Segoe UI", Arial, sans-serif`;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';

    // Layer 1 – dark drop shadow for depth
    const depth = Math.round(fSize * 0.09);
    ctx.fillStyle = `rgba(${Math.max(0,r-90)},${Math.max(0,g-90)},${Math.max(0,b-90)},0.45)`;
    ctx.fillText(label, cx + depth, cy + depth);

    // Layer 2 – slightly lighter mid shadow
    ctx.fillStyle = `rgba(${Math.max(0,r-50)},${Math.max(0,g-50)},${Math.max(0,b-50)},0.55)`;
    ctx.fillText(label, cx + Math.round(depth*0.5), cy + Math.round(depth*0.5));

    // Layer 3 – outer glow
    ctx.shadowColor  = isDark
      ? `rgba(${r},${g},${b},0.55)`
      : `rgba(${r},${g},${b},0.45)`;
    ctx.shadowBlur   = fSize * 0.45;
    ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0;
    ctx.fillStyle = `rgba(${r},${g},${b},${f.alpha})`;
    ctx.fillText(label, cx, cy);
    ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0;

    // Layer 4 – main color fill
    ctx.fillStyle = `rgba(${r},${g},${b},${f.alpha})`;
    ctx.fillText(label, cx, cy);

    // Layer 5 – top-left white shine for puffy feel
    const hl = Math.round(depth * 0.55);
    ctx.fillStyle = isDark
      ? `rgba(255,255,255,0.18)`
      : `rgba(255,255,255,0.55)`;
    ctx.fillText(label, cx - hl, cy - hl);

    ctx.restore();
  }

  /* ── draw a tiny 3D puffy stock chart ── */
  function drawChart(cx, cy, f, r, g, b) {
    const isDark = document.body.classList.contains('dark-mode');
    const w  = f.sz * 1.6;
    const h  = f.sz * 1.0;
    const bw = w / (f.bars.length * 1.5);   // bar width
    const gap = (w - bw * f.bars.length) / (f.bars.length + 1);

    ctx.save();

    // Outer glow
    ctx.shadowColor  = isDark ? `rgba(${r},${g},${b},0.50)` : `rgba(${r},${g},${b},0.35)`;
    ctx.shadowBlur   = f.sz * 0.40;
    ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0;

    // Draw bars
    f.bars.forEach((val, i) => {
      const bh = h * val;
      const bx = cx - w/2 + gap + i * (bw + gap);
      const by = cy + h/2 - bh;

      // Shadow bar (depth)
      const depth = Math.round(f.sz * 0.07);
      ctx.fillStyle = `rgba(${Math.max(0,r-80)},${Math.max(0,g-80)},${Math.max(0,b-80)},0.40)`;
      ctx.beginPath();
      ctx.roundRect(bx + depth, by + depth, bw, bh, 3);
      ctx.fill();

      // Main bar
      const barGrad = ctx.createLinearGradient(bx, by, bx, by + bh);
      barGrad.addColorStop(0,   `rgba(255,255,255,${isDark?0.25:0.60})`);
      barGrad.addColorStop(0.4, `rgba(${r},${g},${b},${f.alpha})`);
      barGrad.addColorStop(1,   `rgba(${Math.max(0,r-50)},${Math.max(0,g-50)},${Math.max(0,b-50)},${f.alpha})`);
      ctx.shadowColor = 'transparent';
      ctx.fillStyle = barGrad;
      ctx.beginPath();
      ctx.roundRect(bx, by, bw, bh, 3);
      ctx.fill();

      // Shine stripe
      ctx.fillStyle = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.45)';
      ctx.beginPath();
      ctx.roundRect(bx + 1, by + 1, bw * 0.38, bh * 0.55, 2);
      ctx.fill();
    });

    // Trend line over bars
    ctx.shadowColor  = isDark ? `rgba(${r},${g},${b},0.70)` : `rgba(${r},${g},${b},0.55)`;
    ctx.shadowBlur   = 8;
    ctx.strokeStyle = isDark
      ? `rgba(255,255,255,0.75)`
      : `rgba(${Math.max(0,r-60)},${Math.max(0,g-60)},${Math.max(0,b-60)},0.90)`;
    ctx.lineWidth   = 2.2;
    ctx.lineJoin    = 'round';
    ctx.beginPath();
    f.bars.forEach((val, i) => {
      const bw2 = w / (f.bars.length * 1.5);
      const gap2 = (w - bw2 * f.bars.length) / (f.bars.length + 1);
      const px = cx - w/2 + gap2 + i * (bw2 + gap2) + bw2/2;
      const py = cy + h/2 - h * val;
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    });
    ctx.stroke();

    ctx.restore();
  }

  function drawFloater(f) {
    const isDark = document.body.classList.contains('dark-mode');
    const palette = isDark ? COLOR_MAP[f.type].dark : COLOR_MAP[f.type].light;

    f.colorT += f.colorSp;
    if (f.colorT >= 1) { f.colorT -= 1; f.colorIdx = (f.colorIdx + 1) % palette.length; }
    const [r, g, b] = lerpColor(palette[f.colorIdx], palette[(f.colorIdx+1) % palette.length], f.colorT);

    const cx = f.x + Math.sin(t * f.hoverSpX + f.phaseX) * f.hoverAmpX;
    const cy = f.y + Math.sin(t * f.hoverSpY + f.phaseY) * f.hoverAmpY;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(f.rot);
    ctx.globalAlpha = f.alpha;

    if (f.type === 'chart') {
      drawChart(0, 0, f, r, g, b);
    } else {
      drawCurrencySymbol(0, 0, f, r, g, b);
    }

    ctx.restore();
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    t++;
    for (const f of floaters) drawFloater(f);
    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);
})();

// ── Helpers ───────────────────────────────────────────────────────────────
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ── Dark Mode ─────────────────────────────────────────────────────────────
const DARK_MODE_KEY = 'mymoneyapp_darkmode';
const darkModeBtn   = document.getElementById('dark-mode-btn');

function applyDarkMode(enabled) {
  document.body.classList.toggle('dark-mode', enabled);
  darkModeBtn.textContent = enabled ? '☀️' : '🌙';
  darkModeBtn.title       = enabled ? 'מצב יום' : 'מצב לילה';
  // Refresh chart legend color
  if (pieChart) { pieChart.destroy(); pieChart = null; updatePieChart(); }
}

darkModeBtn.addEventListener('click', () => {
  const isNowDark = !document.body.classList.contains('dark-mode');
  applyDarkMode(isNowDark);
  localStorage.setItem(DARK_MODE_KEY, isNowDark ? '1' : '0');
});

// Restore preference on load
applyDarkMode(localStorage.getItem(DARK_MODE_KEY) === '1');

// ── Init ──────────────────────────────────────────────────────────────────
renderCategorySelect();
renderTable();
if (budget > 0) budgetInputEl.value = budget;