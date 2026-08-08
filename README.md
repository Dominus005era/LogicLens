# 🧠 LogicLens AI — AI Reasoning Analyzer

> **Evaluate *how* arguments are made, not whether the conclusion is true.**

LogicLens AI is an impartial reasoning analyzer powered by Google's **Gemma 4** AI model (`gemma-4-26b-a4b-it`). It evaluates human arguments from Reddit, X, WhatsApp, YouTube, or live debates for logical structure, fallacy detection, evidence backing, tone heatmaps, and constructive rephrasing.

---

## ✨ Features

- 🧠 **Impartial Reasoning Evaluation:** Scores participants on Logic, Evidence, Respectfulness, Clarity, Consistency, and Persuasiveness (1-10 scale).
- ❌ **20+ Fallacies Detection & Library:** Automatically detects Strawman, Ad Hominem, Slippery Slope, Moving Goalposts, Circular Reasoning, False Dilemma, and more with exact quotes.
- 🌡️ **Conversation Tone Heatmap:** Visualizes emotional shifts message-by-message from Calm 🔵 to Defensive 🟡, Aggressive 🟠, or Hostile 🔴.
- 🔍 **Evidence Support Meter:** Categorizes claims into "Supported by facts 🟢", "Assertion without evidence 🟡", or "Contradicted by data 🔴".
- 🕊️ **Calm & Constructive Rewrite:** Re-evaluates heated arguments into respectful, truth-seeking dialogues.
- 🎭 **Historical Persona Mode:** Re-evaluates debates through the perspectives of Aristotle, Socrates, Sherlock Holmes, Elon Musk, or Iron Man.
- 🏆 **Gamification Badges:** Awards badges like `🧠 Rational Thinker`, `🔍 Evidence Hunter`, `🕊️ Respectful Debater`, or `⚠️ Emotion Driven`.
- 📊 **Debate Coach Scorecard:** Computes an overall score out of 100 with actionable improvement tips.
- ⚡ **1-Click Preset Debates:** Quick load sample arguments on EVs, AI Ethics, Remote Work, Mars vs Moon, and Social Media.

---

## 🛠️ Tech Stack

- **Frontend:** HTML5, Modern CSS3 (Dark Theme, Glassmorphism, CSS Variables, Animations), Modular Vanilla JavaScript.
- **Backend:** Node.js, Express, Cors, Dotenv.
- **AI Model:** Google Gemma 4 (`gemma-4-26b-a4b-it`) via REST API.

---

## 🚀 Quick Setup & Local Run

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Ensure your `.env` contains:
```env
GEMMA_API_KEY=your_gemma_api_key_here
GEMMA_MODEL=gemma-4-26b-a4b-it
PORT=3000
```
> **Security Note:** `.env` is strictly ignored by `.gitignore` to prevent API key leaks.

### 3. Start the Server
```bash
npm start
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔗 Repository
GitHub Repository: [https://github.com/Dominus005era/LogicLens.git](https://github.com/Dominus005era/LogicLens.git)
