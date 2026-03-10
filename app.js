import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// --- הגדרות Firebase (נשמר בדיוק כפי שהיה אצלך) ---
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

// --- משתנים גלובליים ---
let allData = [];
let myChart = null;
let currentType = 'expense';
let editId = null;

// --- פונקציות שליטה במודלים (Popups) ---
window.openModal = (id) => {
    document.getElementById(id).classList.add('active');
};

window.closeModal = (id) => {
    document.getElementById(id).classList.remove('active');
    if (id === 'modal-form') {
        document.getElementById('transaction-form').reset();
        editId = null;
    }
};

// חיבור כפתורים צפים
document.getElementById('open-form-btn').onclick = () => openModal('modal-form');
document.getElementById('open-table-btn').onclick = () => openModal('modal-table');

// לוגיקה לבחירת סוג תנועה בתוך המודל
const expBtn = document.getElementById('type-btn-expense');
const incBtn = document.getElementById('type-btn-income');

expBtn.onclick = () => {
    currentType = 'expense';
    expBtn.style.opacity = '1';
    incBtn.style.opacity = '0.5';
};

incBtn.onclick = () => {
    currentType = 'income';
    incBtn.style.opacity = '1';
    expBtn.style.opacity = '0.5';
};

// --- טעינת נתונים והפעלה ---
function init() {
    populateMonths();
    // האזנה לשינויים ב-Firebase בזמן אמת
    onSnapshot(query(transactionsCol, orderBy("date", "desc")), (snapshot) => {
        allData = [];
        snapshot.forEach(docSnap => {
            allData.push({ id: docSnap.id, ...docSnap.data() });
        });
        renderUI(allData);
    });
}

function populateMonths() {
    const filter = document.getElementById('month-filter');
    if (!filter || filter.options.length > 0) return;
    const months = ["ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני", "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"];
    const currentMonth = new Date().getMonth();
    
    let optAll = document.createElement('option');
    optAll.value = "all"; optAll.innerText = "הכל מהתחלה";
    filter.appendChild(optAll);
    
    months.forEach((m, i) => {
        let opt = document.createElement('option');
        opt.value = i; opt.innerText = m;
        if (i === currentMonth) opt.selected = true;
        filter.appendChild(opt);
    });
    filter.onchange = () => renderUI(allData);
}

// --- רינדור ממשק המשתמש ---
function renderUI(data) {
    const filterEl = document.getElementById('month-filter');
    const selMonth = filterEl.value;
    const tbody = document.getElementById('transactions-body');
    
    tbody.innerHTML = '';
    let inc = 0, exp = 0;
    const catTotals = {};

    const filtered = data.filter(t => {
        const d = new Date(t.date);
        return (selMonth === "all") || (d.getMonth() == selMonth);
    });

    filtered.forEach(t => {
        if (t.type === 'income') {
            inc += t.amount;
        } else {
            exp += t.amount;
            catTotals[t.category] = (catTotals[t.category] || 0) + t.amount;
        }

        const dateStr = new Date(t.date).toLocaleDateString('he-IL');
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${t.description} ${t.recurring ? '🔄' : ''}</td>
            <td>${t.category}</td>
            <td style="color: ${t.type === 'income' ? 'var(--more-teal)' : '#ff5a5f'}">
                ${t.type === 'income' ? '↑' : '↓'}
            </td>
            <td style="font-weight:bold">₪${t.amount.toLocaleString()}</td>
            <td>${dateStr}</td>
            <td>
                <button onclick="editTransaction('${t.id}')" style="background:none; border:none; cursor:pointer;">📝</button>
                <button onclick="deleteTransaction('${t.id}')" style="background:none; border:none; cursor:pointer;">🗑️</button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    // עדכון כרטיסי סיכום
    document.getElementById('total-income').innerText = `₪${inc.toLocaleString()}`;
    document.getElementById('total-expenses').innerText = `₪${exp.toLocaleString()}`;
    document.getElementById('balance').innerText = `₪${(inc - exp).toLocaleString()}`;

    renderChart(catTotals);
}

// --- גרף Doughnut מעוצב ---
function renderChart(totals) {
    const ctx = document.getElementById('pie-chart').getContext('2d');
    if (myChart) myChart.destroy();
    if (Object.keys(totals).length === 0) return;

    myChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(totals),
            datasets: [{
                data: Object.values(totals),
                backgroundColor: ['#002d4b', '#00c2cb', '#7d77b1', '#c5a059', '#a5b4fc'],
                borderWidth: 2,
                borderColor: '#f0f7ff'
            }]
        },
        options: {
            cutout: '75%',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom', labels: { color: '#002d4b', font: { family: 'Rubik', size: 10 } } }
            }
        }
    });
}

// --- שמירה ועדכון נתונים ---
document.getElementById('transaction-form').onsubmit = async (e) => {
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
    } else {
        await addDoc(transactionsCol, transactionData);
    }

    closeModal('modal-form');
    e.target.reset();
};

// --- פונקציות גלובליות ---
window.deleteTransaction = async (id) => {
    if (confirm("למחוק את התנועה?")) {
        await deleteDoc(doc(db, "transactions", id));
    }
};

window.editTransaction = (id) => {
    const t = allData.find(item => item.id === id);
    if (!t) return;
    
    // סוגר מודל רשימה ופותח מודל טופס
    closeModal('modal-table');
    openModal('modal-form');

    document.getElementById('transaction-name').value = t.description;
    document.getElementById('transaction-amount').value = t.amount;
    document.getElementById('transaction-category').value = t.category;
    document.getElementById('transaction-recurring').checked = t.recurring || false;
    
    currentType = t.type;
    if (currentType === 'income') incBtn.click(); else expBtn.click();
    editId = id;
};

// מילוי קטגוריות
const cats = ["מזון", "בית", "חינוך", "פנאי", "רכב", "בריאות", "אשראי", "משכורת", "אחר"];
const catSelect = document.getElementById('transaction-category');
cats.forEach(c => {
    let o = document.createElement('option');
    o.value = c; o.innerText = c;
    catSelect.appendChild(o);
});

init();