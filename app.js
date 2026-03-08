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

// --- חיבור כפתורי ה-Puffy מהעיצוב החדש ---
const btnExpense = document.getElementById('type-btn-expense');
const btnIncome = document.getElementById('type-btn-income');

btnExpense.onclick = () => {
    currentType = 'expense';
    btnExpense.classList.add('active');
    btnIncome.classList.remove('active');
};

btnIncome.onclick = () => {
    currentType = 'income';
    btnIncome.classList.add('active');
    btnExpense.classList.remove('active');
};

// --- הוספת תנועה לענן ---
document.getElementById('transaction-form').onsubmit = async (e) => {
    e.preventDefault();
    const nameInput = document.getElementById('transaction-name');
    const amountInput = document.getElementById('transaction-amount');
    const categoryInput = document.getElementById('transaction-category');

    if (nameInput.value && amountInput.value) {
        await addDoc(transactionsCol, {
            description: nameInput.value,
            amount: parseFloat(amountInput.value),
            category: categoryInput.value || "כללי",
            type: currentType,
            date: Date.now()
        });
        nameInput.value = '';
        amountInput.value = '';
    }
};

// --- האזנה לנתונים והעלמת מסך הטעינה ---
onSnapshot(query(transactionsCol, orderBy("date", "desc")), (snapshot) => {
    const transactions = [];
    snapshot.forEach(doc => transactions.push({ id: doc.id, ...doc.data() }));
    
    // הסתרת מסך הטעינה ברגע שהנתונים מגיעים
    document.getElementById('app-loader').classList.add('hidden');
    renderUI(transactions);
});

function renderUI(data) {
    const tbody = document.getElementById('transactions-body');
    tbody.innerHTML = '';
    let inc = 0, exp = 0;
    const catTotals = {};

    data.forEach((t, index) => {
        if (t.type === 'income') inc += t.amount;
        else {
            exp += t.amount;
            catTotals[t.category] = (catTotals[t.category] || 0) + t.amount;
        }

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${index + 1}</td>
            <td>${t.description}</td>
            <td><span class="badge">${t.category}</span></td>
            <td><span class="badge ${t.type === 'income' ? 'badge-income' : 'badge-expense'}">${t.type === 'income' ? '↑ הכנסה' : '↓ הוצאה'}</span></td>
            <td class="${t.type === 'income' ? 'amount-income' : 'amount-expense'}">₪${t.amount.toLocaleString()}</td>
            <td class="date-cell">${new Date(t.date).toLocaleDateString('he-IL')}</td>
            <td><button class="btn-delete" onclick="deleteTransaction('${t.id}')">🗑️</button></td>
        `;
        tbody.appendChild(tr);
    });

    // עדכון כרטיסיות סיכום
    document.getElementById('total-income').innerText = `₪${inc.toLocaleString()}`;
    document.getElementById('total-expenses').innerText = `₪${exp.toLocaleString()}`;
    document.getElementById('balance').innerText = `₪${(inc - exp).toLocaleString()}`;
    
    // הסתרת/הצגת הודעת "אין נתונים"
    document.getElementById('empty-state').style.display = data.length ? 'none' : 'flex';

    updateChart(catTotals);
}

// --- מצב לילה ---
const darkModeBtn = document.getElementById('dark-mode-btn');
if (localStorage.getItem('darkMode') === 'on') {
    document.body.classList.add('dark-mode');
    darkModeBtn.textContent = '☀️';
}
darkModeBtn.addEventListener('click', () => {
    const isDark = document.body.classList.toggle('dark-mode');
    darkModeBtn.textContent = isDark ? '☀️' : '🌙';
    localStorage.setItem('darkMode', isDark ? 'on' : 'off');
});

// פונקציית מחיקה גלובלית
window.deleteTransaction = async (id) => {
    if(confirm("למחוק תנועה זו?")) {
        await deleteDoc(doc(db, "transactions", id));
    }
};

function updateChart(totals) {
    const ctx = document.getElementById('pie-chart').getContext('2d');
    if (myChart) myChart.destroy();
    if (Object.keys(totals).length === 0) {
        document.getElementById('chart-empty-msg').style.display = 'block';
        return;
    }
    document.getElementById('chart-empty-msg').style.display = 'none';
    myChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(totals),
            datasets: [{
                data: Object.values(totals),
                backgroundColor: ['#FFB7B2', '#B2E2F2', '#B2F2BB', '#F2E2B2', '#D9B2F2']
            }]
        },
        options: { plugins: { legend: { position: 'bottom' } } }
    });
}