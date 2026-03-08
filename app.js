/**
 * MyMoneyApp - app.js
 * Firebase Firestore real-time backend
 */

// Firebase Init
const firebaseConfig = {
  apiKey:            'AIzaSyDK3oq5I-MHnjYGXkRBfUeYs3vw7zwB0gE',
  authDomain:        'mymoneyapp-abb12.firebaseapp.com',
  projectId:         'mymoneyapp-abb12',
  storageBucket:     'mymoneyapp-abb12.firebasestorage.app',
  messagingSenderId: '728703755358',
  appId:             '1:728703755358:web:e10f94bfc61ec631dcc0cf',
  measurementId:     'G-2D4YL4DWQT',
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Constants
const BUDGET_KEY   = 'mymoneyapp_budget';
const DARK_MODE_KEY= 'mymoneyapp_darkmode';
const DEFAULT_CATEGORIES = [
  '\u05de\u05e9\u05db\u05d5\u05e8\u05ea','\u05e9\u05db\u05e8 \u05d3\u05d9\u05e8\u05d4','\u05de\u05d6\u05d5\u05df \u05d5\u05e7\u05e0\u05d9\u05d5\u05ea','\u05d7\u05e9\u05d1\u05d5\u05e0\u05d5\u05ea','\u05d1\u05e8\u05d9\u05d0\u05d5\u05ea',
  '\u05d1\u05d9\u05d3\u05d5\u05e8','\u05ea\u05d7\u05d1\u05d5\u05e8\u05d4','\u05d7\u05d9\u05e0\u05d5\u05da','\u05d7\u05d9\u05e1\u05db\u05d5\u05df','\u05d0\u05d7\u05e8',
];

// State
let transactions = [];
let categories   = [...DEFAULT_CATEGORIES];
let budget       = 0;
let currentType  = 'expense';
try { budget = JSON.parse(localStorage.getItem(BUDGET_KEY)) || 0; } catch {}

// DOM refs
const form             = document.getElementById('transaction-form');
const nameInput        = document.getElementById('transaction-name');
const amountInput      = document.getElementById('transaction-amount');
const typeBtnExpense   = document.getElementById('type-btn-expense');
const typeBtnIncome    = document.getElementById('type-btn-income');
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
const modal            = document.getElementById('category-modal');
const modalClose       = document.getElementById('modal-close');
const newCategoryInput = document.getElementById('new-category-input');
const saveCategoryBtn  = document.getElementById('save-category-btn');
const categoryListEl   = document.getElementById('category-list');

// Toast
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

// Loader
function hideLoader() {
  const el = document.getElementById('app-loader');
  if (el) el.classList.add('hidden');
}

// Helpers
function escapeHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
}
function isValidHebrewString(str) {
  return typeof str === 'string' && str.trim() !== '' && /[\u05D0-\u05EA]/.test(str);
}
function formatCurrency(amount) {
  return '\u20AA' + Math.abs(amount).toLocaleString('he-IL',{minimumFractionDigits:2,maximumFractionDigits:2});
}
function formatDate(iso) {
  return new Date(iso).toLocaleDateString('he-IL',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'});
}

// Firestore: Categories
async function saveCategories() {
  try {
    await db.collection('settings').doc('categories').set({ list: categories });
    localStorage.setItem('mymoneyapp_categories', JSON.stringify(categories));
  } catch(e) { console.warn('[MyMoneyApp] saveCategories error:', e); }
}
async function loadCategoriesFromFirestore() {
  try {
    const snap = await db.collection('settings').doc('categories').get();
    if (snap.exists) {
      const list = snap.data().list;
      if (Array.isArray(list) && list.length > 0) return list;
    }
  } catch {}
  return null;
}

// Category Select
function renderCategorySelect() {
  const prev = categorySelect.value;
  categorySelect.innerHTML = categories.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');
  if (prev && categories.includes(prev)) categorySelect.value = prev;
}

// Category Modal
function renderCategoryModal() {
  categoryListEl.innerHTML = categories.map((c,i) => {
    const isDef = DEFAULT_CATEGORIES.includes(c);
    return `<li><span>${escapeHtml(c)}</span>${isDef
      ? '<span class="cat-default-tag">\u05d1\u05e8\u05d9\u05e8\u05ea \u05de\u05d7\u05d3\u05dc</span>'
      : `<button class="btn-delete-cat" data-index="${i}" title="\u05de\u05d7\u05e7">&#x2715;</button>`}</li>`;
  }).join('');
}

addCategoryBtn.addEventListener('click', () => { renderCategoryModal(); modal.classList.add('open'); newCategoryInput.focus(); });
modalClose.addEventListener('click', () => modal.classList.remove('open'));
modal.addEventListener('click', e => { if (e.target === modal) modal.classList.remove('open'); });

// Type Toggle
[typeBtnExpense, typeBtnIncome].forEach(btn => {
  btn.addEventListener('click', () => {
    currentType = btn.dataset.type;
    typeBtnExpense.classList.toggle('active', currentType === 'expense');
    typeBtnIncome.classList.toggle('active',  currentType === 'income');
  });
});

// Budget
document.getElementById('save-budget-btn').addEventListener('click', () => {
  const val = parseFloat(budgetInputEl.value);
  if (!val || val <= 0) { showToast('\u26a0\ufe0f \u05d4\u05d6\u05df \u05d9\u05e2\u05d3 \u05ea\u05e7\u05e6\u05d9\u05d1 \u05ea\u05e7\u05d9\u05df.'); return; }
  budget = val;
  localStorage.setItem(BUDGET_KEY, JSON.stringify(budget));
  updateBudgetBar();
  showToast('\u2705 \u05d9\u05e2\u05d3 \u05d4\u05ea\u05e7\u05e6\u05d9\u05d1 \u05e0\u05e9\u05de\u05e8!');
});

function updateBudgetBar() {
  if (!budget || budget <= 0) { budgetBarWrap.classList.remove('visible'); return; }
  const totalExp = transactions.filter(t => t.type === 'expense').reduce((s,t) => s + t.amount, 0);
  const pct      = Math.min((totalExp / budget) * 100, 100);
  budgetBarWrap.classList.add('visible');
  budgetFill.style.width       = pct + '%';
  budgetSpentLabel.textContent = formatCurrency(totalExp) + ' \u05d4\u05d5\u05e6\u05d0\u05d5';
  budgetPctLabel.textContent   = Math.round(pct) + '%';
  const isWarn = pct >= 80;
  budgetFill.classList.toggle('warn', isWarn);
  document.body.classList.toggle('budget-warn', isWarn);
  if (pct >= 100)  budgetStatusMsg.textContent = '\u26a0\ufe0f \u05d7\u05e8\u05d2\u05ea \u05de\u05d4\u05ea\u05e7\u05e6\u05d9\u05d1!';
  else if (isWarn) budgetStatusMsg.textContent = '\u26a0\ufe0f \u05e7\u05e8\u05d5\u05d1 \u05dc\u05d2\u05d1\u05d5\u05dc';
  else             budgetStatusMsg.textContent = '\u2713 \u05d1\u05ea\u05d5\u05da \u05d4\u05ea\u05e7\u05e6\u05d9\u05d1';
}

// Pie Chart
let pieChart = null;
const PASTEL_COLORS = ['rgba(255,179,186,0.88)','rgba(255,223,186,0.88)','rgba(178,236,200,0.88)','rgba(186,225,255,0.88)','rgba(220,190,255,0.88)','rgba(255,243,176,0.88)','rgba(200,240,220,0.88)','rgba(255,210,190,0.88)','rgba(190,220,255,0.88)','rgba(240,200,230,0.88)'];

function updatePieChart() {
  const byCategory = {};
  transactions.filter(t => t.type === 'expense').forEach(t => {
    const cat = t.category || '\u05d0\u05d7\u05e8';
    byCategory[cat] = (byCategory[cat] || 0) + t.amount;
  });
  const labels   = Object.keys(byCategory);
  const data     = Object.values(byCategory);
  const canvas   = document.getElementById('pie-chart');
  const emptyMsg = document.getElementById('chart-empty-msg');
  if (!labels.length) {
    canvas.style.display ='none'; emptyMsg.style.display='block';
    if (pieChart) { pieChart.destroy(); pieChart = null; }
    return;
  }
  canvas.style.display='block'; emptyMsg.style.display='none';
  const colors  = labels.map((_,i) => PASTEL_COLORS[i % PASTEL_COLORS.length]);
  const borders = colors.map(c => c.replace('0.88','1'));
  if (pieChart) {
    pieChart.data.labels = labels;
    pieChart.data.datasets[0].data = data;
    pieChart.data.datasets[0].backgroundColor = colors;
    pieChart.data.datasets[0].borderColor = borders;
    pieChart.update();
  } else {
    pieChart = new Chart(canvas, {
      type: 'doughnut',
      data: { labels, datasets: [{ data, backgroundColor: colors, borderColor: borders, borderWidth: 2.5, hoverOffset: 10 }] },
      options: {
        responsive: true,
        plugins: {
          legend: { position:'bottom', labels:{ font:{family:"'Segoe UI',Tahoma,Arial,sans-serif",size:12}, color: document.body.classList.contains('dark-mode')?'#c0a880':'#4a3825', padding:14, boxWidth:14, borderRadius:4 }},
          tooltip: { callbacks: { label: ctx => { const total=ctx.dataset.data.reduce((a,b)=>a+b,0); const pct=((ctx.parsed/total)*100).toFixed(1); return ` ${ctx.label}: ${formatCurrency(ctx.parsed)} (${pct}%)`; }}}
        }
      }
    });
  }
}

// Summary
function updateSummary() {
  const inc = transactions.filter(t=>t.type==='income').reduce((s,t)=>s+t.amount,0);
  const exp = transactions.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0);
  const bal = inc - exp;
  totalIncomeEl.textContent   = formatCurrency(inc);
  totalExpensesEl.textContent = formatCurrency(exp);
  balanceEl.textContent       = formatCurrency(bal);
  balanceEl.style.color       = bal >= 0 ? 'var(--income-color)' : 'var(--expense-color)';
  updatePieChart();
  updateBudgetBar();
}

// Table
function renderTable() {
  tbody.innerHTML = '';
  if (!transactions.length) { emptyState.classList.add('visible'); updateSummary(); return; }
  emptyState.classList.remove('visible');
  [...transactions].reverse().forEach((t, idx) => {
    const tr = document.createElement('tr');
    const isIncome = t.type === 'income';
    tr.innerHTML = `
      <td class="row-num">${transactions.length - idx}</td>
      <td>${escapeHtml(t.name)}</td>
      <td class="cat-cell">${escapeHtml(t.category || '\u2014')}</td>
      <td><span class="badge ${isIncome?'badge-income':'badge-expense'}">
        <span class="badge-arrow">${isIncome?'\u25b2':'\u25bc'}</span>
        ${isIncome?'\u05d4\u05db\u05e0\u05e1\u05d4':'\u05d4\u05d5\u05e6\u05d0\u05d4'}
      </span></td>
      <td class="${isIncome?'amount-income':'amount-expense'}">${isIncome?'+':'-'}${formatCurrency(t.amount)}</td>
      <td class="date-cell">${formatDate(t.date)}</td>
      <td><button class="btn-delete" data-id="${t.id}" title="\u05de\u05d7\u05e7">\uD83D\uDDD1\uFE0F</button></td>`;
    tbody.appendChild(tr);
  });
  updateSummary();
}

// Add Transaction
form.addEventListener('submit', e => {
  e.preventDefault();
  const name     = nameInput.value.trim();
  const amount   = parseFloat(amountInput.value);
  const category = categorySelect.value;
  if (!name || isNaN(amount) || amount <= 0) { showToast('\u26a0\ufe0f \u05d0\u05e0\u05d0 \u05de\u05dc\u05d0 \u05d0\u05ea \u05db\u05dc \u05d4\u05e9\u05d3\u05d5\u05ea \u05db\u05e8\u05d0\u05d5\u05d9.'); return; }
  db.collection('transactions').add({ name, amount, type: currentType, category, date: new Date().toISOString() })
    .then(() => { nameInput.value=''; amountInput.value=''; nameInput.focus(); showToast(currentType==='income'?'\u2705 \u05d4\u05db\u05e0\u05e1\u05d4 \u05e0\u05d5\u05e1\u05e4\u05d4!':'\u2705 \u05d4\u05d5\u05e6\u05d0\u05d4 \u05e0\u05d5\u05e1\u05e4\u05d4!'); })
    .catch(() => showToast('\u26a0\ufe0f \u05e9\u05d2\u05d9\u05d0\u05d4 \u05d1\u05e9\u05de\u05d9\u05e8\u05d4 \u05dc\u05e2\u05e0\u05df.'));
});

// Delete Transaction
tbody.addEventListener('click', e => {
  const btn = e.target.closest('.btn-delete');
  if (!btn) return;
  const row = btn.closest('tr');
  const doDelete = () => db.collection('transactions').doc(btn.dataset.id).delete().then(()=>showToast('\uD83D\uDDD1\uFE0F \u05e0\u05de\u05d7\u05e7\u05d4.')).catch(()=>showToast('\u26a0\ufe0f \u05e9\u05d2\u05d9\u05d0\u05d4.'));
  if (row) { row.classList.add('row-exit'); row.addEventListener('animationend', doDelete, {once:true}); } else doDelete();
});

// Clear All
clearAllBtn.addEventListener('click', () => {
  if (!transactions.length) { showToast('\u05d0\u05d9\u05df \u05ea\u05e0\u05d5\u05e2\u05d5\u05ea \u05dc\u05de\u05d7\u05d9\u05e7\u05d4.'); return; }
  if (!confirm('\u05d4\u05d0\u05dd \u05d0\u05ea\u05d4 \u05d1\u05d8\u05d5\u05d7 \u05e9\u05d1\u05e8\u05e6\u05d5\u05e0\u05da \u05dc\u05de\u05d7\u05d5\u05e7 \u05d0\u05ea \u05db\u05dc \u05d4\u05ea\u05e0\u05d5\u05e2\u05d5\u05ea?')) return;
  db.collection('transactions').get()
    .then(snap => { const batch=db.batch(); snap.docs.forEach(d=>batch.delete(d.ref)); return batch.commit(); })
    .then(() => showToast('\uD83D\uDDD1\uFE0F \u05db\u05dc \u05d4\u05ea\u05e0\u05d5\u05e2\u05d5\u05ea \u05e0\u05de\u05d7\u05e7\u05d5.'))
    .catch(() => showToast('\u26a0\ufe0f \u05e9\u05d2\u05d9\u05d0\u05d4.'));
});

// Category: Add
saveCategoryBtn.addEventListener('click', addNewCategory);
newCategoryInput.addEventListener('keydown', e => { if (e.key==='Enter') { e.preventDefault(); addNewCategory(); } });
function addNewCategory() {
  const name = newCategoryInput.value.trim();
  if (!name) { showToast('\u26a0\ufe0f \u05e0\u05d0 \u05dc\u05d4\u05d6\u05d9\u05df \u05e9\u05dd \u05e7\u05d8\u05d2\u05d5\u05e8\u05d9\u05d4.'); return; }
  if (categories.some(c=>c.toLowerCase()===name.toLowerCase())) { showToast('\u26a0\ufe0f \u05e7\u05d8\u05d2\u05d5\u05e8\u05d9\u05d4 \u05e7\u05d9\u05d9\u05de\u05ea.'); return; }
  categories.push(name); saveCategories(); renderCategorySelect(); renderCategoryModal(); newCategoryInput.value=''; newCategoryInput.focus();
  showToast('\u2705 \u05e7\u05d8\u05d2\u05d5\u05e8\u05d9\u05d4 "'+name+'" \u05e0\u05d5\u05e1\u05e4\u05d4!');
}

// Category: Reset
document.getElementById('reset-categories-btn').addEventListener('click', () => {
  if (confirm('\u05dc\u05d0\u05e4\u05e1 \u05e7\u05d8\u05d2\u05d5\u05e8\u05d9\u05d5\u05ea \u05dc\u05d1\u05e8\u05d9\u05e8\u05ea \u05de\u05d7\u05d3\u05dc?')) {
    categories=[...DEFAULT_CATEGORIES]; saveCategories(); renderCategorySelect(); renderCategoryModal();
    showToast('\u2705 \u05d0\u05d5\u05e4\u05e1\u05d5 \u05dc\u05d1\u05e8\u05d9\u05e8\u05ea \u05de\u05d7\u05d3\u05dc.');
  }
});

// Category: Delete
categoryListEl.addEventListener('click', e => {
  const btn = e.target.closest('.btn-delete-cat');
  if (!btn) return;
  const idx=Number(btn.dataset.index), name=categories[idx];
  categories.splice(idx,1); saveCategories(); renderCategorySelect(); renderCategoryModal();
  showToast('\uD83D\uDDD1\uFE0F "\u05e7\u05d8\u05d2\u05d5\u05e8\u05d9\u05d4 '+name+'" \u05e0\u05de\u05d7\u05e7\u05d4.');
});

// Download helper
function downloadFile(content, filename, mimeType) {
  const blob=new Blob([content],{type:mimeType}), url=URL.createObjectURL(blob);
  const a=Object.assign(document.createElement('a'),{href:url,download:filename});
  document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
}

// Export CSV
document.getElementById('export-csv-btn').addEventListener('click', () => {
  if (!transactions.length) { showToast('\u26a0\ufe0f \u05d0\u05d9\u05df \u05ea\u05e0\u05d5\u05e2\u05d5\u05ea \u05dc\u05d9\u05d9\u05e6\u05d5\u05d0.'); return; }
  const headers=['#','\u05ea\u05d9\u05d0\u05d5\u05e8','\u05e7\u05d8\u05d2\u05d5\u05e8\u05d9\u05d4','\u05e1\u05d5\u05d2','\u05e1\u05db\u05d5\u05dd','\u05ea\u05d0\u05e8\u05d9\u05da'];
  const rows=[...transactions].reverse().map((t,i)=>[i+1,`"${t.name.replace(/"/g,'""')}"`,`"${(t.category||'').replace(/"/g,'""')}"`,t.type==='income'?'\u05d4\u05db\u05e0\u05e1\u05d4':'\u05d4\u05d5\u05e6\u05d0\u05d4',t.amount.toFixed(2),new Date(t.date).toLocaleDateString('he-IL')]);
  const csv='\uFEFF'+[headers.join(','),...rows.map(r=>r.join(','))].join('\r\n');
  downloadFile(csv,'\u05d3\u05d5\u05d7_\u05de\u05e9\u05e4\u05d7\u05ea_\u05d8\u05d5\u05dc\u05d3\u05e0\u05d5.csv','text/csv;charset=utf-8;');
  showToast('\u2705 CSV \u05d4\u05d5\u05e8\u05d3!');
});

// Export PDF
document.getElementById('export-pdf-btn').addEventListener('click', () => {
  if (!transactions.length) { showToast('\u26a0\ufe0f \u05d0\u05d9\u05df \u05ea\u05e0\u05d5\u05e2\u05d5\u05ea \u05dc\u05d9\u05d9\u05e6\u05d5\u05d0.'); return; }
  const inc=transactions.filter(t=>t.type==='income').reduce((s,t)=>s+t.amount,0);
  const exp=transactions.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0);
  const bal=inc-exp;
  const rows=[...transactions].reverse().map((t,i)=>{
    const isI=t.type==='income';
    return `<tr><td>${i+1}</td><td>${escapeHtml(t.name)}</td><td>${escapeHtml(t.category||'\u2014')}</td><td>${isI?'\u05d4\u05db\u05e0\u05e1\u05d4':'\u05d4\u05d5\u05e6\u05d0\u05d4'}</td><td style="color:${isI?'#2E7D32':'#c61e1e'};font-weight:700">${isI?'+':'-'}${formatCurrency(t.amount)}</td><td>${new Date(t.date).toLocaleDateString('he-IL')}</td></tr>`;
  }).join('');
  const wrap=document.createElement('div');
  wrap.style.cssText='position:absolute;top:-9999px;left:0;width:794px;background:#FDF6EC;font-family:Arial,sans-serif;direction:rtl;padding:36px 40px;color:#50433b;font-size:13px;';
  wrap.innerHTML=`<div style="text-align:center;margin-bottom:22px"><h1 style="font-size:1.45rem;color:#5D3317">\u05e0\u05d9\u05d4\u05d5\u05dc \u05db\u05dc\u05db\u05dc\u05d9 \u05de\u05e9\u05e4\u05d7\u05ea \u05d8\u05d5\u05dc\u05d3\u05e0\u05d5</h1><p style="font-size:.8rem;color:#7A5C3E">\u05d3\u05d5\u05d7 \u05de\u05d9\u05d5\u05dd ${new Date().toLocaleDateString('he-IL')}</p></div>
  <div style="display:flex;gap:12px;justify-content:center;margin-bottom:22px;flex-wrap:wrap">
    <div style="text-align:center;padding:10px 18px;border-radius:8px;border:2px solid #a68f76;background:#F5E8CC"><div style="font-size:.66rem;color:#7A5C3E;margin-bottom:3px">\u05e1\u05da \u05d4\u05db\u05e0\u05e1\u05d5\u05ea</div><div style="font-size:1.15rem;font-weight:800;color:#2E7D32">${formatCurrency(inc)}</div></div>
    <div style="text-align:center;padding:10px 18px;border-radius:8px;border:2px solid #a68f76;background:#F5E8CC"><div style="font-size:.66rem;color:#7A5C3E;margin-bottom:3px">\u05e1\u05da \u05d4\u05d5\u05e6\u05d0\u05d5\u05ea</div><div style="font-size:1.15rem;font-weight:800;color:#c61e1e">${formatCurrency(exp)}</div></div>
    <div style="text-align:center;padding:10px 18px;border-radius:8px;border:2px solid #a68f76;background:#F5E8CC"><div style="font-size:.66rem;color:#7A5C3E;margin-bottom:3px">\u05d9\u05ea\u05e8\u05d4</div><div style="font-size:1.15rem;font-weight:800;color:${bal>=0?'#2E7D32':'#c61e1e'}">${formatCurrency(bal)}</div></div>
  </div>
  <table style="width:100%;border-collapse:collapse;font-size:.82rem"><thead><tr>
    <th style="background:#5D3317;color:#FDF6EC;padding:.5rem;text-align:right">#</th>
    <th style="background:#5D3317;color:#FDF6EC;padding:.5rem;text-align:right">\u05ea\u05d9\u05d0\u05d5\u05e8</th>
    <th style="background:#5D3317;color:#FDF6EC;padding:.5rem;text-align:right">\u05e7\u05d8\u05d2\u05d5\u05e8\u05d9\u05d4</th>
    <th style="background:#5D3317;color:#FDF6EC;padding:.5rem;text-align:right">\u05e1\u05d5\u05d2</th>
    <th style="background:#5D3317;color:#FDF6EC;padding:.5rem;text-align:right">\u05e1\u05db\u05d5\u05dd</th>
    <th style="background:#5D3317;color:#FDF6EC;padding:.5rem;text-align:right">\u05ea\u05d0\u05e8\u05d9\u05da</th>
  </tr></thead><tbody>${rows}</tbody></table>`;
  document.body.appendChild(wrap);
  showToast('\u23f3 \u05d9\u05d5\u05e6\u05e8 PDF...');
  html2canvas(wrap,{scale:2,useCORS:true,backgroundColor:'#FDF6EC',logging:false}).then(canvas2d => {
    const {jsPDF}=window.jspdf;
    const pdf=new jsPDF({orientation:'portrait',unit:'mm',format:'a4'});
    const pageW=pdf.internal.pageSize.getWidth(), pageH=pdf.internal.pageSize.getHeight();
    const imgData=canvas2d.toDataURL('image/png');
    const imgH=(canvas2d.height*pageW)/canvas2d.width;
    let remaining=imgH, pos=0;
    pdf.addImage(imgData,'PNG',0,pos,pageW,imgH);
    remaining-=pageH;
    while(remaining>0){pos=remaining-imgH;pdf.addPage();pdf.addImage(imgData,'PNG',0,pos,pageW,imgH);remaining-=pageH;}
    pdf.save('\u05d3\u05d5\u05d7_\u05de\u05e9\u05e4\u05d7\u05ea_\u05d8\u05d5\u05dc\u05d3\u05e0\u05d5.pdf');
    document.body.removeChild(wrap);
    showToast('\u2705 PDF \u05d4\u05d5\u05e8\u05d3!');
  }).catch(()=>{document.body.removeChild(wrap);showToast('\u26a0\ufe0f \u05e9\u05d2\u05d9\u05d0\u05d4 \u05d1\u05d9\u05e6\u05d9\u05e8\u05ea PDF.');});
});

// Import
document.getElementById('import-file').addEventListener('change', function(e) {
  const file=e.target.files[0]; if (!file) return;
  const reader=new FileReader();
  reader.onload=function(ev) {
    try {
      const data=JSON.parse(ev.target.result);
      let imported;
      if (Array.isArray(data)) { imported=data; }
      else if (data.transactions&&Array.isArray(data.transactions)) {
        imported=data.transactions;
        if (data.categories&&Array.isArray(data.categories)) {
          const newCats=data.categories.filter(isValidHebrewString);
          if (newCats.length) { categories=[...new Set([...categories,...newCats])]; saveCategories(); renderCategorySelect(); }
        }
      } else { showToast('\u26a0\ufe0f \u05e4\u05d5\u05e8\u05de\u05d8 \u05e7\u05d5\u05d1\u05e5 \u05d0\u05d9\u05e0\u05d5 \u05e0\u05ea\u05de\u05da.'); return; }
      const valid=imported.filter(t=>t&&typeof t.name==='string'&&t.name.trim()&&typeof t.amount==='number'&&t.amount>0&&['income','expense'].includes(t.type));
      if (!valid.length) { showToast('\u26a0\ufe0f \u05dc\u05d0 \u05e0\u05de\u05e6\u05d0\u05d5 \u05ea\u05e0\u05d5\u05e2\u05d5\u05ea \u05ea\u05e7\u05d9\u05e0\u05d5\u05ea.'); return; }
      const batch=db.batch();
      valid.forEach(t=>{ if(!t.date) t.date=new Date().toISOString(); const {id,...docData}=t; batch.set(db.collection('transactions').doc(),docData); });
      batch.commit().then(()=>showToast('\u2705 \u05d9\u05d5\u05d1\u05d0\u05d5 '+valid.length+' \u05ea\u05e0\u05d5\u05e2\u05d5\u05ea!')).catch(()=>showToast('\u26a0\ufe0f \u05e9\u05d2\u05d9\u05d0\u05d4 \u05d1\u05d9\u05d9\u05d1\u05d5\u05d0.'));
    } catch { showToast('\u26a0\ufe0f \u05e9\u05d2\u05d9\u05d0\u05d4 \u05d1\u05e7\u05e8\u05d9\u05d0\u05ea \u05d4\u05e7\u05d5\u05d1\u05e5.'); }
    e.target.value='';
  };
  reader.readAsText(file,'UTF-8');
});

// Floating Currency Shapes
(function initFloaters() {
  const canvas=document.getElementById('balloon-canvas'); if (!canvas) return;
  const ctx=canvas.getContext('2d');
  function resize(){canvas.width=window.innerWidth;canvas.height=window.innerHeight;}
  resize(); window.addEventListener('resize',()=>{resize();floaters.forEach(f=>{f.x=Math.random()*canvas.width;f.y=Math.random()*canvas.height;});});
  function randomBetween(a,b){return a+Math.random()*(b-a);}
  function lerpColor(c1,c2,t){return c1.map((v,i)=>Math.round(v+(c2[i]-v)*t));}
  const COLOR_MAP={
    shekel: {light:[[245,225,195],[235,210,175],[250,235,210]],dark:[[180,140,80],[160,120,60],[190,155,90]]},
    dollar: {light:[[220,205,180],[235,220,195],[240,228,208]],dark:[[140,110,60],[120,95,45],[155,125,70]]},
    bitcoin:{light:[[255,230,175],[248,215,155],[255,238,192]],dark:[[200,155,50],[180,135,30],[210,165,65]]},
    chart:  {light:[[210,195,170],[225,210,185],[238,222,200]],dark:[[130,105,70],[110,88,55],[145,118,82]]},
  };
  const POOL=[...Array(6).fill('shekel'),...Array(6).fill('dollar'),...Array(5).fill('bitcoin'),...Array(5).fill('chart')];
  const LABEL={shekel:'\u20AA',dollar:'$',bitcoin:'\u20BF',chart:null};
  const floaters=POOL.map(type=>{
    const palette=COLOR_MAP[type].light;
    return {type,sz:randomBetween(36,62),alpha:randomBetween(0.58,0.80),
      x:randomBetween(80,Math.max(200,canvas.width-80)),y:randomBetween(80,Math.max(200,canvas.height-80)),
      hoverAmpY:randomBetween(16,34),hoverAmpX:randomBetween(8,22),hoverSpY:randomBetween(0.010,0.022),hoverSpX:randomBetween(0.006,0.015),
      phaseY:Math.random()*Math.PI*2,phaseX:Math.random()*Math.PI*2,rot:randomBetween(-0.18,0.18),
      colorIdx:Math.floor(Math.random()*palette.length),colorT:Math.random(),colorSp:randomBetween(0.003,0.008),
      bars:Array.from({length:5},()=>randomBetween(0.30,1.0))};
  });
  let t=0;
  function drawCurrencySymbol(cx,cy,f,r,g,b){
    const isDark=document.body.classList.contains('dark-mode');
    const fSize=f.sz, label=LABEL[f.type];
    ctx.save();
    ctx.font=`900 ${fSize}px "Segoe UI Emoji","Segoe UI",Arial,sans-serif`;
    ctx.textAlign='center'; ctx.textBaseline='middle';
    const depth=Math.round(fSize*0.09);
    ctx.fillStyle=`rgba(${Math.max(0,r-90)},${Math.max(0,g-90)},${Math.max(0,b-90)},0.45)`; ctx.fillText(label,cx+depth,cy+depth);
    ctx.fillStyle=`rgba(${Math.max(0,r-50)},${Math.max(0,g-50)},${Math.max(0,b-50)},0.55)`; ctx.fillText(label,cx+Math.round(depth*0.5),cy+Math.round(depth*0.5));
    ctx.shadowColor=isDark?`rgba(${r},${g},${b},0.55)`:`rgba(${r},${g},${b},0.45)`;
    ctx.shadowBlur=fSize*0.45; ctx.shadowOffsetX=0; ctx.shadowOffsetY=0;
    ctx.fillStyle=`rgba(${r},${g},${b},${f.alpha})`; ctx.fillText(label,cx,cy);
    ctx.shadowColor='transparent'; ctx.shadowBlur=0;
    ctx.fillStyle=`rgba(${r},${g},${b},${f.alpha})`; ctx.fillText(label,cx,cy);
    const hl=Math.round(depth*0.55);
    ctx.fillStyle=isDark?'rgba(255,255,255,0.18)':'rgba(255,255,255,0.55)'; ctx.fillText(label,cx-hl,cy-hl);
    ctx.restore();
  }
  function drawChart(cx,cy,f,r,g,b){
    const isDark=document.body.classList.contains('dark-mode');
    const w=f.sz*1.6, h=f.sz*1.0;
    const bw=w/(f.bars.length*1.5), gap=(w-bw*f.bars.length)/(f.bars.length+1);
    ctx.save();
    ctx.shadowColor=isDark?`rgba(${r},${g},${b},0.50)`:`rgba(${r},${g},${b},0.35)`;
    ctx.shadowBlur=f.sz*0.40; ctx.shadowOffsetX=0; ctx.shadowOffsetY=0;
    f.bars.forEach((val,i)=>{
      const bh=h*val, bx=cx-w/2+gap+i*(bw+gap), by=cy+h/2-bh;
      const depth=Math.round(f.sz*0.07);
      ctx.fillStyle=`rgba(${Math.max(0,r-80)},${Math.max(0,g-80)},${Math.max(0,b-80)},0.40)`;
      ctx.beginPath(); ctx.roundRect(bx+depth,by+depth,bw,bh,3); ctx.fill();
      const grad=ctx.createLinearGradient(bx,by,bx,by+bh);
      grad.addColorStop(0,`rgba(255,255,255,${isDark?0.25:0.60})`);
      grad.addColorStop(0.4,`rgba(${r},${g},${b},${f.alpha})`);
      grad.addColorStop(1,`rgba(${Math.max(0,r-50)},${Math.max(0,g-50)},${Math.max(0,b-50)},${f.alpha})`);
      ctx.shadowColor='transparent'; ctx.fillStyle=grad;
      ctx.beginPath(); ctx.roundRect(bx,by,bw,bh,3); ctx.fill();
      ctx.fillStyle=isDark?'rgba(255,255,255,0.15)':'rgba(255,255,255,0.45)';
      ctx.beginPath(); ctx.roundRect(bx+1,by+1,bw*0.38,bh*0.55,2); ctx.fill();
    });
    ctx.shadowColor=isDark?`rgba(${r},${g},${b},0.70)`:`rgba(${r},${g},${b},0.55)`; ctx.shadowBlur=8;
    ctx.strokeStyle=isDark?'rgba(255,255,255,0.75)':`rgba(${Math.max(0,r-60)},${Math.max(0,g-60)},${Math.max(0,b-60)},0.90)`;
    ctx.lineWidth=2.2; ctx.lineJoin='round'; ctx.beginPath();
    f.bars.forEach((val,i)=>{
      const bw2=w/(f.bars.length*1.5), gap2=(w-bw2*f.bars.length)/(f.bars.length+1);
      const px=cx-w/2+gap2+i*(bw2+gap2)+bw2/2, py=cy+h/2-h*val;
      i===0?ctx.moveTo(px,py):ctx.lineTo(px,py);
    });
    ctx.stroke(); ctx.restore();
  }
  function drawFloater(f){
    const isDark=document.body.classList.contains('dark-mode');
    const palette=isDark?COLOR_MAP[f.type].dark:COLOR_MAP[f.type].light;
    f.colorT+=f.colorSp; if(f.colorT>=1){f.colorT-=1;f.colorIdx=(f.colorIdx+1)%palette.length;}
    const [r,g,b]=lerpColor(palette[f.colorIdx],palette[(f.colorIdx+1)%palette.length],f.colorT);
    const cx=f.x+Math.sin(t*f.hoverSpX+f.phaseX)*f.hoverAmpX;
    const cy=f.y+Math.sin(t*f.hoverSpY+f.phaseY)*f.hoverAmpY;
    ctx.save(); ctx.translate(cx,cy); ctx.rotate(f.rot); ctx.globalAlpha=f.alpha;
    if(f.type==='chart') drawChart(0,0,f,r,g,b); else drawCurrencySymbol(0,0,f,r,g,b);
    ctx.restore();
  }
  function animate(){ctx.clearRect(0,0,canvas.width,canvas.height);t++;for(const f of floaters)drawFloater(f);requestAnimationFrame(animate);}
  requestAnimationFrame(animate);
})();

// Dark Mode
const darkModeBtn=document.getElementById('dark-mode-btn');
function applyDarkMode(enabled){
  document.body.classList.toggle('dark-mode',enabled);
  darkModeBtn.textContent=enabled?'☀️':'🌙';
  darkModeBtn.title=enabled?'\u05de\u05e6\u05d1 \u05d9\u05d5\u05dd':'\u05de\u05e6\u05d1 \u05dc\u05d9\u05dc\u05d4';
  if(pieChart){pieChart.destroy();pieChart=null;updatePieChart();}
}
darkModeBtn.addEventListener('click',()=>{
  const isNowDark=!document.body.classList.contains('dark-mode');
  applyDarkMode(isNowDark);
  localStorage.setItem(DARK_MODE_KEY,isNowDark?'1':'0');
});
applyDarkMode(localStorage.getItem(DARK_MODE_KEY)==='1');

// Init: load categories then start real-time listener
loadCategoriesFromFirestore().then(cats=>{
  categories=cats||[...DEFAULT_CATEGORIES];
  if(!cats) saveCategories();
  renderCategorySelect();
}).catch(()=>{ categories=[...DEFAULT_CATEGORIES]; renderCategorySelect(); });

db.collection('transactions').orderBy('date','asc').onSnapshot(snapshot=>{
  transactions=snapshot.docs.map(doc=>({id:doc.id,...doc.data()}));
  renderTable();
  hideLoader();
}, err=>{
  console.error('[MyMoneyApp] Firestore error:',err);
  showToast('\u26a0\ufe0f \u05e9\u05d2\u05d9\u05d0\u05ea \u05d7\u05d9\u05d1\u05d5\u05e8 \u05dc\u05e2\u05e0\u05df.');
  hideLoader();
});

if(budget>0) budgetInputEl.value=budget;
