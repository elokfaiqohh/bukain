# Bukain — AI Powered Iftar Planner & Preorder Platform

This prototype demonstrates a modern, Ramadan-themed web app that recommends iftar meal packages using AI and enables a quick preorder checkout experience.

## Features

- AI-powered meal recommendations based on budget, number of people, and preferences
- Meal package selection and detailed preview
- Checkout form with customer details and pickup time
- Simulated payment flow using a mock Mayar payment page
- Orders persisted in SQLite + restaurant dashboard for order notifications

## Tech stack

- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js + Express
- Database: SQLite (via better-sqlite3)
- AI (optional): OpenAI GPT-3.5 (fallback to local generator if no key provided)

## Getting started

### 1) Install dependencies

```bash
npm install
cd server
npm install
```

### 2) Run in development mode

```bash
npm run dev
```

This starts:

- Frontend: http://localhost:5173
- Backend API: http://localhost:4000

### 3) (Optional) Enable AI recommendations

Create a `server/.env` file with:

```bash
OPENAI_API_KEY=your_openai_api_key
```

Restart the server. If no key is provided, the app will fall back to a local recommendation generator.

## Notes

- The payment page is a demo and does not process real transactions.
- Orders are stored locally in `server/data/bukain.db`.
