import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDK3oq5I-MHnjYGXkRBfUeYs3vw7zwB0gE",
  authDomain: "mymoneyapp-abb12.firebaseapp.com",
  projectId: "mymoneyapp-abb12",
  storageBucket: "mymoneyapp-abb12.firebasestorage.app",
  messagingSenderId: "728703755358",
  appId: "1:728703755358:web:e10f94bfc61ec631dcc0cf",
  measurementId: "G-2D4YL4DWQT"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const transactionsCol = collection(db, "transactions");

let currentType = 'expense';
let myChart = null;
let allData = [];

// --- אלמנטים חדשים (חיפוש וחודש) ---
const monthFilter = document.getElementById('month-filter');
const searchInput = document.getElementById('search-input');

function populateMonths() {
    const months = ["ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני", "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"];
    const currentMonth = new Date().getMonth();
    months.forEach((m, index) => {
        const opt = document.createElement('option');
        opt.value = index; opt.innerText = m;
        if (index === currentMonth) opt.selected = true;
        monthFilter.appendChild(opt);
    });
}
populateMonths();

// האזנה לשינויים בחיפוש ובחודש
monthFilter.onchange = () => renderUI(allData);
searchInput.oninput = () => renderUI(allData);

// --- קטגוריות וכפתורים ---
const categories = ["מזון", "בית", "חינוך", "פנאי", "רכב", "בריאות", "משכורת", "אחר"];
const categorySelect = document.getElementById('transaction-category');
categories.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat; opt.innerText = cat;
    categorySelect.appendChild(opt);
});

const btnExpense = document.getElementById('type-btn-expense');
const btnIncome = document.getElementById('type-btn-income');
btnExpense.onclick = () => { currentType = 'expense'; btnExpense.classList.add('active'); btnIncome.classList.remove('active'); };
btnIncome.onclick = () => { currentType = 'income'; btnIncome.classList.add('active'); btnExpense.classList.remove('active'); };

const darkModeBtn = document.getElementById('dark-mode-btn');
darkModeBtn.onclick = () => {
    document.body.classList.toggle('dark-mode');
    darkModeBtn.innerText = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
};

// --- Firebase Actions ---
document.getElementById('transaction-form').onsubmit = async (e) => {
    e.preventDefault();
    const nameInput = document.getElementById('transaction-name');
    const amountInput = document.getElementById('transaction-amount');
    const categoryInput = document.getElementById('transaction-category');

    await addDoc(transactionsCol, {
        description: nameInput.value,
        amount: parseFloat(amountInput.value),
        category: categoryInput.value,
        type: currentType,
        date: Date.now()
    });
    nameInput.value = ''; amountInput.value = '';
};

onSnapshot(query(transactionsCol, orderBy("date", "desc")), (snapshot) => {
    allData = [];
    snapshot.forEach(doc => allData.push({ id: doc.id, ...doc.data() }));
    document.getElementById('app-loader').classList.add('hidden');
    renderUI(allData);
});

// --- ליבת האפליקציה: הצגת הנתונים ---
function renderUI(data) {
    const selMonth = monthFilter.value;
    const searchTerm = searchInput.value.toLowerCase();
    const tbody = document.getElementById('transactions-body');
    tbody.innerHTML = '';
    
    let inc = 0, exp = 0;
    const catTotals = {};

    // סינון כפול: חודש + חיפוש
    const filtered = data.filter(t => {
        const d = new Date(t.date);
        const matchMonth = (selMonth === "all") || (d.getMonth() == selMonth && d.getFullYear() == new Date().getFullYear());
        const matchSearch = t.description.toLowerCase().includes(searchTerm) || t.category.toLowerCase().includes(searchTerm);
        return matchMonth && matchSearch;
    });

    filtered.forEach(t => {
        if (t.type === 'income') inc += t.amount;
        else { 
            exp += t.amount; 
            catTotals[t.category] = (catTotals[t.category] || 0) + t.amount; 
        }

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${t.description}</td>
            <td><span class="badge">${t.category}</span></td>
            <td><span class="badge ${t.type === 'income' ? 'badge-income' : 'badge-expense'}">${t.type === 'income' ? '↑' : '↓'}</span></td>
            <td style="font-weight:bold; color:${t.type === 'income' ? '#3a7a40' : '#c04828'}">₪${t.amount.toLocaleString()}</td>
            <td>${new Date(t.date).toLocaleDateString('he-IL')}</td>
            <td><button class="btn-delete" onclick="deleteTransaction('${t.id}')">🗑️</button></td>
        `;
        tbody.appendChild(tr);
    });

    document.getElementById('total-income').innerText = `₪${inc.toLocaleString()}`;
    document.getElementById('total-expenses').innerText = `₪${exp.toLocaleString()}`;
    const balance = inc - exp;
    document.getElementById('balance').innerText = `₪${balance.toLocaleString()}`;
    document.getElementById('empty-state').style.display = filtered.length ? 'none' : 'block';
    
    updateChart(catTotals);
    updateSavingTarget(balance);
}

function updateSavingTarget(balance) {
    const savingTarget = 2500; // יעד מעודכן ל-2500 ש"ח
    const percentage = Math.min(Math.max((balance / savingTarget) * 100, 0), 100);
    const progressFill = document.getElementById('target-progress-fill');
    const targetPercentText = document.getElementById('target-percentage');
    const targetMsg = document.getElementById('target-message');

    if(progressFill) {
        progressFill.style.width = percentage + "%";
        targetPercentText.innerText = Math.round(percentage) + "%";
        if (balance >= savingTarget) {
            targetMsg.innerText = "הגעתם ליעד החיסכון! 🏆";
            targetMsg.style.color = "#3a7a40";
        } else if (balance > 0) {
            targetMsg.innerText = `נשאר לכם עוד ₪${(savingTarget - balance).toLocaleString()} ליעד.`;
            targetMsg.style.color = "#666";
        } else {
            targetMsg.innerText = "אין יתרה לחיסכון החודש.";
            targetMsg.style.color = "#c04828";
        }
    }
}

window.deleteTransaction = async (id) => {
    if (confirm("למחוק?")) await deleteDoc(doc(db, "transactions", id));
};

// --- ייצוא ---
document.getElementById('export-pdf-btn').onclick = async () => {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
    const mainEl = document.querySelector('main');
    const canvas = await html2canvas(mainEl, { scale: 1.5, useCORS: true, backgroundColor: '#f2e8d8' });
    pdf.addImage(canvas.toDataURL('image/jpeg', 0.90), 'JPEG', 0, 0, 210, (canvas.height * 210) / canvas.width);
    pdf.save(`דוח_טולדנו_חודש_${Number(monthFilter.value)+1}.pdf`);
};

document.getElementById('export-excel-btn').onclick = () => {
    const excelData = allData.filter(t => {
        const d = new Date(t.date);
        return (monthFilter.value === "all") || (d.getMonth() == monthFilter.value && d.getFullYear() == new Date().getFullYear());
    }).map(t => ({
        "תיאור": t.description, "קטגוריה": t.category, "סוג": t.type, "סכום": t.amount, "תאריך": new Date(t.date).toLocaleDateString('he-IL')
    }));
    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "תנועות");
    XLSX.writeFile(wb, "דוח_משפחתי.xlsx");
};

function updateChart(totals) {
    const ctx = document.getElementById('pie-chart').getContext('2d');
    if (myChart) myChart.destroy();
    if (Object.keys(totals).length === 0) { document.getElementById('chart-empty-msg').style.display = 'block'; return; }
    document.getElementById('chart-empty-msg').style.display = 'none';
    myChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(totals),
            datasets: [{ data: Object.values(totals), backgroundColor: ['#FFB7B2', '#B2E2F2', '#B2F2BB', '#F2E2B2', '#D9B2F2'] }]
        }
    });
}