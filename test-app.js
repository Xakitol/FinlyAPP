import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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

let allData = [];
let myChart = null;
let currentType = 'expense';
let editId = null;
let chartType = 'doughnut'; 

// --- ניהול מודלים (Vision & Standard) ---
window.openModal = (id) => {
    const modal = document.getElementById(id);
    if (modal) modal.classList.add('active');
};

window.closeModal = (id) => {
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.remove('active');
        if (id === 'modal-form') {
            document.getElementById('transaction-form').reset();
            editId = null;
        }
    }
};

// לוגיקת ה-Vision (גרפים בפופ-אפ)
window.openVisionHub = () => openModal('modal-vision-hub');

window.showSpecificChart = (type) => {
    // 1. סגור את תפריט הבחירה
    closeModal('modal-vision-hub');
    
    // 2. עדכן את סוג הגרף
    chartType = type;
    
    // 3. פתח את המודל של הגרף הבודד
    openModal('modal-single-chart');
    
    // 4. חשוב: תן לדפדפן רגע לרנדר את המודל לפני שמציירים את הגרף
    setTimeout(() => {
        renderUI(allData); // זה יריץ את renderChart על ה-Canvas הנכון
    }, 100);
};

window.backToHub = () => {
    closeModal('modal-single-chart');
    openModal('modal-vision-hub');
};

// שינוי סוג גרף (פנימי)
window.changeChartType = (type) => {
    chartType = type;
    renderUI(allData);
};

// --- טעינה ואתחול ---
function init() {
    populateMonths();
    setupTypeSelector();
    setupCategories();
    
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

// --- רינדור ממשק ---
function renderUI(data) {
    const filterEl = document.getElementById('month-filter');
    const selMonth = filterEl ? filterEl.value : "all";
    const tbody = document.getElementById('transactions-body');
    
    if (tbody) tbody.innerHTML = '';
    let inc = 0, exp = 0;
    const catTotals = {};
    const detailedList = {}; 

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
            if (!detailedList[t.category]) detailedList[t.category] = [];
            detailedList[t.category].push(`${t.description}: ₪${t.amount.toLocaleString()}`);
        }

        if (tbody) {
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
        }
    });

    document.getElementById('total-income').innerText = `₪${inc.toLocaleString()}`;
    document.getElementById('total-expenses').innerText = `₪${exp.toLocaleString()}`;
    const balanceEl = document.getElementById('balance');
    const balance = inc - exp;
    balanceEl.innerText = `₪${balance.toLocaleString()}`;
    balanceEl.style.color = balance >= 0 ? 'var(--more-navy)' : '#ff5a5f';

    renderChart(catTotals, detailedList);
}

// --- גרפיקה (Chart.js) ---
function renderChart(totals, details) {
    const canvas = document.getElementById('main-chart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    if (myChart) myChart.destroy();
    if (Object.keys(totals).length === 0) return;

    myChart = new Chart(ctx, {
        type: chartType,
        data: {
            labels: Object.keys(totals),
            datasets: [{
                data: Object.values(totals),
                backgroundColor: ['#002d4b', '#00c2cb', '#7d77b1', '#c5a059', '#a5b4fc', '#4ade80', '#fb923c'],
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            cutout: chartType === 'doughnut' ? '70%' : 0,
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom', rtl: true, labels: { font: { family: 'Rubik' } } },
                tooltip: {
                    rtl: true,
                    callbacks: {
                        label: (ctx) => ` סה"כ: ₪${ctx.raw.toLocaleString()}`,
                        afterBody: (ctx) => {
                            const cat = ctx[0].label;
                            return details[cat] ? ["", "פירוט:", ...details[cat]] : [];
                        }
                    }
                }
            }
        }
    });
}

// --- פעולות (שמירה, מחיקה, עריכה) ---
document.getElementById('transaction-form').onsubmit = async (e) => {
    e.preventDefault();
    const transactionData = {
        description: document.getElementById('transaction-name').value,
        amount: parseFloat(document.getElementById('transaction-amount').value),
        category: document.getElementById('transaction-category').value,
        type: currentType,
        recurring: false, // פשטנו לבינתיים
        date: editId ? allData.find(t => t.id === editId).date : Date.now()
    };

    try {
        if (editId) {
            await updateDoc(doc(db, "transactions", editId), transactionData);
        } else {
            await addDoc(transactionsCol, transactionData);
        }
        closeModal('modal-form');
    } catch (e) { console.error(e); }
};

window.deleteTransaction = async (id) => {
    if (confirm("למחוק?")) await deleteDoc(doc(db, "transactions", id));
};

window.editTransaction = (id) => {
    const t = allData.find(item => item.id === id);
    if (!t) return;
    closeModal('modal-table');
    openModal('modal-form');
    document.getElementById('transaction-name').value = t.description;
    document.getElementById('transaction-amount').value = t.amount;
    document.getElementById('transaction-category').value = t.category;
    currentType = t.type;
    editId = id;
};

// --- עזרים (Selectors) ---
function setupTypeSelector() {
    const expBtn = document.getElementById('type-btn-expense');
    const incBtn = document.getElementById('type-btn-income');
    if (expBtn && incBtn) {
        expBtn.onclick = () => { currentType = 'expense'; expBtn.classList.add('active'); incBtn.classList.remove('active'); };
        incBtn.onclick = () => { currentType = 'income'; incBtn.classList.add('active'); expBtn.classList.remove('active'); };
    }
}

function setupCategories() {
    const cats = ["מזון", "בית", "חינוך", "פנאי", "רכב", "בריאות", "אשראי", "משכורת", "אחר"];
    const catSelect = document.getElementById('transaction-category');
    if (catSelect) {
        catSelect.innerHTML = '';
        cats.forEach(c => {
            let o = document.createElement('option');
            o.value = c; o.innerText = c;
            catSelect.appendChild(o);
        });
    }
}

// אנימציית הדמות
document.addEventListener('mousemove', (e) => {
    const mascotImg = document.querySelector('.mascot-image');
    if (!mascotImg) return;
    const moveX = (e.clientX - window.innerWidth/2) / (window.innerWidth/2);
    const moveY = (e.clientY - window.innerHeight/2) / (window.innerHeight/2);
    mascotImg.style.transform = `rotateX(${moveY * -15}deg) rotateY(${moveX * 15}deg) scale(1.05)`;
});

init();