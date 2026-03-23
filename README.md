# ✨ FINTRACK: Premium Full-Stack Expense & Asset Tracker

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-00000f?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)

**FINTRACK** is a modern, full-stack financial management platform designed with a high-end Glassmorphism aesthetic. It goes beyond simple expense tracking by integrating live asset prices for precious metals and cryptocurrencies, allowing users to build and monitor their investment portfolios in real-time.

---

## 🌟 Key Features

### 💎 Premium Interface
- **Glassmorphism UI:** Stunning frosted-glass effect with clean animations using Framer Motion.
- **Dynamic Dashboard:** Real-time calculation of total balance, income, and expenses with **global currency support** (USD, INR, EUR, GBP).

### 📈 Real-Time Asset Tracking
- **Live Market Feed:** Background tracking system refreshes prices every **30 seconds**.
- **Asset Coverage:** Monitor **Gold (🏆)**, **Silver (💍)**, **Bitcoin**, **Ethereum**, **BNB**, and **XRP** in your selected currency.
- **Instant Buy:** One-click investment logging—select an asset, enter the units, and the app automatically logs the purchase using live market rates.

### 🛡️ Secure Infrastructure
- **Hybrid Database:** Uses **MySQL** for robust user session management and **MongoDB** for flexible, high-performance transaction storage.
- **Blockchain Ledger:** Every transaction is cryptographically hashed (SHA-256) to ensure transparency and prevent data tampering.

### 🤖 FinBot: AI Financial Assistant
- **Smarter Insights:** Ask about "savings" or "managing money" for specialized advice using the 50/30/20 rule and category analysis.
- **Market Recommendations:** Get instant price checks and investment suggestions via chat.
- **Intent Recognition:** Understands greetings and financial queries with personalized, context-aware responses.

### 🤝 Strategic Insurance Partnership
- **Integrated Protection:** Direct access to **Tata AIA Insurance** plans within the dashboard and sidebar.
- **Verified Recommendations:** FinBot proactively suggests insurance for long-term wealth security during investment planning.
- **Promoted Offers:** Premium visual banners for exclusive user-only insurance eligibility checks.

---

## 🚀 Tech Stack

- **Frontend:** React 18, Vite, Framer Motion, Lucide Icons, Recharts, Axios.
- **Backend:** Node.js, Express.js, JWT, Bcrypt.
- **Databases:** MySQL (User Auth), MongoDB (Transactions).
- **APIs:** Coingecko (Crypto/Metals), ExchangeRate-API (Currency Conversion).

---

## 🛠️ Installation & Setup

### 1. Prerequisites
- [Node.js](https://nodejs.org/) installed on your machine.
- [XAMPP](https://www.apachefriends.org/) (for MySQL).
- [MongoDB Community Server](https://www.mongodb.com/try/download/community) running locally.

### 2. Database Configuration
1. Start **Apache** and **MySQL** in XAMPP.
2. Go to `http://localhost/phpmyadmin` and create a database named `dailyexpense`.
3. Import the `PersonalExpenseTracker.sql` file provided in the root directory.

### 3. Environment Setup
Create a `.env` file in the `/server` directory:
```env
PORT=5001
MONGO_URI=mongodb://localhost:27017/expenseTracker
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=
MYSQL_DB=dailyexpense
JWT_SECRET=fintrack_secret_321
```

### 4. Running the App
From the project root:
```bash
# Install dependencies for both frontend and backend
npm run install:all

# Run both Client and Server concurrently
npm run dev
```
The app will open at: `http://localhost:3000`

---

## 🛡️ Integrity Check
Use the **Integrity Check** tab in the sidebar to perform a deep scan of your data synchronization between MongoDB and your local profile. It verifies that your User ID matches perfectly every time.

---

## 📄 License
Distributed under the MIT License. See `LICENSE.md` for more information.
