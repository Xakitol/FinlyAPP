import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, signInWithRedirect, getRedirectResult, GoogleAuthProvider, onAuthStateChanged, signOut, setPersistence, browserLocalPersistence } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

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
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const transactionsCol = collection(db, "transactions");

const allowedUsers = ["matantoledano18@gmail.com"]; 

setPersistence(auth, browserLocalPersistence);

let currentType = 'expense';
let allData = [];
let myChart = null;
let editId = null;
let pendingRecurring = [];

// פונקציית ניהול טיימר - הגדלנו ל-5 דקות לבדיקה
function isSessionExpired() {
    const lastActive = localStorage.getItem('lastActiveTime');
    if (!lastActive) return false; 

    const now = Date.now();
    const timeoutLimit = 5 * 60 * 1000; // 5 דקות
    const diff = now - lastActive;
    
    console.log("זמן שעבר מאז פעילות אחרונה (בשניות):", diff / 1000);
    
    return (diff > timeoutLimit);
}

// לוגיקת התחברות
document.getElementById('google-login-btn').onclick = () => {
    localStorage.setItem('lastActiveTime', Date.now());
    signInWithRedirect(auth, provider);
};

// טיפול בחזרה מהתחברות
getRedirectResult(auth).then(async (result) => {
    if (result && result.user) {
        console.log("חזרנו מגוגל בהצלחה עם המשתמש:", result.user.email);
        if (allowedUsers.includes(result.user.email)) {
            localStorage.setItem('lastActiveTime', Date.now());
        } else {
            await signOut(auth);
            document.getElementById('login-error').style.display = 'block';
        }
    }
}).catch((error) => {
    console.error("שגיאה בחזרה מגוגל:", error);
});

// ניהול מצב משתמש
onAuthStateChanged(auth, async (user) => {
    const authScreen = document.getElementById('auth-screen');
    const appLoader = document.getElementById('app-loader');
    
    const expired = isSessionExpired();

    if (user && allowedUsers.includes(user.email)) {
        if (!expired) {
            console.log("הכל תקין, נכנסים לאפליקציה");
            authScreen.classList.add('hidden');
            appLoader.classList.remove('hidden');
            startApp(); 
        } else {
            console.log("הזמן פקע - מוציאים את המשתמש");
            await signOut(auth);
            authScreen.classList.remove('hidden');
            appLoader.classList.add('hidden');
        }
    } else {
        console.log("אין משתמש מחובר או מייל לא מורשה");
        authScreen.classList.remove('hidden');
        appLoader.classList.add('hidden');
    }
});

// עדכון טיימר
const resetTimer = () => {
    if (auth.currentUser) {
        localStorage.setItem('lastActiveTime', Date.now());
    }
};
window.addEventListener('mousedown', resetTimer);
window.addEventListener('keydown', resetTimer);

function startApp() {
    populateMonths();
    onSnapshot(query(transactionsCol, orderBy("date", "desc")), (snapshot) => {
        allData = [];
        snapshot.forEach(doc => allData.push({ id: doc.id, ...doc.data() }));
        document.getElementById('app-loader').classList.add('hidden');
        updateAutocomplete(allData); 
        checkAndRepeatTransactions(allData);
        renderUI(allData);
    }, (error) => {
        console.error("Firebase Error:", error);
    });
}

// שאר הפונקציות (populateMonths, renderUI וכו') נשארות אותו דבר...
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
};

function renderUI(data) {
    const selMonth = document.getElementById('month-filter').value;
    const search = document.getElementById('search-input').value.toLowerCase();
    const tbody = document.getElementById('transactions-body');
    if (!tbody) return;
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
            <td>${t.description} ${t.recurring ? '🔄' : ''}</td>
            <td>${t.category}</td>
            <td style="color:${t.type === 'income' ? 'green' : 'red'}">${t.type === 'income' ? '↑' : '↓'}</td>
            <td style="font-weight:bold">₪${t.amount.toLocaleString()}</td>
            <td>${new Date(t.date).toLocaleDateString('he-IL')}</td>
            <td>
                <button onclick="editTransaction('${t.id}')" style="background:none; border:none; cursor:pointer; font-size:1.2rem;">📝</button>
                <button onclick="deleteTransaction('${t.id}')" style="background:none; border:none; cursor:pointer; font-size:1.2rem;">🗑️</button>
            </td>
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
    if (pendingRecurring.length > 0) {
        document.getElementById('alert-text').innerText = `נמצאו ${pendingRecurring.length} תנועות קבועות מהחודש שעבר. להוסיף אותן?`;
        alertBox.classList.remove('hidden');
    } else {
        alertBox.classList.add('hidden');
    }
}

document.getElementById('confirm-recurring').onclick = async () => {
    for (const t of pendingRecurring) {
        const newData = { ...t, date: Date.now() };
        delete newData.id;
        await addDoc(transactionsCol, newData);
    }
    document.getElementById('recurring-alert').classList.add('hidden');
};

document.getElementById('dismiss-recurring').onclick = () => {
    document.getElementById('recurring-alert').classList.add('hidden');
};

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
    if(confirm("למחוק?")) await deleteDoc(doc(db, "transactions", id));
};

function updateSavingTarget(balance) {
    const target = 2500;
    const pct = Math.min(Math.max((balance / target) * 100, 0), 100);
    document.getElementById('target-progress-fill').style.width = pct + "%";
    document.getElementById('target-percentage').innerText = Math.round(pct) + "%";
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
            datasets: [{ data: Object.values(totals), backgroundColor: ['#FFB7B2', '#B2E2F2', '#B2F2BB', '#F2E2B2', '#D1B2F2'] }]
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

document.getElementById('transaction-name').addEventListener('input', (e) => {
    const val = e.target.value;
    const match = allData.find(t => t.description === val);
    if (match) {
        document.getElementById('transaction-category').value = match.category;
        currentType = match.type;
        if (currentType === 'income') {
            document.getElementById('type-btn-income').classList.add('active');
            document.getElementById('type-btn-expense').classList.remove('active');
        } else {
            document.getElementById('type-btn-expense').classList.add('active');
            document.getElementById('type-btn-income').classList.remove('active');
        }
    }
});