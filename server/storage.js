const mysql = require('mysql2/promise');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const DATA_DIR = process.env.VERCEL ? path.join('/tmp', 'fintrack_data') : path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'fintrack_db.json');

// Mongoose Expense Schema
const ExpenseSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    title: { type: String, required: true },
    amount: { type: Number, required: true },
    category: { type: String, required: true },
    date: { type: Date, default: Date.now },
    type: { type: String, enum: ['income', 'expense'], default: 'expense' },
    currency: { type: String, default: 'USD' },
    units: { type: Number, default: 0 },
    hash: { type: String }
});
const MongoExpense = mongoose.models.Expense || mongoose.model('Expense', ExpenseSchema);

const generateHash = (data) => {
    return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
};

class StorageManager {
    constructor() {
        this.useMySQL = false;
        this.useMongoDB = false;
        this.mysqlPool = null;
        this.initLocalStore();
    }

    initLocalStore() {
        if (!fs.existsSync(DATA_DIR)) {
            fs.mkdirSync(DATA_DIR, { recursive: true });
        }

        if (!fs.existsSync(DB_FILE)) {
            const demoHash = bcrypt.hashSync('password123', 10);
            const now = new Date();
            const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 15);
            const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 10);

            const initialData = {
                users: [
                    {
                        user_id: 1,
                        firstname: 'Alex',
                        lastname: 'Morgan',
                        email: 'demo@fintrack.com',
                        password: demoHash,
                        optInLeaderboard: 1
                    },
                    {
                        user_id: 2,
                        firstname: 'Sarah',
                        lastname: 'Connor',
                        email: 'sarah@fintrack.com',
                        password: demoHash,
                        optInLeaderboard: 1
                    }
                ],
                expenses: [
                    {
                        _id: crypto.randomBytes(12).toString('hex'),
                        userId: '1',
                        title: 'Monthly Salary',
                        amount: 5200,
                        category: 'Salary',
                        date: new Date(now.getFullYear(), now.getMonth(), 1).toISOString(),
                        type: 'income',
                        currency: 'USD',
                        units: 0,
                        hash: crypto.randomBytes(32).toString('hex')
                    },
                    {
                        _id: crypto.randomBytes(12).toString('hex'),
                        userId: '1',
                        title: 'Apartment Rent',
                        amount: 1400,
                        category: 'Rent',
                        date: new Date(now.getFullYear(), now.getMonth(), 3).toISOString(),
                        type: 'expense',
                        currency: 'USD',
                        units: 0,
                        hash: crypto.randomBytes(32).toString('hex')
                    },
                    {
                        _id: crypto.randomBytes(12).toString('hex'),
                        userId: '1',
                        title: 'Supermarket Groceries',
                        amount: 340,
                        category: 'Food',
                        date: new Date(now.getFullYear(), now.getMonth(), 6).toISOString(),
                        type: 'expense',
                        currency: 'USD',
                        units: 0,
                        hash: crypto.randomBytes(32).toString('hex')
                    },
                    {
                        _id: crypto.randomBytes(12).toString('hex'),
                        userId: '1',
                        title: 'Invested in PAX GOLD',
                        amount: 595,
                        category: 'Gold',
                        date: new Date(now.getFullYear(), now.getMonth(), 8).toISOString(),
                        type: 'expense',
                        currency: 'USD',
                        units: 0.25,
                        hash: crypto.randomBytes(32).toString('hex')
                    },
                    {
                        _id: crypto.randomBytes(12).toString('hex'),
                        userId: '1',
                        title: 'Invested in BITCOIN',
                        amount: 450,
                        category: 'Crypto',
                        date: new Date(now.getFullYear(), now.getMonth(), 10).toISOString(),
                        type: 'expense',
                        currency: 'USD',
                        units: 0.0055,
                        hash: crypto.randomBytes(32).toString('hex')
                    },
                    {
                        _id: crypto.randomBytes(12).toString('hex'),
                        userId: '1',
                        title: 'Tech Gadgets & Cloud',
                        amount: 180,
                        category: 'Entertainment',
                        date: new Date(now.getFullYear(), now.getMonth(), 12).toISOString(),
                        type: 'expense',
                        currency: 'USD',
                        units: 0,
                        hash: crypto.randomBytes(32).toString('hex')
                    },
                    // Previous month
                    {
                        _id: crypto.randomBytes(12).toString('hex'),
                        userId: '1',
                        title: 'Monthly Salary',
                        amount: 5000,
                        category: 'Salary',
                        date: lastMonth.toISOString(),
                        type: 'income',
                        currency: 'USD',
                        units: 0,
                        hash: crypto.randomBytes(32).toString('hex')
                    },
                    {
                        _id: crypto.randomBytes(12).toString('hex'),
                        userId: '1',
                        title: 'Apartment Rent',
                        amount: 1400,
                        category: 'Rent',
                        date: lastMonth.toISOString(),
                        type: 'expense',
                        currency: 'USD',
                        units: 0,
                        hash: crypto.randomBytes(32).toString('hex')
                    },
                    {
                        _id: crypto.randomBytes(12).toString('hex'),
                        userId: '1',
                        title: 'Groceries & Dining',
                        amount: 620,
                        category: 'Food',
                        date: lastMonth.toISOString(),
                        type: 'expense',
                        currency: 'USD',
                        units: 0,
                        hash: crypto.randomBytes(32).toString('hex')
                    },
                    // Two months ago
                    {
                        _id: crypto.randomBytes(12).toString('hex'),
                        userId: '1',
                        title: 'Monthly Salary',
                        amount: 4800,
                        category: 'Salary',
                        date: twoMonthsAgo.toISOString(),
                        type: 'income',
                        currency: 'USD',
                        units: 0,
                        hash: crypto.randomBytes(32).toString('hex')
                    },
                    {
                        _id: crypto.randomBytes(12).toString('hex'),
                        userId: '1',
                        title: 'Living Expenses',
                        amount: 1950,
                        category: 'Rent',
                        date: twoMonthsAgo.toISOString(),
                        type: 'expense',
                        currency: 'USD',
                        units: 0,
                        hash: crypto.randomBytes(32).toString('hex')
                    },
                    // Sarah (User 2)
                    {
                        _id: crypto.randomBytes(12).toString('hex'),
                        userId: '2',
                        title: 'Design Consulting Income',
                        amount: 4600,
                        category: 'Salary',
                        date: now.toISOString(),
                        type: 'income',
                        currency: 'USD',
                        units: 0,
                        hash: crypto.randomBytes(32).toString('hex')
                    },
                    {
                        _id: crypto.randomBytes(12).toString('hex'),
                        userId: '2',
                        title: 'Studio Rent & Living',
                        amount: 1250,
                        category: 'Rent',
                        date: now.toISOString(),
                        type: 'expense',
                        currency: 'USD',
                        units: 0,
                        hash: crypto.randomBytes(32).toString('hex')
                    }
                ]
            };

            fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
            console.log('[Storage] Initialized embedded database with sample data at', DB_FILE);
        }
    }

    readLocalDb() {
        try {
            const raw = fs.readFileSync(DB_FILE, 'utf-8');
            return JSON.parse(raw);
        } catch (err) {
            console.error('[Storage] Error reading local DB file:', err);
            return { users: [], expenses: [] };
        }
    }

    writeLocalDb(data) {
        try {
            const tempFile = DB_FILE + '.tmp';
            fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
            fs.renameSync(tempFile, DB_FILE);
        } catch (err) {
            console.error('[Storage] Error writing local DB file:', err);
        }
    }

    async init() {
        // Attempt MySQL connection
        try {
            const pool = mysql.createPool({
                host: process.env.MYSQL_HOST || 'localhost',
                user: process.env.MYSQL_USER || 'root',
                password: process.env.MYSQL_PASSWORD || '',
                database: process.env.MYSQL_DB || 'dailyexpense',
                port: process.env.MYSQL_PORT || 3306,
                waitForConnections: true,
                connectionLimit: 5,
                connectTimeout: 2000
            });
            const conn = await pool.getConnection();
            conn.release();
            this.mysqlPool = pool;
            this.useMySQL = true;

            // Ensure table
            try {
                await this.mysqlPool.execute(`
                    CREATE TABLE IF NOT EXISTS users (
                        user_id INT AUTO_INCREMENT PRIMARY KEY,
                        firstname VARCHAR(50) NOT NULL,
                        lastname VARCHAR(50) NOT NULL,
                        email VARCHAR(100) UNIQUE NOT NULL,
                        password VARCHAR(255) NOT NULL,
                        optInLeaderboard TINYINT(1) DEFAULT 0
                    )
                `);
                await this.mysqlPool.execute('ALTER TABLE users MODIFY password VARCHAR(255)');
                await this.mysqlPool.execute('ALTER TABLE users ADD COLUMN IF NOT EXISTS optInLeaderboard TINYINT(1) DEFAULT 0');
                console.log('✓ MySQL Connected & Schema Verified');
            } catch (schemaErr) {
                console.warn('MySQL schema check warning:', schemaErr.message);
            }
        } catch (err) {
            this.useMySQL = false;
            console.log(`ℹ MySQL not active on localhost:3306 (${err.code || err.message}).`);
            console.log('✓ Using Embedded Storage for User Authentication & Management.');
        }

        // Attempt MongoDB connection
        try {
            const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/expenseTracker';
            mongoose.set('bufferCommands', false);
            await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 2000 });
            this.useMongoDB = true;
            console.log('✓ MongoDB Connected');
        } catch (err) {
            this.useMongoDB = false;
            console.log(`ℹ MongoDB not active on localhost:27017 (${err.code || err.message}).`);
            console.log('✓ Using Embedded Storage for Transactions, Analytics & Risk Engine.');
        }
    }

    // --- User Operations ---
    async registerUser({ firstname, lastname, email, password }) {
        const hashedPassword = await bcrypt.hash(password, 10);
        if (this.useMySQL) {
            const [result] = await this.mysqlPool.execute(
                'INSERT INTO users (firstname, lastname, email, password) VALUES (?, ?, ?, ?)',
                [firstname, lastname, email, hashedPassword]
            );
            return { userId: result.insertId };
        } else {
            const db = this.readLocalDb();
            const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
            if (existing) {
                throw new Error('User already exists with this email');
            }
            const nextId = db.users.length ? Math.max(...db.users.map(u => u.user_id || 0)) + 1 : 1;
            const newUser = {
                user_id: nextId,
                firstname,
                lastname,
                email,
                password: hashedPassword,
                optInLeaderboard: 0
            };
            db.users.push(newUser);
            this.writeLocalDb(db);
            return { userId: nextId };
        }
    }

    async findUserByEmail(email) {
        if (this.useMySQL) {
            const [rows] = await this.mysqlPool.execute('SELECT * FROM users WHERE email = ?', [email]);
            return rows[0] || null;
        } else {
            const db = this.readLocalDb();
            return db.users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
        }
    }

    async updatePassword(email, newHashedPassword) {
        if (this.useMySQL) {
            const [result] = await this.mysqlPool.execute('UPDATE users SET password = ? WHERE email = ?', [newHashedPassword, email]);
            return result.affectedRows > 0;
        } else {
            const db = this.readLocalDb();
            const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
            if (!user) return false;
            user.password = newHashedPassword;
            this.writeLocalDb(db);
            return true;
        }
    }

    async setLeaderboardOptIn(userId, optIn) {
        if (this.useMySQL) {
            await this.mysqlPool.execute('UPDATE users SET optInLeaderboard = ? WHERE user_id = ?', [optIn ? 1 : 0, userId]);
        } else {
            const db = this.readLocalDb();
            const user = db.users.find(u => String(u.user_id) === String(userId));
            if (user) {
                user.optInLeaderboard = optIn ? 1 : 0;
                this.writeLocalDb(db);
            }
        }
    }

    async getLeaderboardUsers() {
        if (this.useMySQL) {
            const [users] = await this.mysqlPool.query('SELECT user_id AS id, firstname FROM users WHERE optInLeaderboard = 1');
            return users;
        } else {
            const db = this.readLocalDb();
            return db.users
                .filter(u => u.optInLeaderboard === 1)
                .map(u => ({ id: u.user_id, firstname: u.firstname }));
        }
    }

    // --- Expense Operations ---
    async getExpenses(userId) {
        const strId = String(userId);
        if (this.useMongoDB) {
            return await MongoExpense.find({ userId: { $in: [strId, parseInt(userId)] } }).sort({ date: -1 });
        } else {
            const db = this.readLocalDb();
            return db.expenses
                .filter(e => String(e.userId) === strId)
                .sort((a, b) => new Date(b.date) - new Date(a.date));
        }
    }

    async createExpense({ userId, title, amount, category, date, type, currency, units }) {
        const transData = {
            userId: String(userId),
            title,
            amount: parseFloat(amount),
            category,
            date: date ? new Date(date).toISOString() : new Date().toISOString(),
            type: type || 'expense',
            currency: currency || 'USD',
            units: parseFloat(units) || 0
        };

        const hash = generateHash({ ...transData, timestamp: Date.now() });

        if (this.useMongoDB) {
            const newExpense = new MongoExpense({ ...transData, hash });
            return await newExpense.save();
        } else {
            const db = this.readLocalDb();
            const expenseRecord = {
                _id: crypto.randomBytes(12).toString('hex'),
                ...transData,
                hash
            };
            db.expenses.unshift(expenseRecord);
            this.writeLocalDb(db);
            return expenseRecord;
        }
    }

    async deleteExpense(id, userId) {
        const strId = String(userId);
        if (this.useMongoDB) {
            return await MongoExpense.findOneAndDelete({ _id: id, userId: strId });
        } else {
            const db = this.readLocalDb();
            const idx = db.expenses.findIndex(e => String(e._id) === String(id) && String(e.userId) === strId);
            if (idx === -1) return null;
            const removed = db.expenses.splice(idx, 1)[0];
            this.writeLocalDb(db);
            return removed;
        }
    }

    async getStats(userId) {
        const strId = String(userId);
        if (this.useMongoDB) {
            const totals = await MongoExpense.aggregate([
                { $match: { userId: { $in: [strId, parseInt(userId)] } } },
                { $group: {
                    _id: null,
                    totalIncome: { $sum: { $cond: [{ $eq: ["$type", "income"] }, "$amount", 0] } },
                    totalExpense: { $sum: { $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0] } }
                }}
            ]);

            const categoryWise = await MongoExpense.aggregate([
                { $match: { userId: { $in: [strId, parseInt(userId)] } } },
                { $group: {
                    _id: '$category',
                    total: { $sum: '$amount' }
                }}
            ]);

            return {
                categoryWise,
                totalIncome: totals[0]?.totalIncome || 0,
                totalExpense: totals[0]?.totalExpense || 0
            };
        } else {
            const db = this.readLocalDb();
            const userExpenses = db.expenses.filter(e => String(e.userId) === strId);
            let totalIncome = 0;
            let totalExpense = 0;
            const catMap = {};

            userExpenses.forEach(e => {
                const amt = Number(e.amount) || 0;
                if (e.type === 'income') totalIncome += amt;
                else if (e.type === 'expense') totalExpense += amt;

                catMap[e.category] = (catMap[e.category] || 0) + amt;
            });

            const categoryWise = Object.entries(catMap).map(([_id, total]) => ({ _id, total }));
            return {
                categoryWise,
                totalIncome,
                totalExpense
            };
        }
    }

    async getMonthlyStats(userId) {
        const strId = String(userId);
        if (this.useMongoDB) {
            return await MongoExpense.aggregate([
                { $match: { userId: strId } },
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
        } else {
            const db = this.readLocalDb();
            const userExpenses = db.expenses.filter(e => String(e.userId) === strId);
            const monthMap = {};

            userExpenses.forEach(e => {
                const d = new Date(e.date);
                const month = d.getMonth() + 1;
                const year = d.getFullYear();
                const type = e.type || 'expense';
                const key = `${year}-${month}-${type}`;

                if (!monthMap[key]) {
                    monthMap[key] = {
                        _id: { month, year, type },
                        total: 0
                    };
                }
                monthMap[key].total += Number(e.amount) || 0;
            });

            return Object.values(monthMap).sort((a, b) => {
                return (a._id.year - b._id.year) || (a._id.month - b._id.month);
            });
        }
    }

    async getAnalytics(userId) {
        const monthlyStats = await this.getMonthlyStats(userId);
        const stats = await this.getStats(userId);

        const income = stats.totalIncome;
        const expense = stats.totalExpense;
        const savingsRate = income > 0 ? ((income - expense) / income) * 100 : 0;

        let riskScore = 0;
        let riskLevel = "Stable";

        if (income === 0 && expense > 0) {
            riskScore = 100;
            riskLevel = "Critical (No Income)";
        } else if (savingsRate < 0) {
            riskScore = 90;
            riskLevel = "High (Overspending)";
        } else if (savingsRate < 10) {
            riskScore = 60;
            riskLevel = "Moderate (Low Savings)";
        } else if (savingsRate < 20) {
            riskScore = 30;
            riskLevel = "Low";
        } else {
            riskScore = 10;
            riskLevel = "Very Low (Healthy)";
        }

        // Linear regression prediction
        const expenseHistory = monthlyStats
            .filter(d => d._id.type === 'expense')
            .map((d, i) => ({ x: i, y: d.total }));

        let predictedExpense = 0;
        if (expenseHistory.length >= 2) {
            const n = expenseHistory.length;
            let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
            expenseHistory.forEach(point => {
                sumX += point.x;
                sumY += point.y;
                sumXY += point.x * point.y;
                sumXX += point.x * point.x;
            });
            const denominator = (n * sumXX - sumX * sumX);
            const m = denominator !== 0 ? (n * sumXY - sumX * sumY) / denominator : 0;
            const b = (sumY - m * sumX) / n;
            predictedExpense = m * n + b;
        } else if (expenseHistory.length === 1) {
            predictedExpense = expenseHistory[0].y;
        }

        return {
            monthlyStats,
            risk: {
                score: Math.min(100, Math.max(0, riskScore)),
                level: riskLevel,
                savingsRate: savingsRate.toFixed(2)
            },
            prediction: {
                nextMonthExpense: Math.max(0, predictedExpense).toFixed(2)
            }
        };
    }

    async getLeaderboard() {
        const users = await this.getLeaderboardUsers();
        const leaderboard = [];

        for (const user of users) {
            const stats = await this.getStats(user.id);
            const s = stats || { totalIncome: 0, totalExpense: 0 };
            const savingPercent = s.totalIncome > 0 ? ((s.totalIncome - s.totalExpense) / s.totalIncome) * 100 : 0;

            leaderboard.push({
                name: user.firstname,
                savingPercent: Math.max(0, savingPercent).toFixed(2)
            });
        }

        return leaderboard.sort((a, b) => parseFloat(b.savingPercent) - parseFloat(a.savingPercent));
    }

    async getDebug(userId) {
        const strId = String(userId);
        if (this.useMongoDB) {
            const count = await MongoExpense.countDocuments({ userId: strId });
            const sample = await MongoExpense.findOne({ userId: strId });
            const allSample = await MongoExpense.findOne({});
            return {
                loggedInUserId: strId,
                matchCount: count,
                sampleForUser: sample,
                anySampleInDb: allSample
            };
        } else {
            const db = this.readLocalDb();
            const userMatches = db.expenses.filter(e => String(e.userId) === strId);
            return {
                loggedInUserId: strId,
                matchCount: userMatches.length,
                sampleForUser: userMatches[0] || null,
                anySampleInDb: db.expenses[0] || null
            };
        }
    }
}

const storage = new StorageManager();
module.exports = storage;
