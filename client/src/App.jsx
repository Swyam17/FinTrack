import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    DollarSign, Plus, User, LogOut, Trash2, ArrowUpRight, ArrowDownRight, Wallet, History,
    Home, LayoutDashboard, ShieldCheck, PieChart as ChartIcon, Search, Menu, X, Coins, Bitcoin, ExternalLink, Trophy
} from 'lucide-react';
import { 
    ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Legend 
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = ['Food', 'Medicine', 'Rent', 'Education', 'Entertainment', 'Others', 'Crypto', 'Salary', 'Gold', 'Silver', 'Stocks'];
const COLORS = ['#8338ec', '#3a86ff', '#00b4d8', '#ff006e', '#ffbe0b', '#fb5607'];
const CURRENCIES = { 'USD': '$', 'INR': '₹', 'EUR': '€', 'GBP': '£' };

// --- Reusable Components ---
const StatCard = ({ title, value, colorClass, icon: Icon, currency }) => (
    <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="glass-card stat-card"
    >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
                <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>{title}</p>
                <h2 style={{ fontSize: '1.8rem', marginTop: '4px' }}>{currency}{value.toLocaleString()}</h2>
            </div>
            <div className={`icon-circle ${colorClass}`} style={{ 
                padding: '12px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)'
            }}>
                <Icon size={24} />
            </div>
        </div>
    </motion.div>
);

const App = () => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [transactions, setTransactions] = useState([]);
    const [stats, setStats] = useState({ totalIncome: 0, totalExpense: 0, categoryWise: [] });
    const [activePage, setActivePage] = useState('dashboard');
    
    // Auth & UI States
    const [authMode, setAuthMode] = useState('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstname, setFirstname] = useState('');
    const [lastname, setLastname] = useState('');
    
    // Form States
    const [newTitle, setNewTitle] = useState('');
    const [newAmount, setNewAmount] = useState('');
    const [newCategory, setNewCategory] = useState('Food');
    const [newType, setNewType] = useState('expense');
    const [newCurrency, setNewCurrency] = useState('USD');
    const [rates, setRates] = useState({ 'USD': 1, 'INR': 83.5, 'EUR': 0.92, 'GBP': 0.79 });
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');
    const [currency, setCurrency] = useState('USD');
    const [monthlyData, setMonthlyData] = useState([]);
    const [cryptoData, setCryptoData] = useState([
        { id: 'pax-gold', usd: 2350.50, usd_24h_change: 0.45 },
        { id: 'pax-silver-token', usd: 28.30, usd_24h_change: -1.2 },
        { id: 'bitcoin', usd: 65200.00, usd_24h_change: 2.15 },
        { id: 'ethereum', usd: 3450.00, usd_24h_change: 1.8 }
    ]);
    const [leaderboard, setLeaderboard] = useState([]);
    const [isOptedIn, setIsOptedIn] = useState(false);
    
    // AI Chatbot States
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatMessages, setChatMessages] = useState([{ role: 'bot', text: 'Hello! I am FinBot. Ask me about your spending or for saving tips!' }]);
    const [userInput, setUserInput] = useState('');
    const [isInvestModalOpen, setIsInvestModalOpen] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [investAmount, setInvestAmount] = useState('');

    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            fetchData();

            // Real-time market data tracking: update every 30 seconds
            const interval = setInterval(() => {
                fetchMarketData();
            }, 30000);

            return () => clearInterval(interval);
        }
    }, [token]);

    const fetchData = async () => {
        // 1. Fetch Local Data (Must Succeed)
        try {
            const [transRes, statsRes, monthlyRes, leaderRes] = await Promise.all([
                axios.get('/api/expenses'),
                axios.get('/api/stats'),
                axios.get('/api/monthly-stats'),
                axios.get('/api/leaderboard')
            ]);
            setTransactions(transRes.data);
            setStats(statsRes.data);
            setMonthlyData(monthlyRes.data);
            setLeaderboard(leaderRes.data);
        } catch (err) {
            console.error("Local data fetch error:", err);
            if (err.response?.status === 401) handleLogout();
        }

        // 2. Fetch External Market Data
        fetchMarketData();
    };

    const fetchMarketData = async () => {
        try {
            const [cryptoRes, ratesRes] = await Promise.all([
                axios.get('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,pax-gold,pax-silver-token,cardano,binancecoin,ripple&vs_currencies=usd,inr&include_24hr_change=true'),
                axios.get('https://api.exchangerate-api.com/v4/latest/USD')
            ]);
            setCryptoData(Object.entries(cryptoRes.data).map(([id, p]) => ({ id, ...p })));
            setRates(ratesRes.data.rates);
        } catch (err) {
            console.warn("External APIs failed, using cached/defaults:", err);
        }
    };

    const toggleLeaderboard = async () => {
        try {
            const newOptIn = !isOptedIn;
            await axios.post('/api/auth/leaderboard/opt-in', { optIn: newOptIn });
            setIsOptedIn(newOptIn);
            fetchData();
        } catch (err) {
            alert('Failed to update leaderboard preference');
        }
    };

    const handleAuth = async (e) => {
        e.preventDefault();
        try {
            if (authMode === 'login') {
                const res = await axios.post('/api/auth/login', { email, password });
                localStorage.setItem('token', res.data.token);
                setToken(res.data.token);
                setUser(res.data.user);
            } else {
                await axios.post('/api/auth/register', { firstname, lastname, email, password });
                setAuthMode('login');
                alert('Registration successful! Please login.');
            }
        } catch (err) {
            alert(err.response?.data?.message || err.response?.data?.error || 'Auth failed');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    const handleInvestment = async (e) => {
        e.preventDefault();
        if (!selectedAsset || !investAmount) return;
        
        try {
            const assetName = selectedAsset.id.replace('-', ' ').toUpperCase();
            const totalPrice = parseFloat(investAmount) * selectedAsset.usd;
            
            await axios.post('/api/expenses', { 
                title: `Invested in ${assetName}`, 
                amount: totalPrice, 
                category: assetName.includes('GOLD') ? 'Gold' : assetName.includes('SILVER') ? 'Silver' : 'Crypto', 
                type: 'expense'
            });
            
            setInvestAmount('');
            setIsInvestModalOpen(false);
            alert(`Successfully logged investment of ${investAmount} units of ${assetName}!`);
            await fetchData();
        } catch (err) {
            alert('Error recording investment');
        }
    };

    const addTransaction = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/expenses', { 
                title: newTitle, 
                amount: parseFloat(newAmount), 
                category: newCategory, 
                type: newType,
                currency: newCurrency
            });
            setNewTitle(''); setNewAmount('');
            await fetchData();
        } catch (err) {
            alert('Error adding transaction');
        }
    };

    const deleteTransaction = async (id) => {
        if (!window.confirm('Are you sure you want to delete this transaction?')) return;
        try {
            await axios.delete(`/api/expenses/${id}`);
            fetchData();
        } catch (err) {
            alert('Error deleting transaction');
        }
    };

    const handleChat = (e) => {
        e.preventDefault();
        const msg = userInput.toLowerCase();
        let botResponse = "I'm sorry, I don't have enough data to answer that yet! Try asking about your spending, income, investment, or for financial advice.";
        let extraLink = null;
        
        if (msg.includes('spend')) {
            botResponse = `You have spent a total of ${CURRENCIES[currency]}${conv.totalExpense} so far. ${parseFloat(conv.totalExpense) > 1000 ? "You might want to review your 'Others' category for hidden leaks." : "Your spending seems controlled."}`;
        } else if (msg.includes('income')) {
            botResponse = `Your total income is ${CURRENCIES[currency]}${conv.totalIncome}. Remember, it's not about how much you make, but how much you keep!`;
        } else if (msg.includes('save') || msg.includes('saving')) {
            botResponse = getSavingAdvice();
        } else if (msg.includes('manage') || msg.includes('budget') || msg.includes('money')) {
            botResponse = getManagementAdvice();
        } else if (msg.includes('invest')) {
            const gold = cryptoData.find(c => c.id === 'pax-gold') || { usd: 0, usd_24h_change: 0 };
            const silver = cryptoData.find(c => c.id === 'pax-silver-token') || { usd: 0, usd_24h_change: 0 };
            const bitcoin = cryptoData.find(c => c.id === 'bitcoin') || { usd: 0, usd_24h_change: 0 };
            
            botResponse = `Based on current market data, here are some investment options:
• Bitcoin: $${bitcoin.usd.toLocaleString()} (${bitcoin.usd_24h_change >= 0 ? '+' : ''}${bitcoin.usd_24h_change.toFixed(2)}%)
• Gold: $${gold.usd.toLocaleString()} (${gold.usd_24h_change >= 0 ? '+' : ''}${gold.usd_24h_change.toFixed(2)}%)
• Silver: $${silver.usd.toLocaleString()} (${silver.usd_24h_change >= 0 ? '+' : ''}${silver.usd_24h_change.toFixed(2)}%)

For long-term security, we also highly recommend checking out Tata AIA Insurance plans.`;
            extraLink = "https://tata-aia-insurance-agent-portal.vercel.app/";
        } else if (msg.includes('hello') || msg.includes('hi')) {
            botResponse = `Hello ${user?.firstname || 'there'}! I'm your AI Financial Assistant. I can help you track expenses, analyze spending, and give you tips on growing your wealth. What's on your mind today?`;
        }

        const newMessages = [...chatMessages, { role: 'user', text: userInput }];
        if (extraLink) {
            newMessages.push({ role: 'bot', text: botResponse, link: extraLink });
        } else {
            newMessages.push({ role: 'bot', text: botResponse });
        }
        setChatMessages(newMessages);
        setUserInput('');
    };

    const calculateConvertedBalance = () => {
        let incomeInUSD = 0;
        let expenseInUSD = 0;
        
        transactions.forEach(t => {
            const amountInUSD = t.amount / (rates[t.currency || 'USD'] || 1);
            if (t.type === 'income') incomeInUSD += amountInUSD;
            else expenseInUSD += amountInUSD;
        });

        const multiplier = rates[currency] || 1;
        return {
            totalIncome: (incomeInUSD * multiplier).toFixed(2),
            totalExpense: (expenseInUSD * multiplier).toFixed(2),
            balance: ((incomeInUSD - expenseInUSD) * multiplier).toFixed(2)
        };
    };

    const conv = calculateConvertedBalance();
    
    const getAdvice = () => {
        const bal = parseFloat(conv.balance);
        const income = parseFloat(conv.totalIncome);
        const expense = parseFloat(conv.totalExpense);
        
        if (income > 0) {
            const usagePercent = (expense / income) * 100;
            if (bal < 0) return "⚠️ CRITICAL: You are spending more than you earn! Stop all non-essential spending.";
            if (usagePercent > 75) return "🚨 WARNING: You have used over 75% of your income. Stick to the 50/30/20 rule.";
            if (usagePercent > 50) return "💡 ALERT: You have used over 50% of your salary. Time to monitor your daily expenses more closely.";
        }
        
        return "✅ Good job! You have a healthy savings rate. Consider investing your surplus to beat inflation.";
    };

    const getSavingAdvice = () => {
        const income = parseFloat(conv.totalIncome);
        const expense = parseFloat(conv.totalExpense);
        
        let advice = "💡 **How to Save More:**\n\n";
        advice += "1. **50/30/20 Rule**: Allocate 50% for Needs, 30% for Wants, and 20% for Savings/Debt.\n";
        advice += "2. **Emergency Fund**: Aim for 3-6 months of expenses in a liquid account.\n";
        advice += "3. **Cut Subscriptions**: Audit recurring payments. Even small ones add up!\n";
        advice += "4. **Automate**: Pay yourself first by automating transfers to savings.";
        
        if (income > 0) {
            const usage = (expense / income) * 100;
            if (usage > 60) {
                advice += `\n\n⚠️ **Analysis**: You're currently using ${usage.toFixed(1)}% of your income. Reducing this to 50% could save you an extra ${CURRENCIES[currency]}${((usage - 50) * income / 100).toFixed(2)} monthly!`;
            }
        }
        return advice;
    };

    const getManagementAdvice = () => {
        let advice = "📊 **Money Management Tips:**\n\n";
        advice += "• **Budget by Category**: Set limits for Food, Entertainment, and Rent.\n";
        advice += "• **Rule of 72**: Understand how long it takes to double your money via interest.\n";
        advice += "• **Avoid Debt**: High-interest credit card debt is the biggest wealth killer.\n";
        advice += "• **Review Weekly**: Check your FinTrack ledger every Sunday to stay on top.";
        
        if (stats.categoryWise?.length > 0) {
            const topExp = [...stats.categoryWise].filter(c => c._id !== 'Salary').sort((a,b) => b.total - a.total)[0];
            if (topExp) {
                advice += `\n\n🔍 **Smart Insight**: Your top expense recently was **${topExp._id}**. Can you find a cheaper alternative for this?`;
            }
        }
        return advice;
    };

    const getMonthlyChartData = () => {
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const summary = {};
        monthlyData.forEach(d => {
            const key = `${months[d._id.month - 1]} ${d._id.year}`;
            if (!summary[key]) summary[key] = { name: key, income: 0, expense: 0 };
            summary[key][d._id.type] = d.total;
        });
        return Object.values(summary);
    };

    const filteredTransactions = transactions.filter(t => 
        (t.title.toLowerCase().includes(searchTerm.toLowerCase()) || t.category.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (filterCategory === 'All' || t.category === filterCategory)
    );

    if (!token) {
        return (
            <div className="auth-container" style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center' }}>
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card" style={{ padding: '40px', width: '100%', maxWidth: '400px' }}>
                    <h1 style={{ textAlign: 'center' }}>{authMode === 'login' ? 'Login' : 'Join Us'}</h1>
                    <form onSubmit={handleAuth} style={{ marginTop: '24px' }}>
                        {authMode === 'register' && (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div className="input-group"><label>First Name</label><input value={firstname} onChange={e => setFirstname(e.target.value)} required /></div>
                                <div className="input-group"><label>Last Name</label><input value={lastname} onChange={e => setLastname(e.target.value)} required /></div>
                            </div>
                        )}
                        <div className="input-group"><label>Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} required /></div>
                        <div className="input-group"><label>Password</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} required /></div>
                        <button className="btn btn-primary" style={{ width: '100%', marginTop: '16px' }}>{authMode === 'login' ? 'Login' : 'Sign Up'}</button>
                    </form>
                    <p style={{ textAlign: 'center', marginTop: '24px', cursor: 'pointer', color: 'var(--primary)' }} onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}>
                        {authMode === 'login' ? "New here? Create account" : "Have an account? Login"}
                    </p>
                </motion.div>
            </div>
        );
    }

    const SidebarItem = ({ id, label, icon: Icon }) => (
        <div onClick={() => setActivePage(id)} className={`sidebar-item ${activePage === id ? 'active' : ''}`}>
            <Icon size={20} /> <span>{label}</span>
        </div>
    );

    return (
        <div className="full-site-layout">
            {/* Sidebar */}
            <nav className="sidebar">
                <div style={{ padding: '32px 24px', fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '-1px' }}>
                    FIN<span style={{ color: 'white' }}>TRACK</span>
                </div>
                <div style={{ flex: 1 }}>
                    <SidebarItem id="dashboard" label="Dashboard" icon={LayoutDashboard} />
                    <SidebarItem id="analytics" label="Analytics" icon={ChartIcon} />
                    <SidebarItem id="ledger" label="Ledger (Blockchain)" icon={ShieldCheck} />
                    <SidebarItem id="crypto" label="Asset Portfolio" icon={Bitcoin} />
                    <SidebarItem id="leaderboard" label="Rankings 🏆" icon={Trophy} />
                    <SidebarItem id="debug" label="Integrity Check" icon={Menu} />
                    <SidebarItem id="profile" label="Profile" icon={User} />
                </div>
                <div style={{ padding: '24px', borderTop: '1px solid var(--border)' }}>
                    <div style={{ 
                        padding: '16px', 
                        background: 'rgba(131, 56, 236, 0.05)', 
                        borderRadius: '12px', 
                        border: '1px solid rgba(131, 56, 236, 0.2)',
                        marginBottom: '16px'
                    }}>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '8px', fontWeight: 600, textTransform: 'uppercase' }}>Partnership</p>
                        <a href="https://tata-aia-insurance-agent-portal.vercel.app/" target="_blank" rel="noopener noreferrer" style={{ color: 'white', textDecoration: 'none', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <ShieldCheck size={16} color="var(--primary)" /> Tata AIA Insurance <ExternalLink size={12} />
                        </a>
                    </div>
                    <button className="btn" style={{ width: '100%', background: 'rgba(255,255,255,0.05)', color: 'white' }} onClick={handleLogout}>
                        <LogOut size={18} /> Logout
                    </button>
                </div>
            </nav>

            {/* Main Content */}
            <main className="main-content">
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                    <div>
                        <h1 style={{ fontSize: '1.8rem' }}>Welcome Back, User</h1>
                        <p style={{ color: 'var(--text-dim)' }}>Your secure financial portal is ready.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '16px' }}>
                        <select value={currency} onChange={e => setCurrency(e.target.value)} style={{ width: '100px', margin: 0 }}>
                            {Object.keys(CURRENCIES).map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                </header>

                <AnimatePresence mode="wait">
                    {activePage === 'dashboard' && (
                        <motion.div key="dashboard" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                            {parseFloat(conv.totalIncome) > 0 && (parseFloat(conv.totalExpense) / parseFloat(conv.totalIncome)) > 0.5 && (
                                <motion.div 
                                    initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                                    style={{ 
                                        background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', 
                                        padding: '16px', borderRadius: '12px', marginBottom: '24px',
                                        display: 'flex', alignItems: 'center', gap: '12px'
                                    }}
                                >
                                    <div style={{ color: '#ef4444' }}><ShieldCheck size={20} /></div>
                                    <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600 }}>Budget Alert: You've exceeded 50% of your total income usage!</p>
                                </motion.div>
                            )}

                            <div className="dashboard-grid">
                                <StatCard title="Total Balance" value={conv.balance} icon={Wallet} currency={CURRENCIES[currency]} />
                                <StatCard title="Total Income" value={conv.totalIncome} icon={ArrowUpRight} colorClass="income-text" currency={CURRENCIES[currency]} />
                                <StatCard title="Total Expenses" value={conv.totalExpense} icon={ArrowDownRight} colorClass="expense-text" currency={CURRENCIES[currency]} />
                            </div>

                            {/* Premium Advertisement Banner */}
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                                className="glass-card"
                                style={{ 
                                    marginTop: '24px', 
                                    padding: '24px', 
                                    background: 'linear-gradient(135deg, rgba(131, 56, 236, 0.1) 0%, rgba(58, 134, 255, 0.1) 100%)',
                                    border: '1px solid rgba(131, 56, 236, 0.3)',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    gap: '24px',
                                    flexWrap: 'wrap'
                                }}
                            >
                                <div style={{ display: 'flex', gap: '20px', alignItems: 'center', minWidth: '300px' }}>
                                    <div style={{ 
                                        padding: '16px', 
                                        background: 'var(--primary)', 
                                        borderRadius: '16px', 
                                        color: 'white',
                                        boxShadow: '0 8px 32px rgba(131, 56, 236, 0.3)' 
                                    }}>
                                        <ShieldCheck size={32} />
                                    </div>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                            <span style={{ background: 'var(--primary)', color: 'white', fontSize: '0.65rem', padding: '2px 8px', borderRadius: '4px', fontWeight: 800 }}>PROMOTED</span>
                                            <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Secure Your Future with Tata AIA</h3>
                                        </div>
                                        <p style={{ margin: 0, color: 'var(--text-dim)', fontSize: '0.95rem' }}>Get comprehensive life & health insurance plans starting from just $10/month.</p>
                                    </div>
                                </div>
                                <a 
                                    href="https://tata-aia-insurance-agent-portal.vercel.app/" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="btn btn-primary"
                                    style={{ 
                                        whiteSpace: 'nowrap', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: '10px',
                                        padding: '12px 24px',
                                        fontSize: '1rem'
                                    }}
                                >
                                    Check Eligibility <ExternalLink size={18} />
                                </a>
                            </motion.div>

                            <div style={{ display: 'flex', gap: '16px', marginTop: '24px' }}>
                                <button className="btn" style={{ background: '#10b981', color: 'white' }} onClick={() => {
                                    setNewType('income');
                                    setNewCategory('Salary');
                                    setNewTitle('Monthly Salary');
                                }}>
                                    <Coins size={18} /> Quick Log Salary
                                </button>
                                <button className="btn" style={{ background: '#f7931a', color: 'white' }} onClick={() => setActivePage('crypto')}>
                                    <Bitcoin size={18} /> Market Trends
                                </button>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '32px', marginTop: '32px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                                    <div className="glass-card" style={{ padding: '24px', border: newType === 'income' ? '2px solid #10b981' : '1px solid var(--border)' }}>
                                        <h3 style={{ marginBottom: '20px' }}>{newType === 'income' ? '💰 Deposit' : '💸 Add Expense'}</h3>
                                        <form onSubmit={addTransaction}>
                                            <div className="input-group"><label>Title</label><input value={newTitle} onChange={e => setNewTitle(e.target.value)} required /></div>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                                <div className="input-group"><label>Amount</label><input type="number" value={newAmount} onChange={e => setNewAmount(e.target.value)} required /></div>
                                                <div className="input-group">
                                                    <label>Type / Currency</label>
                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                        <select style={{ flex: 1.5 }} value={newType} onChange={e => setNewType(e.target.value)}>
                                                            <option value="expense">Expense</option>
                                                            <option value="income">Income</option>
                                                        </select>
                                                        <select style={{ flex: 1 }} value={newCurrency} onChange={e => setNewCurrency(e.target.value)}>
                                                            {Object.keys(CURRENCIES).map(c => <option key={c} value={c}>{c}</option>)}
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="input-group">
                                                <label>Category</label>
                                                <select value={newCategory} onChange={e => setNewCategory(e.target.value)}>
                                                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                                </select>
                                            </div>
                                            <button className="btn btn-primary" style={{ width: '100%', marginTop: '16px', background: newType === 'income' ? '#10b981' : 'var(--primary)' }}>Add {newType}</button>
                                        </form>
                                    </div>
                                    <div className="glass-card" style={{ padding: '24px' }}>
                                        <h3>🤖 AI Insight</h3>
                                        <p style={{ marginTop: '16px', color: 'var(--text-dim)', lineHeight: '1.6' }}>{getAdvice()}</p>
                                    </div>
                                </div>

                                <div className="glass-card" style={{ padding: '24px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                                        <h3>Recent Activity</h3>
                                        <div style={{ display: 'flex', gap: '12px' }}>
                                            <input placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ width: '150px', margin: 0 }} />
                                        </div>
                                    </div>
                                    <div style={{ maxHeight: '450px', overflowY: 'auto' }}>
                                        {filteredTransactions.map(t => (
                                            <div key={t._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid var(--border)' }}>
                                                <div><p style={{ fontWeight: 600 }}>{t.title}</p><small style={{ color: 'var(--text-dim)' }}>{t.category} • {new Date(t.date).toLocaleDateString()}</small></div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <p className={t.type === 'income' ? 'income-text' : 'expense-text'} style={{ fontWeight: 700 }}>
                                                        {t.type === 'income' ? '+' : '-'}{CURRENCIES[currency]}{t.amount.toLocaleString()}
                                                    </p>
                                                    <Trash2 size={14} style={{ cursor: 'pointer', color: 'var(--error)', marginTop: '4px' }} onClick={() => deleteTransaction(t._id)} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activePage === 'ledger' && (
                        <motion.div key="ledger" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ padding: '32px' }}>
                            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '32px' }}>
                                <ShieldCheck size={40} color="var(--primary)" />
                                <div>
                                    <h2>Verifiable Transaction Ledger</h2>
                                    <p style={{ color: 'var(--text-dim)' }}>Every entry is secured with unique SHA-256 cryptographic hashes.</p>
                                </div>
                            </div>
                            <table>
                                <thead><tr><th>BLOCK ID</th><th>TRANSACTION</th><th>TYPE</th><th>HASH RECORD</th></tr></thead>
                                <tbody>
                                    {transactions.map(t => (
                                        <tr key={t._id}>
                                            <td>#{t._id.substring(t._id.length - 6)}</td>
                                            <td>{t.title}</td>
                                            <td className={t.type === 'income' ? 'income-text' : 'expense-text'}>{t.type.toUpperCase()}</td>
                                            <td style={{ fontFamily: 'monospace', color: 'var(--text-dim)', fontSize: '0.8rem' }}>{t.hash?.substring(0, 32)}...</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </motion.div>
                    )}

                    {activePage === 'crypto' && (
                        <motion.div key="crypto" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-card" style={{ padding: '32px' }}>
                            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '32px' }}>
                                <Bitcoin size={40} color="#f7931a" />
                                <div>
                                    <h2>Global Asset Tracker</h2>
                                    <p style={{ color: 'var(--text-dim)' }}>Live price data for Precious Metals and Cryptocurrencies.</p>
                                </div>
                            </div>
                                                       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                                {cryptoData.map(c => (
                                    <div key={c.id} className="glass-card" style={{ padding: '24px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                            <h4 style={{ textTransform: 'uppercase', fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                                                {c.id.replace('-', ' ')}
                                                {c.id.includes('gold') && ' 🏆'}
                                                {c.id.includes('silver') && ' 💍'}
                                            </h4>
                                            <div style={{ color: c.usd_24h_change >= 0 ? '#10b981' : '#ef4444', fontSize: '0.85rem', fontWeight: 700 }}>
                                                {c.usd_24h_change >= 0 ? '+' : ''}{c.usd_24h_change.toFixed(2)}%
                                            </div>
                                        </div>
                                        <h2 style={{ fontSize: '2rem', margin: '8px 0' }}>
                                            {CURRENCIES[currency]}{(c.usd * (rates[currency] || 1)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </h2>
                                        <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem', marginBottom: '20px' }}>Current Market Price ({currency})</p>
                                        <button className="btn btn-primary" style={{ width: '100%', fontSize: '0.9rem' }} onClick={() => {
                                            setSelectedAsset(c);
                                            setIsInvestModalOpen(true);
                                        }}>
                                            <Bitcoin size={16} /> Invest Now
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <AnimatePresence>
                                {isInvestModalOpen && selectedAsset && (
                                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
                                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card" style={{ padding: '32px', width: '100%', maxWidth: '400px' }}>
                                            <h2 style={{ marginBottom: '8px' }}>Invest in {selectedAsset.id.replace('-', ' ').toUpperCase()}</h2>
                                            <p style={{ color: 'var(--text-dim)', marginBottom: '24px' }}>Units will be automatically calculated at current rate ({CURRENCIES[currency]}{(selectedAsset.usd * (rates[currency] || 1)).toLocaleString()}).</p>
                                            
                                            <form onSubmit={handleInvestment}>
                                                <div className="input-group">
                                                    <label>Amount of units to buy</label>
                                                    <input 
                                                        type="number" step="any" placeholder="0.00" 
                                                        value={investAmount} 
                                                        onChange={e => setInvestAmount(e.target.value)} 
                                                        required autoFocus 
                                                    />
                                                </div>
                                                <div style={{ margin: '16px 0', padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>Estimated Total Cost:</p>
                                                    <h3 style={{ marginTop: '4px' }}>
                                                        {CURRENCIES[currency]}{(parseFloat(investAmount || 0) * selectedAsset.usd * (rates[currency] || 1)).toLocaleString()}
                                                    </h3>
                                                </div>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '32px' }}>
                                                    <button type="button" className="btn" onClick={() => setIsInvestModalOpen(false)}>Cancel</button>
                                                    <button type="submit" className="btn btn-primary">Confirm Buy</button>
                                                </div>
                                            </form>
                                        </motion.div>
                                    </div>
                                )}
                            </AnimatePresence>
                            
                            <div style={{ marginTop: '40px', padding: '24px', background: 'rgba(131, 56, 236, 0.05)', borderRadius: '12px', border: '1px dashed var(--primary)' }}>
                                <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>🔐 DeFi Integrated Wallet</h3>
                                <p style={{ color: 'var(--text-dim)', marginTop: '8px' }}>Use your blockchain ledger above to verify crypto investments and NFT holdings securely.</p>
                            </div>
                        </motion.div>
                    )}

                    {activePage === 'analytics' && (
                        <motion.div key="analytics" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card" style={{ padding: '32px' }}>
                            <h3>Monthly Financial Comparison</h3>
                            <ResponsiveContainer width="100%" height={450}>
                                <BarChart data={getMonthlyChartData()} margin={{ top: 40 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff1a" />
                                    <XAxis dataKey="name" stroke="#94a3b8" />
                                    <YAxis stroke="#94a3b8" />
                                    <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '12px' }} />
                                    <Legend />
                                    <Bar dataKey="income" fill="#10b981" radius={[6, 6, 0, 0]} />
                                    <Bar dataKey="expense" fill="#ef4444" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </motion.div>
                    )}

                    {activePage === 'leaderboard' && (
                        <motion.div key="leader" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card" style={{ padding: '32px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                                <div>
                                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><Trophy color="#FFD700" /> Savings Leaderboard</h2>
                                    <p style={{ color: 'var(--text-dim)' }}>Top savers who have opted in to the global competition.</p>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <span style={{ fontSize: '0.9rem' }}>{isOptedIn ? '🏆 Opted In' : '❌ Opted Out'}</span>
                                    <button className="btn" style={{ background: isOptedIn ? '#ef4444' : '#10b981', color: 'white', padding: '10px 20px', fontSize: '0.9rem' }} onClick={toggleLeaderboard}>
                                        {isOptedIn ? 'Stop Competing' : 'Participate Now'}
                                    </button>
                                </div>
                            </div>
                            
                            {leaderboard.length === 0 ? (
                                <p style={{ textAlign: 'center', padding: '40px', color: 'var(--text-dim)' }}>No competitors yet. Be the first to join!</p>
                            ) : (
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead><tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                                        <th style={{ padding: '16px' }}>Rank</th>
                                        <th>Saver</th>
                                        <th>Savings Rate</th>
                                        <th>Status</th>
                                    </tr></thead>
                                    <tbody>
                                        {leaderboard.map((item, index) => (
                                            <tr key={index} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                <td style={{ padding: '20px', fontWeight: 800, fontSize: '1.2rem', color: index < 3 ? '#FFD700' : 'white' }}>#{index + 1}</td>
                                                <td style={{ fontWeight: 600 }}>{item.name}</td>
                                                <td style={{ fontWeight: 700, color: '#10b981' }}>{item.savingPercent}%</td>
                                                <td>{index === 0 ? '👑 Master' : index < 3 ? '🥈 Pro' : '🥉 Participator'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </motion.div>
                    )}

                    {activePage === 'debug' && (
                        <motion.div key="debug" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card" style={{ padding: '32px' }}>
                            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '32px' }}>
                                <Menu size={40} color="var(--primary)" />
                                <div>
                                    <h2>Data Integrity Diagnostic</h2>
                                    <p style={{ color: 'var(--text-dim)' }}>Verifying your database synchronization matches.</p>
                                </div>
                            </div>
                            <div className="glass-card" style={{ padding: '24px', background: 'rgba(255,255,255,0.02)' }}>
                                <p><strong>Logged-In User ID:</strong> {token ? JSON.parse(atob(token.split('.')[1])).id : 'N/A'}</p>
                                <p style={{ marginTop: '16px' }}><strong>Status:</strong> {transactions.length > 0 ? '✅ Data records found for this user' : '❌ No data records found for this user'}</p>
                                <p style={{ marginTop: '8px' }}>Total Records: {transactions.length}</p>
                                <div style={{ marginTop: '32px', padding: '20px', border: '1px solid var(--border)', borderRadius: '12px' }}>
                                    <h4 style={{ marginBottom: '16px' }}>🔧 Manual Repair</h4>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-dim)', marginBottom: '16px' }}>Clicking this will force a deep scan with your exact current ID.</p>
                                    <button className="btn btn-primary" onClick={async () => {
                                        await fetchData();
                                        alert('Scan complete! If Balance is still $0, try adding a test transaction.');
                                    }}>Sync Database Now</button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

            </main>

            {/* AI Chatbot */}
            <div style={{ position: 'fixed', bottom: '32px', right: '32px', zIndex: 1000 }}>
                <AnimatePresence>
                    {isChatOpen && (
                        <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card" style={{ width: '350px', height: '450px', marginBottom: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ padding: '16px', background: 'var(--primary)', display: 'flex', justifyContent: 'space-between' }}>
                                <span>🤖 AI Assistant</span>
                                <X size={18} style={{ cursor: 'pointer' }} onClick={() => setIsChatOpen(false)} />
                            </div>
                            <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
                                {chatMessages.map((m, i) => (
                                    <div key={i} style={{ marginBottom: '12px', textAlign: m.role === 'user' ? 'right' : 'left' }}>
                                        <div style={{ 
                                            display: 'inline-block', 
                                            padding: '12px', 
                                            borderRadius: '12px', 
                                            background: m.role === 'user' ? 'var(--primary)' : 'rgba(255,255,255,0.05)', 
                                            fontSize: '0.9rem',
                                            maxWidth: '90%',
                                            whiteSpace: 'pre-line' 
                                        }}>
                                            {m.text}
                                            {m.link && (
                                                <a 
                                                    href={m.link} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    style={{ 
                                                        display: 'flex', 
                                                        alignItems: 'center', 
                                                        gap: '8px', 
                                                        marginTop: '12px', 
                                                        padding: '10px', 
                                                        background: 'rgba(255,255,255,0.1)', 
                                                        borderRadius: '8px',
                                                        color: 'white',
                                                        textDecoration: 'none',
                                                        fontSize: '0.85rem',
                                                        border: '1px solid rgba(255,255,255,0.2)'
                                                    }}
                                                >
                                                    <ShieldCheck size={16} /> View Insurance Plans <ExternalLink size={14} />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <form onSubmit={handleChat} style={{ padding: '16px', borderTop: '1px solid var(--border)' }}>
                                <input placeholder="Ask me anything..." value={userInput} onChange={e => setUserInput(e.target.value)} style={{ margin: 0 }} />
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>
                <button onClick={() => setIsChatOpen(!isChatOpen)} style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--primary)', border: 'none', color: 'white', cursor: 'pointer', boxShadow: '0 8px 32px rgba(131, 56, 236, 0.4)' }}>
                    <ChartIcon size={24} />
                </button>
            </div>
        </div>
    );
};

export default App;
