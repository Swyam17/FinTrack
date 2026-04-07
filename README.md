# ✨ FINTRACK: “AI-Powered Personal Finance & Risk Management System”

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge\&logo=react\&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge\&logo=node.js\&logoColor=white)](https://nodejs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-00000f?style=for-the-badge\&logo=mysql\&logoColor=white)](https://www.mysql.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge\&logo=mongodb\&logoColor=white)](https://www.mongodb.com/)

---

## 💡 Overview

**FINTRACK** is a modern, full-stack financial management platform designed with a premium **Glassmorphism UI**.
It goes beyond traditional expense tracking by integrating **real-time asset tracking**, **AI-powered insights**, and **secure transaction systems**, enabling users to manage both **expenses and investments in one place**.

---

## 🌟 Key Features

### 💎 Premium User Experience

* Glassmorphism UI with smooth animations using **Framer Motion**
* Fully responsive and visually rich dashboard
* Real-time balance updates (Income, Expenses, Net Worth)
* 🌍 Multi-currency support: USD, INR, EUR, GBP

---

### 📈 Real-Time Asset Tracking

* 🔄 Auto-refresh market data every **30 seconds**
* Supports:

  * 🥇 Gold & Silver
  * ₿ Bitcoin
  * Ξ Ethereum
  * BNB, XRP
* ⚡ One-click investment logging using live prices

---

### 🛡️ Secure & Scalable Architecture

* Hybrid database architecture:

  * **MySQL** → Authentication & user sessions
  * **MongoDB** → Transactions & financial data
* 🔐 JWT-based authentication
* 🔒 Password hashing with Bcrypt
* ⛓️ SHA-256 hashing for transaction integrity (blockchain-inspired)

---

### 🤖 FinBot: AI Financial Assistant

* 📊 Smart financial insights (50/30/20 rule)
* 💬 Conversational query handling
* 📈 Real-time price suggestions & investment tips
* 🧠 Intent recognition for personalized responses

---

### 🤝 Insurance Integration

* Integration with **Tata AIA Insurance**
* Context-aware suggestions by FinBot
* Embedded UI for exploring insurance plans
* Focus on long-term financial security

---

## 🚀 Tech Stack

**Frontend**

* React 18
* Vite
* Framer Motion
* Recharts
* Axios
* Lucide Icons

**Backend**

* Node.js
* Express.js
* JWT Authentication
* Bcrypt

**Database**

* MySQL (User Management)
* MongoDB (Transactions)

**APIs**

* CoinGecko API (Crypto & Metals)
* ExchangeRate API (Currency Conversion)

---

## 🛠️ Installation & Setup

### 1️⃣ Prerequisites

* Node.js installed
* XAMPP (for MySQL)
* MongoDB Community Server running locally

---

### 2️⃣ Database Setup

1. Start Apache & MySQL via XAMPP
2. Open: `http://localhost/phpmyadmin`
3. Create database: `dailyexpense`
4. Import: `PersonalExpenseTracker.sql`

---

### 3️⃣ Environment Configuration

Create `.env` inside `/server`:

```env
PORT=5001
MONGO_URI=mongodb://localhost:27017/expenseTracker
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=
MYSQL_DB=dailyexpense
JWT_SECRET=fintrack_secret_321
```

---

### 4️⃣ Run Application

```bash
npm run install:all
npm run dev
```

📍 App runs at: `http://localhost:3000`

---

## 🛡️ Data Integrity Check

* Built-in **Integrity Check Module**
* Ensures consistency between MongoDB & user profile
* Verifies user identity mapping and data synchronization

---

## 📸 Screenshots (Add Here)

> Add dashboard, charts, and FinBot UI screenshots for better impact

---

## 🌐 Future Enhancements

* 📱 Mobile App (React Native)
* 🤖 Advanced ML-based expense prediction
* 📊 Portfolio analytics dashboard
* 🔔 Smart alerts & anomaly detection
* 🌍 Cloud deployment (AWS / Vercel)

---

## 👨‍💻 Author

**Swyam Arora**
🎓 CSE (AI & ML), Chandigarh University
🔗 https://github.com/Swyam17

---
