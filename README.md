# CoinPulse ⚡ — Crypto Screener & Real-Time Trading Terminal

**CoinPulse** is a high-frequency cryptocurrency screening app and live market terminal built with Next.js 15 (App Router), React 19, TypeScript, TailwindCSS, and Lightweight-Charts. It features interactive technical candlestick charts, instant token search, currency conversion, and real-time live price and order book streaming.

---

## 🚀 Features

- **📈 Real-Time Candlestick Charts**: High-performance interactive trading charts powered by `lightweight-charts`.
- **⚡ Live Streaming Data**: Real-time ticker price updates, recent order book trade history, and streaming candlestick updates via WebSockets.
- **🔍 Instant Command Palette Search (`⌘K`)**: Quick token lookup powered by SWR and CoinGecko search APIs.
- **💱 Live Crypto Converter**: Instant multi-currency crypto-to-fiat conversion tool.
- **📊 Comprehensive Coins Directory**: Paginated directory of cryptocurrency market rankings, 24h price changes, market caps, and market metrics.
- **🛡️ Secure Backend Architecture**: Built-in Server Actions isolate sensitive API credentials from the client browser.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
- **Language**: TypeScript
- **Styling**: Tailwind CSS & Shadcn/UI primitives
- **Data Fetching**: Next.js Server Actions & [SWR](https://swr.vercel.app/)
- **Market Data APIs**: CoinGecko Demo REST API & Binance Public WebSocket API
- **Charts**: `lightweight-charts` by TradingView

---

## 📂 Architecture Overview (For MERN Developers)

In traditional **MERN** applications, frontend (React) and backend (Express API server) are separate codebases running on different ports. 

In **Next.js Fullstack Architecture**, both frontend and backend exist in a unified project:

- **Server-Side Backend (`'use server'`)**:
  - Located in [`lib/coingecko.actions.ts`](file:///Users/anshrai/Desktop/repo/Crypto-Trading/lib/coingecko.actions.ts).
  - Server Actions execute **strictly on the Node.js server**. They use your `COINGECKO_API_KEY` to fetch data from CoinGecko without ever exposing API keys to client browsers.
- **Client-Side UI (`'use client'`)**:
  - Interactive components like [`SearchModel.tsx`](file:///Users/anshrai/Desktop/repo/Crypto-Trading/components/SearchModel.tsx), [`Converter.tsx`](file:///Users/anshrai/Desktop/repo/Crypto-Trading/components/Converter.tsx), and [`useCoinGeckoWebSocket.ts`](file:///Users/anshrai/Desktop/repo/Crypto-Trading/components/hooks/useCoinGeckoWebSocket.ts) run in the browser to handle user input, state, and live WebSocket connections.

---

## ⚙️ Environment Variables

Create a `.env.local` file in the root directory:

```env
# Server-side environment variables (Hidden from browser)
COINGECKO_BASE_URL=https://api.coingecko.com/api/v3
COINGECKO_API_KEY=your_coingecko_api_key_here

# Client-side environment variables (Optional - auto-falls back to Binance Free WebSocket)
NEXT_PUBLIC_COINGECKO_API_KEY=
NEXT_PUBLIC_COINGECKO_WEBSOCKET_URL=wss://stream.coingecko.com/v1
```

---

## 🌐 Deploying to Vercel

The recommended platform to deploy Next.js applications is **Vercel** (the creators of Next.js).

### Step-by-Step Deployment:

1. **Push your code to GitHub / GitLab / Bitbucket**.
2. Go to [Vercel](https://vercel.com) and click **Add New Project**.
3. Import your `Crypto-Trading` repository.
4. In the **Environment Variables** section, add:
   - `COINGECKO_BASE_URL` = `https://api.coingecko.com/api/v3`
   - `COINGECKO_API_KEY` = `your_coingecko_api_key`
5. Click **Deploy**. Vercel will build and deploy your project automatically in under 1 minute!

---

## 💻 Local Development Setup

```bash
# 1. Install dependencies
npm install

# 2. Run the development server
npm run dev

# 3. Open local server
# Navigate to http://localhost:3000 in your browser
```
