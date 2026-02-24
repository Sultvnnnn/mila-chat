# 🧘‍♀️ MILA - MULA Yoga AI Assistant

**MILA** is an intelligent, nurturing virtual assistant designed for **MULA Yoga Studio**. Built using **RAG (Retrieval-Augmented Generation)** technology, Mila helps members check schedules, understand pricing, and manage class bookings with a human-like, supportive persona.

![MULA Yoga Banner](https://placehold.co/1200x400/F3E5F5/4A148C?text=MILA+AI+Assistant)

---

## 🚀 Key Features (Week 2 Completed)

### 🧠 Advanced RAG Engine
- **Hybrid Search:** Combines semantic search (OpenAI Embeddings) with keyword matching using **Supabase pgvector** for high accuracy.
- **Knowledge Base:** Indexed from real studio PDFs (Schedules, Pricing, Locations, Policies).
- **Anti-Hallucination:** Strictly answers based on indexed data; admits ignorance politely when data is missing.

### 🤖 Persona Engineering
- **Nurturing Tone:** Calibrated to sound like a supportive "Yoga Senior" (Warm, Friendly, Professional).
- **Context Awareness:** Understands "Today", "Tomorrow", and specific dates based on real-time server checking.
- **Multilingual:** Automatically detects and responds in **Indonesian** (Natural/Luwe) or **English** based on user input.

### ⚡ Business Logic Guardrails
- **Smart Rescheduling:** Calculates time difference between *Current Time* and *Class Time*. Automatically rejects reschedule requests if the gap is **< 3 hours** (per studio policy).
- **Location Intelligence:** Distinguishes facilities between **KAIA Studio (Jakarta)** and **Svasana (Depok)**, reminding users to bring mats where necessary.
- **Safety First:** Filters out medical advice and directs health concerns to human staff.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 14](https://nextjs.org/) (App Router) |
| Language | TypeScript |
| Database | [Supabase](https://supabase.com/) (PostgreSQL + pgvector) |
| Embeddings | OpenAI `text-embedding-3-small` |
| Generation | Anthropic `claude-3-haiku-20240307` |
| Styling | Tailwind CSS |

---

## 📂 Project Structure

```
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── chat/       # Main RAG & Logic Pipeline
│   │   │   └── seed/       # Knowledge Base Seeding Script
│   │   └── page.tsx        # Chat Interface (In Progress)
│   ├── lib/
│   │   ├── data/
│   │   │   └── yogaData.ts # Q&A Knowledge Base
│   │   ├── openai.ts       # Embedding Generator
│   │   └── supabase.ts     # DB Connection
└── ...
```

---

## 🚦 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Sultvnnnn/mula-yoga-ai.git
cd mula-yoga-ai
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

---

## 📅 Roadmap

- [x] Week 1: Project Setup & Database Schema
- [x] Week 2: Backend RAG Logic, Seeding, & Persona Tuning
- [ ] Week 3: Frontend UI (Chat Bubble, Animations, Responsive Design)
- [ ] Week 4: Deployment & Final Polish

---

Created with ❤️ by Sultan Abdul Fatah.
