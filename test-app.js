import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDK3oq5I-MHnjYGXkRBfUeYs3vw7zwB0gE",
    authDomain: "mymoneyapp-abb12.firebaseapp.com",
    projectId: "mymoneyapp-abb12",
    storageBucket: "mymoneyapp-abb12.firebasestorage.app",
    messagingSenderId: "728703755358",
    appId: "1:728703755358:web:e10f94bfc61ec631dcc0cf"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const transactionsCol = collection(db, "transactions");

let allData = [];
let myChart = null;
let currentType = 'expense';
let editId = null;
let chartType = 'doughnut';

// --- ניהול מודלים עם סגירה בלחיצה על הרקע ---
window.openModal = (id) => {
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.add('active');
        modal.onclick = (e) => { if (e.target === modal) closeModal(id); };
    }
};

window.closeModal = (id) => {
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.remove('active');
        if (id === 'modal-form') { document.getElementById('transaction-form').reset(); editId = null; }
    }
};

window.openVisionHub = () => openModal('modal-vision-hub');
window.showSpecificChart = (type) => {
    closeModal('modal-vision-hub');
    chartType = type;
    openModal('modal-single-chart');
    setTimeout(() => renderUI(allData), 300);
};
window.backToHub = () => { closeModal('modal-single-chart'); openModal('modal-vision-hub'); };

// --- אתחול ורינדור ---
function init() {
    setupCategories();
    onSnapshot(query(transactionsCol, orderBy("date", "desc")), (snapshot) => {
        allData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderUI(allData);
    });
}

function renderUI(data) {
    let inc = 0, exp = 0;
    const catTotals = {};
    const tbody = document.getElementById('transactions-body');
    if (tbody) tbody.innerHTML = '';

    data.forEach(t => {
        if (t.type === 'income') inc += t.amount;
        else {
            exp += t.amount;
            catTotals[t.category] = (catTotals[t.category] || 0) + t.amount;
        }
        // רינדור טבלה... (מקוצר לצורך המקום, נשאר כפי שהיה)
    });

    document.getElementById('total-income').innerText = `₪${inc.toLocaleString()}`;
    document.getElementById('total-expenses').innerText = `₪${exp.toLocaleString()}`;
    document.getElementById('balance').innerText = `₪${(inc - exp).toLocaleString()}`;

    renderChart(catTotals);
}

function renderChart(totals) {
    const canvas = document.getElementById('main-chart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (myChart) myChart.destroy();

    myChart = new Chart(ctx, {
        type: chartType,
        data: {
            labels: Object.keys(totals),
            datasets: [{
                label: 'סיכום הוצאות ב-₪',
                data: Object.values(totals),
                backgroundColor: chartType === 'doughnut' ? ['#002d4b', '#00c2cb', '#7d77b1', '#c5a059'] : '#00c2cb',
                borderColor: '#ffffff',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: {
                legend: { 
                    display: (chartType === 'doughnut'), // מציג מקרא רק בעוגה למניעת undefined
                    position: 'bottom', rtl: true 
                }
            },
            scales: chartType !== 'doughnut' ? { y: { beginAtZero: true, position: 'right' }, x: { reverse: true } } : {}
        }
    });
}

function setupCategories() {
    const cats = ["מזון", "בית", "חינוך", "פנאי", "רכב", "בריאות", "אשראי", "משכורת", "אחר"];
    const select = document.getElementById('transaction-category');
    if (select) cats.forEach(c => { const o = document.createElement('option'); o.value = c; o.innerText = c; select.appendChild(o); });
}

init();