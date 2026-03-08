const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 900,
    title: "ניהול כלכלי - משפחת טולדנו",
    icon: path.join(__dirname, 'icon.ico'), // אופציונלי: שים קובץ אייקון בתיקייה
    webPreferences: {
      nodeIntegration: false // אבטחה טובה יותר
    }
  });

  win.loadFile('index.html');
  win.setMenu(null); // מסיר את שורת התפריטים העליונה למראה נקי
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});