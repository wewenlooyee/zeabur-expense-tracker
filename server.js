// 引入必要的模組
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
// 解析 JSON 格式的請求
app.use(express.json());
// 提供 public 目錄下的靜態檔案 (前端畫面)
app.use(express.static(path.join(__dirname, 'public')));

// === 資料庫設定 (SQLite) ===
// 在同目錄下自動產生 database.sqlite 檔案作為資料庫
const db = new sqlite3.Database('./database.sqlite', (err) => {
    if (err) {
        console.error('資料庫連接失敗:', err.message);
    } else {
        console.log('成功連接 SQLite 資料庫。');
        // 初始化資料表
        db.run(`CREATE TABLE IF NOT EXISTS expenses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT,
            type TEXT,
            category TEXT,
            amount REAL,
            note TEXT
        )`);
    }
});

// === API 路由設定 ===

// 1. 取得所有紀錄 (Read)
app.get('/api/expenses', (req, res) => {
    db.all("SELECT * FROM expenses ORDER BY date DESC", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// 2. 新增紀錄 (Create)
app.post('/api/expenses', (req, res) => {
    const { date, type, category, amount, note } = req.body;
    const sql = `INSERT INTO expenses (date, type, category, amount, note) VALUES (?, ?, ?, ?, ?)`;
    db.run(sql, [date, type, category, amount, note], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID, date, type, category, amount, note });
    });
});

// 3. 刪除紀錄 (Delete)
app.delete('/api/expenses/:id', (req, res) => {
    const id = req.params.id;
    db.run(`DELETE FROM expenses WHERE id = ?`, id, function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "刪除成功", deletedID: id });
    });
});

// === 伺服器啟動設定 ===
// 關鍵：使用 process.env.PORT 讓 Zeabur 動態分配 Port，本地端開發則預設使用 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`伺服器已啟動，正在監聽 Port ${PORT}`);
});