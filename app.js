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
let allData = [];
let myChart = null;

function populateMonths() {
    const months = ["ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני", "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"];
    const filter = document.getElementById('month-filter');
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
populateMonths();

document.getElementById('month-filter').onchange = () => renderUI(allData);
document.getElementById('search-input').oninput = () => renderUI(allData);

document.getElementById('type-btn-expense').onclick = function() {
    currentType = 'expense'; this.classList.add('active');
    document.getElementById('type-btn-income').classList.remove('active');
};
document.getElementById('type-btn-income').onclick = function() {
    currentType = 'income'; this.classList.add('active');
    document.getElementById('type-btn-expense').classList.remove('active');
};

document.getElementById('transaction-form').onsubmit = async (e) => {
    e.preventDefault();
    await addDoc(transactionsCol, {
        description: document.getElementById('transaction-name').value,
        amount: parseFloat(document.getElementById('transaction-amount').value),
        category: document.getElementById('transaction-category').value,
        type: currentType,
        date: Date.now()
    });
    e.target.reset();
};

onSnapshot(query(transactionsCol, orderBy("date", "desc")), (snapshot) => {
    allData = [];
    snapshot.forEach(doc => allData.push({ id: doc.id, ...doc.data() }));
    document.getElementById('app-loader').classList.add('hidden');
    renderUI(allData);
});

function renderUI(data) {
    const selMonth = document.getElementById('month-filter').value;
    const search = document.getElementById('search-input').value.toLowerCase();
    const tbody = document.getElementById('transactions-body');
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
        if (t.type === 'income') inc += t.amount;
        else { 
            exp += t.amount; 
            catTotals[t.category] = (catTotals[t.category] || 0) + t.amount; 
        }

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${t.description}</td>
            <td>${t.category}</td>
            <td style="color:${t.type === 'income' ? 'green' : 'red'}">${t.type === 'income' ? '↑' : '↓'}</td>
            <td style="font-weight:bold">₪${t.amount.toLocaleString()}</td>
            <td>${new Date(t.date).toLocaleDateString('he-IL')}</td>
            <td><button onclick="deleteTransaction('${t.id}')">🗑️</button></td>
        `;
        tbody.appendChild(tr);
    });

    document.getElementById('total-income').innerText = `₪${inc.toLocaleString()}`;
    document.getElementById('total-expenses').innerText = `₪${exp.toLocaleString()}`;
    const balance = inc - exp;
    document.getElementById('balance').innerText = `₪${balance.toLocaleString()}`;
    
    updateChart(catTotals);
    updateSavingTarget(balance);
}

function updateSavingTarget(balance) {
    const target = 2500;
    const pct = Math.min(Math.max((balance / target) * 100, 0), 100);
    document.getElementById('target-progress-fill').style.width = pct + "%";
    document.getElementById('target-percentage').innerText = Math.round(pct) + "%";
    document.getElementById('target-message').innerText = balance >= target ? "הגעתם ליעד! 🏆" : "ממשיכים לחסוך...";
}

window.deleteTransaction = async (id) => {
    if(confirm("למחוק?")) await deleteDoc(doc(db, "transactions", id));
};

function updateChart(totals) {
    const ctx = document.getElementById('pie-chart').getContext('2d');
    if (myChart) myChart.destroy();
    if (Object.keys(totals).length === 0) return;
    myChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(totals),
            datasets: [{ data: Object.values(totals), backgroundColor: ['#FFB7B2', '#B2E2F2', '#B2F2BB', '#F2E2B2'] }]
        }
    });
}

const cats = ["מזון", "בית", "חינוך", "פנאי", "רכב", "בריאות", "משכורת", "אחר"];
cats.forEach(c => {
    let o = document.createElement('option');
    o.value = c; o.innerText = c;
    document.getElementById('transaction-category').appendChild(o);
});