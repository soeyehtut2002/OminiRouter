# OmniRouter AI Studio 🚀
A modern, responsive, high-performance general-purpose AI Chatbot application powered by [OpenRouter](https://openrouter.ai).

Access 300+ frontier AI models—including **DeepSeek R1, DeepSeek V3, Claude 3.7 Sonnet, GPT-4o, Gemini 2.0 Flash**, and free tier models—all within a single, beautifully crafted web application.

---

## ✨ Features

- **Custom AI Model Adding**: Add any OpenRouter model slug, custom fine-tune, or endpoint yourself via the **"+ Add Custom Model"** button. Custom models persist in `localStorage` under a dedicated **⭐ My Custom Models** filter tab.
- **Model Explorer & Switcher**: Live model browsing across 400+ models with real-time search, filters for **Custom Models**, **Free Models (`:free`)**, **Reasoning / Chain-of-Thought models**, **Flagship**, and **Fast models**.
- **Reasoning / Thinking Process Accordion**: Special support for reasoning models like **DeepSeek R1** and **Gemini Thinking**, displaying thinking processes in a collapsible glowing thought card.
- **Real-Time Streaming**: Low-latency token streaming with an instant stop button (`AbortController`).
- **Markdown & Code Highlighting**: Syntax-highlighted code blocks with one-click copy and language tags powered by `highlight.js` and `marked`.
- **Local History & Multi-Chat**: Multiple conversations with auto-titling, rename, delete, and search saved locally in `localStorage`.
- **System Instruction Presets**: Easily toggle between persona presets (Software Architect, Executive Assistant, Creative Writer, Academic Researcher) or define your own.
- **API Key Security**: Keys are stored exclusively on your device in your browser's local storage and sent only to official OpenRouter endpoints.

---

## 🛠️ Quick Start

### Option 1: Open Directly in Browser
Since this is a standalone modern web application, you can simply double-click or open `index.html` in any modern web browser (Chrome, Edge, Firefox, Brave, Safari).

### Option 2: Run with a Local Static Server
If you prefer running via a local development server:

Using Python:
```bash
python -m http.server 3000
```
Then visit `http://localhost:3000`.

Or using Node:
```bash
npx serve .
```

---

## 🔑 OpenRouter API Key Setup

1. Sign up or log into [OpenRouter](https://openrouter.ai).
2. Go to [OpenRouter Keys](https://openrouter.ai/keys) and generate an API key.
3. In the application:
   - Click the **API Key status pill** in the bottom left sidebar or click **Configure Key** on the welcome screen.
   - Paste your key (`sk-or-v1-...`).
   - Click **Verify Key** to test connection and view your balance.
   - Click **Save Settings**.
4. You are ready to chat! You can select any model, including free models like `deepseek/deepseek-r1:free` or `google/gemini-2.0-flash-exp:free`.
