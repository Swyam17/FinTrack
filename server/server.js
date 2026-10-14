const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');
require('dotenv').config();
const storage = require('./storage');

const app = express();
app.use(express.json());
app.use(cors());

const jwtSecret = process.env.JWT_SECRET || 'fintrack_secret_321';

// Initialize storage connections
storage.init().catch(err => {
    console.error('Storage initialization notice:', err.message);
});

// Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Authentication token required' });

    jwt.verify(token, jwtSecret, (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid or expired token' });
        req.user = user;
        next();
    });
};

// --- Auth Routes ---
app.post('/api/auth/register', async (req, res) => {
    const { firstname, lastname, email, password } = req.body;
    if (!firstname || !email || !password) {
        return res.status(400).json({ error: 'Please provide firstname, email, and password.' });
    }
    try {
        const result = await storage.registerUser({ firstname, lastname: lastname || '', email, password });
        res.status(201).json({ message: 'User registered', userId: result.userId });
    } catch (err) {
        console.error('Register Error:', err);
        res.status(400).json({ error: err.message || 'Failed to register.' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password required' });
    }
    try {
        const user = await storage.findUserByEmail(email);
        if (!user) return res.status(401).json({ message: 'Invalid credentials' });

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(401).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: user.user_id, email: user.email }, jwtSecret, { expiresIn: '7d' });
        res.json({
            token,
            user: {
                id: user.user_id,
                name: `${user.firstname} ${user.lastname || ''}`.trim(),
                firstname: user.firstname,
                email: user.email
            }
        });
    } catch (err) {
        console.error('Login Error:', err);
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/auth/forgot-password', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and new password required' });
    }
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const success = await storage.updatePassword(email, hashedPassword);
        if (!success) return res.status(404).json({ message: 'User not found' });
        res.json({ message: 'Password updated successfully! Please login with your new password.' });
    } catch (err) {
        console.error('Forgot Password Error:', err);
        res.status(500).json({ error: 'Failed to reset password. ' + err.message });
    }
});

app.post('/api/auth/leaderboard/opt-in', authenticateToken, async (req, res) => {
    const { optIn } = req.body;
    try {
        await storage.setLeaderboardOptIn(req.user.id, optIn);
        res.json({ message: 'Preference updated' });
    } catch (err) {
        console.error('Opt-in Error:', err);
        res.status(500).json({ error: err.message });
    }
});

// --- Expense Routes ---
app.get('/api/expenses', authenticateToken, async (req, res) => {
    try {
        const expenses = await storage.getExpenses(req.user.id);
        res.json(expenses);
    } catch (err) {
        console.error('[GET /api/expenses] Error:', err);
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/expenses', authenticateToken, async (req, res) => {
    const { title, amount, category, date, type, currency, units } = req.body;
    if (!title || amount === undefined || isNaN(parseFloat(amount))) {
        return res.status(400).json({ error: 'Valid title and amount required' });
    }
    try {
        const newExpense = await storage.createExpense({
            userId: req.user.id,
            title,
            amount,
            category: category || 'Others',
            date,
            type,
            currency,
            units
        });
        res.status(201).json(newExpense);
    } catch (err) {
        console.error('[POST /api/expenses] Error:', err);
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/expenses/:id', authenticateToken, async (req, res) => {
    try {
        const result = await storage.deleteExpense(req.params.id, req.user.id);
        if (!result) return res.status(404).json({ message: 'Transaction not found' });
        res.json({ message: 'Transaction deleted' });
    } catch (err) {
        console.error('[DELETE /api/expenses/:id] Error:', err);
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/stats', authenticateToken, async (req, res) => {
    try {
        const stats = await storage.getStats(req.user.id);
        res.json(stats);
    } catch (err) {
        console.error('[GET /api/stats] Error:', err);
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/monthly-stats', authenticateToken, async (req, res) => {
    try {
        const monthlyStats = await storage.getMonthlyStats(req.user.id);
        res.json(monthlyStats);
    } catch (err) {
        console.error('[GET /api/monthly-stats] Error:', err);
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/analytics', authenticateToken, async (req, res) => {
    try {
        const analytics = await storage.getAnalytics(req.user.id);
        res.json(analytics);
    } catch (err) {
        console.error('[GET /api/analytics] Error:', err);
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/leaderboard', async (req, res) => {
    try {
        const leaderboard = await storage.getLeaderboard();
        res.json(leaderboard);
    } catch (err) {
        console.error('[GET /api/leaderboard] Error:', err);
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/debug', authenticateToken, async (req, res) => {
    try {
        const debugInfo = await storage.getDebug(req.user.id);
        res.json(debugInfo);
    } catch (err) {
        console.error('[GET /api/debug] Error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Serve frontend build if available (production mode / standalone)
const clientDist = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDist)) {
    app.use(express.static(clientDist));
    app.get('*', (req, res, next) => {
        if (req.path.startsWith('/api')) return next();
        res.sendFile(path.join(clientDist, 'index.html'));
    });
}

const os = require('os');
const getNetworkIPs = () => {
    const interfaces = os.networkInterfaces();
    const ips = [];
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                ips.push({ name, address: iface.address });
            }
        }
    }
    return ips;
};

const PORT = process.env.PORT || 5001;
if (require.main === module) {
    app.listen(PORT, '0.0.0.0', () => {
        const networkIPs = getNetworkIPs();
        console.log(`\n==========================================================`);
        console.log(`  🚀 FINTRACK IS READY FOR MULTI-DEVICE ACCESS!`);
        console.log(`==========================================================`);
        console.log(`  ▶ Local (This Device):`);
        console.log(`    - Web App:            http://localhost:${PORT}`);
        console.log(`    - Dev Server:         http://localhost:3000`);
        console.log(`\n  ▶ Network Access (Phones, Tablets & PCs on Wi-Fi):`);
        networkIPs.forEach(net => {
            console.log(`    - [${net.name}]: http://${net.address}:${PORT}`);
            console.log(`      (Dev Server: http://${net.address}:3000)`);
        });
        console.log(`\n  ▶ Public Access (Any Device Worldwide):`);
        console.log(`    - Run 'npm run share' for an instant public HTTPS URL`);
        console.log(`==========================================================\n`);
    });
}

module.exports = app;
