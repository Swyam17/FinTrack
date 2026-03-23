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
- **Dynamic Dashboard:** Real-time calculation of total balance, income, and expenses with currency conversion support!

### 📈 Smart Investment Portfolio
- **Asset Tracker:** Live price monitoring for **Gold (🏆)**, **Silver (💍)**, **Bitcoin**, and **Ethereum**.
- **Instant Buy:** One-click investment logging—select an asset, enter the units, and the app automatically logs the purchase using live market rates.

### 🛡️ Secure Infrastructure
- **Hybrid Database:** Uses **MySQL** for robust user session management and **MongoDB** for flexible, high-performance transaction storage.
- **Blockchain Ledger:** Every transaction is cryptographically hashed (SHA-256) to ensure transparency and prevent data tampering.

### 🤖 Intelligence & Social
- **Budget Alerts:** Immediate visual notifications when your spending exceeds 50%, 75%, or 100% of your total income.
- **AI Insights:** Automated financial advice based on your current savings rate and spending categories.
- **Savings Leaderboard 🏆:** Opt-in to the community and compete globally for the highest savings rate!

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
