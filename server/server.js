const express = require('express');
const mongoose = require('mongoose');
const mysql = require('mysql2/promise');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// --- Database Connections ---
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/expenseTracker';
const jwtSecret = process.env.JWT_SECRET || 'supersecretkey';

mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB error:', err));

// MySQL connection pool singleton
let pool;
const getPool = async () => {
    if (pool) return pool;
    try {
        pool = await mysql.createPool({
            host: process.env.MYSQL_HOST || 'localhost',
            user: process.env.MYSQL_USER || 'root',
            password: process.env.MYSQL_PASSWORD || '',
            database: process.env.MYSQL_DB || 'dailyexpense',
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
            ssl: process.env.MYSQL_SSL ? JSON.parse(process.env.MYSQL_SSL) : undefined
        });
        console.log('MySQL Pool Created Successfuly');
        return pool;
    } catch (err) {
        console.error('MySQL init error:', err);
        throw new Error('Database connection failed. Check your environment variables.');
    }
};

const crypto = require('crypto');

// --- MongoDB Models ---
const ExpenseSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    title: { type: String, required: true },
    amount: { type: Number, required: true },
    category: { type: String, required: true },
    date: { type: Date, default: Date.now },
    type: { type: String, enum: ['income', 'expense'], default: 'expense' },
    currency: { type: String, default: 'USD' },
    hash: { type: String } // Blockchain transaction hash
});
const Expense = mongoose.model('Expense', ExpenseSchema);

// Helper for hashing
const generateHash = (data) => {
    return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
};

// --- Middleware ---
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, jwtSecret, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

app.post('/api/auth/register', async (req, res) => {
    const { firstname, lastname, email, password } = req.body;
    try {
        const db = await getPool();
        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await db.execute(
            'INSERT INTO users (firstname, lastname, email, password) VALUES (?, ?, ?, ?)',
            [firstname, lastname, email, hashedPassword]
        );
        res.status(201).json({ message: 'User registered', userId: result.insertId });
    } catch (err) {
        console.error('Register Error:', err);
        res.status(500).json({ error: "Failed to register. " + err.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const db = await getPool();
        const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length === 0) return res.status(401).json({ message: 'Invalid credentials' });
        
        const user = rows[0];
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(401).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: user.user_id, email: user.email }, jwtSecret);
        res.json({ token, user: { id: user.user_id, name: `${user.firstname} ${user.lastname}`, email: user.email } });
    } catch (err) {
        console.error('Login Error:', err);
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/auth/leaderboard/opt-in', authenticateToken, async (req, res) => {
    const { optIn } = req.body;
    try {
        const db = await getPool();
        await db.execute('UPDATE users SET optInLeaderboard = ? WHERE user_id = ?', [optIn ? 1 : 0, req.user.id]);
        res.json({ message: 'Preference updated' });
    } catch (err) {
        console.error('Opt-in Error:', err);
        res.status(500).json({ error: err.message });
    }
});

// --- Expense Routes (MongoDB) ---
app.get('/api/expenses', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id.toString();
        // Match both string and numeric userId for backward compatibility
        const expenses = await Expense.find({ userId: { $in: [userId, parseInt(userId)] } }).sort({ date: -1 });
        console.log(`[GET /api/expenses] Found ${expenses.length} records for user: ${userId}`);
        res.json(expenses);
    } catch (err) {
        console.error("[GET /api/expenses] Error:", err);
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/expenses', authenticateToken, async (req, res) => {
    const { title, amount, category, date, type, currency } = req.body;
    try {
        const transData = { userId: String(req.user.id), title, amount, category, date: date || new Date(), type: type || 'expense', currency: currency || 'USD' };
        const newExpense = new Expense({
            ...transData,
            hash: generateHash({ ...transData, timestamp: Date.now() }) 
        });
        await newExpense.save();
        res.status(201).json(newExpense);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/stats', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id.toString();
        const numericId = parseInt(userId);
        
        console.log(`[GET /api/stats] Fetching for userId: ${userId} (${numericId})`);

        const totals = await Expense.aggregate([
            { $match: { userId: { $in: [userId, numericId] } } },
            { $group: {
                _id: null,
                totalIncome: { $sum: { $cond: [{ $eq: ["$type", "income"] }, "$amount", 0] } },
                totalExpense: { $sum: { $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0] } }
            }}
        ]);

        const categoryWise = await Expense.aggregate([
            { $match: { userId: { $in: [userId, numericId] } } },
            { $group: {
                _id: '$category',
                total: { $sum: '$amount' }
            }}
        ]);

        console.log(`[GET /api/stats] Calculated income: ${totals[0]?.totalIncome || 0}, expense: ${totals[0]?.totalExpense || 0}`);

        res.json({
            categoryWise,
            totalIncome: totals[0]?.totalIncome || 0,
            totalExpense: totals[0]?.totalExpense || 0
        });
    } catch (err) {
        console.error("[GET /api/stats] Error:", err);
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/expenses/:id', authenticateToken, async (req, res) => {
    try {
        const result = await Expense.findOneAndDelete({ _id: req.params.id, userId: req.user.id.toString() });
        if (!result) return res.status(404).json({ message: 'Transaction not found' });
        res.json({ message: 'Transaction deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/monthly-stats', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const monthlyStats = await Expense.aggregate([
            { $match: { userId: userId.toString() } },
            { $group: {
                _id: { 
                    month: { $month: "$date" },
                    year: { $year: "$date" },
                    type: "$type"
                },
                total: { $sum: "$amount" }
            }},
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);
        res.json(monthlyStats);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// --- Leaderboard Routes ---
app.get('/api/leaderboard', async (req, res) => {
    try {
        const db = await getPool();
        const [users] = await db.query('SELECT user_id AS id, firstname FROM users WHERE optInLeaderboard = 1');
        const leaderboard = [];
 
        for (const user of users) {
            const stats = await Expense.aggregate([
                { $match: { userId: user.id.toString() } },
                { $group: { 
                    _id: null, 
                    totalIncome: { $sum: { $cond: [{ $eq: ["$type", "income"] }, "$amount", 0] } },
                    totalExpense: { $sum: { $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0] } }
                }}
            ]);
 
            const s = stats[0] || { totalIncome: 0, totalExpense: 0 };
            const savingPercent = s.totalIncome > 0 ? ((s.totalIncome - s.totalExpense) / s.totalIncome) * 100 : 0;
            
            leaderboard.push({
                name: user.firstname,
                savingPercent: Math.max(0, savingPercent).toFixed(2)
            });
        }
 
        res.json(leaderboard.sort((a, b) => b.savingPercent - a.savingPercent));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/debug', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id.toString();
        const count = await Expense.countDocuments({ userId: userId });
        const sample = await Expense.findOne({ userId: userId });
        const allSample = await Expense.findOne({});
        
        res.json({
            loggedInUserId: userId,
            matchCount: count,
            sampleForUser: sample,
            anySampleInDb: allSample
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 5001;
if (require.main === module) {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
