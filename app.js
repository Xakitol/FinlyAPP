import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// הגדרות Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDK3oq5I-MHnjYGXkRBfUeYs3vw7zwB0gE",
    authDomain: "mymoneyapp-abb12.firebaseapp.com",
    projectId: "mymoneyapp-abb12",
    storageBucket: "mymoneyapp-abb12.firebasestorage.app",
    messagingSenderId: "728703755358",
    appId: "1:728703755358:web:e10f94bfc61ec631dcc0cf",
    measurementId: "G-2D4YL4DWQT"
};

// אתחול
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const transactionsCol = collection(db, "transactions");

let currentType = 'expense';
let allData = [];
let myChart = null;
let editId = null;
let pendingRecurring = [];

// פונקציית התחלה שמדלגת על לוגין ומציגה את האפליקציה
function init() {
    const authScreen = document.getElementById('auth-screen');
    const appLoader = document.getElementById('app-loader');
    
    if (authScreen) authScreen.classList.add('hidden');
    if (appLoader) appLoader.classList.remove('hidden');
    
    startApp();
}

function startApp() {
    populateMonths();
    onSnapshot(query(transactionsCol, orderBy("date", "desc")), (snapshot) => {
        allData = [];
        snapshot.forEach(docSnap => {
            allData.push({ id: docSnap.id, ...docSnap.data() });
        });
        
        const loader = document.getElementById('app-loader');
        if (loader) loader.classList.add('hidden');
        
        updateAutocomplete(allData); 
        checkAndRepeatTransactions(allData);
        renderUI(allData);
    }, (error) => {
        console.error("Firebase Error:", error);
    });
}

function populateMonths() {
    const filter = document.getElementById('month-filter');
    if (!filter || filter.options.length > 0) return;
    const months = ["ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני", "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"];
    const current = new Date().getMonth();
    
    let optAll = document.createElement('option');
    optAll.value = "all"; optAll.innerText = "הכל מהתחלה";
    filter.appendChild(optAll);
    
    months.forEach((m, i) => {
        let opt = document.createElement('option');
        opt.value = i; opt.innerText = m;
        if (i === current) opt.selected = true;
        filter.appendChild(opt);
    });
}

// מאזינים לאירועים
const monthFilter = document.getElementById('month-filter');
if (monthFilter) monthFilter.onchange = () => renderUI(allData);

const searchInput = document.getElementById('search-input');
if (searchInput) searchInput.oninput = () => renderUI(allData);

const expBtn = document.getElementById('type-btn-expense');
const incBtn = document.getElementById('type-btn-income');

if (expBtn) {
    expBtn.onclick = function() {
        currentType = 'expense';
        this.classList.add('active');
        if (incBtn) incBtn.classList.remove('active');
    };
}
if (incBtn) {
    incBtn.onclick = function() {
        currentType = 'income';
        this.classList.add('active');
        if (expBtn) expBtn.classList.remove('active');
    };
}

const form = document.getElementById('transaction-form');
if (form) {
    form.onsubmit = async (e) => {
        e.preventDefault();
        const transactionData = {
            description: document.getElementById('transaction-name').value,
            amount: parseFloat(document.getElementById('transaction-amount').value),
            category: document.getElementById('transaction-category').value,
            type: currentType,
            recurring: document.getElementById('transaction-recurring').checked,
            date: editId ? allData.find(t => t.id === editId).date : Date.now()
        };
        
        if (editId) {
            await updateDoc(doc(db, "transactions", editId), transactionData);
            editId = null;
            document.querySelector('.btn-add').innerText = "הוסף תנועה";
        } else {
            await addDoc(transactionsCol, transactionData);
        }
        
        e.target.reset();
        currentType = 'expense';
        if (expBtn) expBtn.classList.add('active');
        if (incBtn) incBtn.classList.remove('active');
    };
}

function renderUI(data) {
    const filterEl = document.getElementById('month-filter');
    const searchEl = document.getElementById('search-input');
    const tbody = document.getElementById('transactions-body');
    
    if (!tbody || !filterEl) return;
    
    const selMonth = filterEl.value;
    const search = searchEl ? searchEl.value.toLowerCase() : "";
    
    tbody.innerHTML = '';
    let inc = 0, exp = 0;
    const catTotals = {};
    
    const filtered = data.filter(t => {
        const d = new Date(t.date);
        const mMatch = (selMonth === "all") || (d.getMonth() == selMonth);
        const sMatch = t.description.toLowerCase().includes(search);
        return mMatch && sMatch;
    });

    filtered.forEach(t => {
        if (t.type === 'income') {
            inc += t.amount;
        } else { 
            exp += t.amount; 
            catTotals[t.category] = (catTotals[t.category] || 0) + t.amount; 
        }
        
        const tr = document.createElement('tr');
        const color = (t.type === 'income') ? 'green' : 'red';
        const arrow = (t.type === 'income') ? '↑' : '↓';
        const dateStr = new Date(t.date).toLocaleDateString('he-IL');

        tr.innerHTML = `
            <td>${t.description} ${t.recurring ? '🔄' : ''}</td>
            <td>${t.category}</td>
            <td style="color:${color}">${arrow}</td>
            <td style="font-weight:bold">₪${t.amount.toLocaleString()}</td>
            <td>${dateStr}</td>
            <td>
                <button onclick="editTransaction('${t.id}')" style="background:none; border:none; cursor:pointer;">📝</button>
                <button onclick="deleteTransaction('${t.id}')" style="background:none; border:none; cursor:pointer;">🗑️</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
    
    const incEl = document.getElementById('total-income');
    const expEl = document.getElementById('total-expenses');
    const balEl = document.getElementById('balance');
    
    if (incEl) incEl.innerText = `₪${inc.toLocaleString()}`;
    if (expEl) expEl.innerText = `₪${exp.toLocaleString()}`;
    
    const balance = inc - exp;
    if (balEl) balEl.innerText = `₪${balance.toLocaleString()}`;
    
    updateChart(catTotals);
    updateSavingTarget(balance);
}

async function checkAndRepeatTransactions(data) {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    pendingRecurring = data.filter(t => t.recurring === true).filter(t => {
        const tDate = new Date(t.date);
        const isPast = (tDate.getMonth() !== currentMonth || tDate.getFullYear() !== currentYear);
        const alreadyExists = data.some(item => 
            item.description === t.description && 
            new Date(item.date).getMonth() === currentMonth &&
            new Date(item.date).getFullYear() === currentYear
        );
        return isPast && !alreadyExists;
    });
    
    const alertBox = document.getElementById('recurring-alert');
    if (alertBox) {
        if (pendingRecurring.length > 0) {
            const txt = document.getElementById('alert-text');
            if (txt) txt.innerText = `נמצאו ${pendingRecurring.length} תנועות קבועות מהחודש שעבר. להוסיף אותן?`;
            alertBox.classList.remove('hidden');
        } else {
            alertBox.classList.add('hidden');
        }
    }
}

const confirmRec = document.getElementById('confirm-recurring');
if (confirmRec) {
    confirmRec.onclick = async () => {
        for (const t of pendingRecurring) {
            const newData = { ...t, date: Date.now() };
            delete newData.id;
            await addDoc(transactionsCol, newData);
        }
        document.getElementById('recurring-alert').classList.add('hidden');
    };
}

const dismissRec = document.getElementById('dismiss-recurring');
if (dismissRec) {
    dismissRec.onclick = () => {
        document.getElementById('recurring-alert').classList.add('hidden');
    };
}

// פונקציות גלובליות לכפתורי הטבלה
window.editTransaction = (id) => {
    const t = allData.find(item => item.id === id);
    if (!t) return;
    document.getElementById('transaction-name').value = t.description;
    document.getElementById('transaction-amount').value = t.amount;
    document.getElementById('transaction-category').value = t.category;
    document.getElementById('transaction-recurring').checked = t.recurring || false;
    currentType = t.type;
    editId = id;
    document.querySelector('.btn-add').innerText = "עדכן תנועה";
    window.scrollTo({ top: 150, behavior: 'smooth' }); 
};

window.deleteTransaction = async (id) => {
    if(confirm("למחוק את התנועה?")) {
        await deleteDoc(doc(db, "transactions", id));
    }
};

function updateSavingTarget(balance) {
    const target = 2500;
    const pct = Math.min(Math.max((balance / target) * 100, 0), 100);
    const fill = document.getElementById('target-progress-fill');
    const txt = document.getElementById('target-percentage');
    if (fill) fill.style.width = pct + "%";
    if (txt) txt.innerText = Math.round(pct) + "%";
}

function updateChart(totals) {
    const chartCanvas = document.getElementById('pie-chart');
    if (!chartCanvas) return;
    const ctx = chartCanvas.getContext('2d');
    if (myChart) myChart.destroy();
    if (Object.keys(totals).length === 0) return;
    
    myChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(totals),
            datasets: [{ 
                data: Object.values(totals), 
                backgroundColor: ['#FFB7B2', '#B2E2F2', '#B2F2BB', '#F2E2B2', '#D1B2F2'] 
            }]
        }
    });
}

const cats = ["מזון", "בית", "חינוך", "פנאי", "רכב", "בריאות", "כרטיסי אשראי", "משכורת", "אחר"];
const catSelect = document.getElementById('transaction-category');
if (catSelect && catSelect.options.length === 0) {
    cats.forEach(c => {
        let o = document.createElement('option');
        o.value = c; o.innerText = c;
        catSelect.appendChild(o);
    });
}

function updateAutocomplete(data) {
    const list = document.getElementById('descriptions-list');
    if (!list) return;
    const uniqueNames = [...new Set(data.map(t => t.description))];
    list.innerHTML = uniqueNames.map(name => `<option value="${name}">`).join('');
}

// הפעלה
init();