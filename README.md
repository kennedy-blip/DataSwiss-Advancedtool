# 🛠️ Dataswiss Pro: The All-in-One Data Factory

**Dataswiss** is a high-performance data workstation designed to bridge the gap between raw data gathering and elite business intelligence. Built with a "Swiss Army Knife" philosophy, it handles everything from multi-format file ingestion to AI-powered insights.

## 🚀 Key Features

* **Multi-Format Ingestion:** Drag-and-drop support for CSV and JSON files.
* **High-Speed Transformation:** Powered by **Polars** (Rust-based), ensuring lightning-fast data manipulation even on standard hardware.
* **AI Analyst Integration:** Leverages **Groq (Llama 3)** to generate natural language insights and trend summaries from refined data.
* **Modular Reporting:** One-click Markdown report generation for easy sharing and documentation.
* **Modern UI:** A sleek, dark-themed dashboard built with **React** and **Vite**.

## 🏗️ Technical Stack

- **Frontend:** React, Vite, Axios, Lucide-React
- **Backend:** FastAPI (Python)
- **Data Engine:** Polars
- **LLM Provider:** Groq (Llama-3-8b)
- **Environment Management:** Python-Dotenv

## 📂 Project Structure

```text
Dataswiss/
├── backend/            # FastAPI + Polars Engine
│   ├── app/            # Main logic & API routes
│   └── .env            # Private API Keys (Hidden)
├── frontend/           # React + Vite Dashboard
│   └── src/            # UI Components & Hooks
└── README.md           # Documentation
pip install fastapi uvicorn polars groq python-dotenv python-multipart pandas tabulate
GROQ_API_KEY=your_key_here
python app/main.py
npm install
npm run dev