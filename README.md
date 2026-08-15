# 📊 Shared Finance & Expense Splitting App Simulator

A high-fidelity mobile application simulator designed to manage shared finances, split bills, and track net balances between spouses, partners, or roommates. The application features a fully interactive Android Material 3 simulated environment, dynamic calculations, real-time dual-device sync simulator, and an automated visual testing suite.

[![Tech Stack](https://img.shields.io/badge/Tech%20Stack-React%20%7C%20TypeScript%20%7C%20Tailwind-blue)](https://github.com)
[![React](https://img.shields.io/badge/React-19.0-blue.svg?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-38bdf8.svg?logo=tailwind-css)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646cff.svg?logo=vite)](https://vite.dev/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 📱 Interactive Demo Preview

The application offers multiple viewing modes:
1. **Phone App Mode**: Explores the app inside a simulated Android device frame (complete with status bar, bottom navigation, and Material 3 design).
2. **Screen Gallery Mode**: View all app screens side-by-side categorized into Core, Transactions, Management, and Architecture.
3. **Dual-Device Sync Mode**: Interact with two simulated devices simultaneously (e.g. Husband's phone and Wife's phone) to see changes sync in real-time.
4. **Test Suite Mode**: Execute the unit and integration tests visually with live status reporting.

---

## ⚡ Key Features

* **📱 Android Device Frame Simulation**: Realistically simulates Android gestures, system toasts, active top status bars (wifi, signal, battery, system time), and fluid Material 3 animations.
* **🔄 Dual-Device Real-Time Sync**: Simulates a two-device ecosystem. Any transaction, category update, or account change recorded on one device instantly reflects on the other, displaying real-time net balances.
* **💸 Flexible Expense Splitting**: Supports splitting shared expenses in three modes:
  - **Equal shares**: Automatically divides the cost among group members.
  - **Percentages**: Customize splits by percentage (with automatic validation to ensure shares add up to 100%).
  - **Exact Amounts**: Allocate exact custom amounts to each user (with validation to ensure they match the total expense).
* **🏦 Accounts & Wallets Manager**: Add and manage multiple accounts including credit cards, bank accounts, UPI apps, and cash wallets. Toggle active/inactive states to control payment choices.
* **📁 Customizable Categories**: Add custom expense categories with localized icons (from Lucide React) and personalized color hexes. Active categories can be toggled on/off.
* **🛡️ Permission-Based Deletions**: Enforces strict ledger ownership. Only the creator of an expense, transfer, or settlement is authorized to delete it.
* **🧪 In-App Visual Test Suite**: Run and inspect 15+ built-in test cases covering split validations, settlement math, account states, and role checks directly within the application's interface.

---

## 🛠️ Tech Stack & Libraries

* **Framework**: React 19.0.1 (utilizing modern functional components & hooks)
* **Language**: TypeScript (Type-safe schema modeling for transactions, accounts, and balances)
* **Styling**: Tailwind CSS v4.0 (incorporating CSS-based design systems and Material 3 color palettes)
* **Icons**: Lucide React (clean, scalable vector icons)
* **Build Tool**: Vite 6.2.3 (fast hot module replacement and build configurations)
* **Simulator Engine**: Custom in-memory mock storage and real-time event system.

---

## 📂 Project Structure

```
├── .github/              # GitHub configurations
├── public/               # Static assets & public folder
├── src/
│   ├── components/       # UI Components
│   │   ├── screens/      # Screen-specific Views (Dashboard, Accounts, Settle, etc.)
│   │   ├── AndroidFrame.tsx          # Simulated device layout
│   │   ├── AndroidTopBar.tsx         # Simulated top bar (wifi, time)
│   │   ├── AndroidBottomNav.tsx      # Simulated bottom nav
│   │   ├── TwoDeviceSimulatorView.tsx# Dual-device frame view
│   │   └── ...
│   ├── services/         # Core Logic & Math Engines
│   │   ├── financeEngine.ts          # Split math, category breakdowns, net position calculation
│   │   └── testSuite.ts              # In-memory test cases and mock data
│   ├── types.ts          # TypeScript type definitions (Transaction, Group, Member, splits, etc.)
│   ├── mockData.ts       # Seeds and initial mock entries
│   ├── App.tsx           # Global state manager & main application
│   ├── main.tsx          # Application entry point
│   └── index.css         # Tailwind directives & global styling
├── package.json          # Dependency manifest
├── tsconfig.json         # TypeScript configurations
└── vite.config.ts        # Vite compiler rules
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) installed (v18.x or above recommended).

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/<your-username>/shared-finance-&-expense-splitting.git
   cd shared-finance-&-expense-splitting
   ```

2. **Install Dependencies**
   ```bash
   npm install
   # or using Bun:
   bun install
   ```

3. **Set Up Environment Variables**
   Copy the sample environment file and configure variables:
   ```bash
   cp .env.example .env.local
   ```
   *Note: This app runs entirely in the browser using mock databases, but can be configured to connect to your custom Gemini API or backend server via `.env.local`.*

4. **Run the Development Server**
   ```bash
   npm run dev
   # or:
   bun run dev
   ```
   The local server will start, typically at `http://localhost:3000`.

5. **Build for Production**
   ```bash
   npm run build
   ```
   This generates a static optimization bundle in the `dist` folder, ready for deployment to platforms like Netlify, Vercel, or GitHub Pages.

---

## 🧪 Testing the Engine

To verify the calculations, you can run the test suite directly from the browser:
1. Open the application.
2. Select **Test Suite Mode** from the top header navigation.
3. Click **Run All Tests** to execute the validation suites on the finance calculation engine.
4. All test logs, assertions, and execution speeds will be printed on screen.

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
