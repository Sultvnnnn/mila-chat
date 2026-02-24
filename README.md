# 🧘‍♀️ MILA - MULA Yoga AI Assistant

**MILA** is an intelligent, nurturing virtual assistant designed for **MULA Yoga Studio**. Built using **RAG (Retrieval-Augmented Generation)** technology, Mila helps members check schedules, understand pricing, and manage class bookings with a human-like, supportive persona.

![MULA Yoga Banner](https://placehold.co/1200x400/F3E5F5/4A148C?text=MILA+AI+Assistant)

## 🚀 Key Features (Week 2 Completed)

### 🧠 Advanced RAG Engine
- **Hybrid Search:** Combines semantic search (OpenAI Embeddings) with keyword matching using **Supabase pgvector** for high accuracy.
- **Knowledge Base:** Indexed from real studio PDFs (Schedules, Pricing, Locations, Policies).
- **Anti-Hallucination:** Strictly strictly answers based on indexed data; admits ignorance politely when data is missing.

### 🤖 Persona Engineering
- **Nurturing Tone:** Calibrated to sound like a supportive "Yoga Senior" (Warm, Friendly, Professional).
- **Context Awareness:** Understands "Today", "Tomorrow", and specific dates based on real-time server checking.
- **Multilingual:** Automatically detects and responds in **Indonesian** (Natural/Luwe) or **English** based on user input.

### ⚡ Business Logic Guardrails
- **Smart Rescheduling:** Calculates time difference between *Current Time* and *Class Time*. Automatically rejects reschedule requests if the gap is **< 3 hours** (per studio policy).
- **Location Intelligence:** Distinguishes facilities between **KAIA Studio (Jakarta)** and **Svasana (Depok)**, reminding users to bring mats where necessary.
- **Safety First:** Filters out medical advice and directs health concerns to human staff.

## 🛠️ Tech Stack

- **Framework:** [Next.js 14](https://nextjs.org/) (App Router)
- **Language:** TypeScript
- **Database:** [Supabase](https://supabase.com/) (PostgreSQL + pgvector)
- **AI Models:**
  - **Embeddings:** OpenAI `text-embedding-3-small`
  - **Generation:** Anthropic `claude-3-haiku-20240307`
- **Styling:** Tailwind CSS (Coming in Week 3)

## 📂 Project Structure

```bash
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── chat/       # Main RAG & Logic Pipeline
│   │   │   └── seed/       # Knowledge Base Seeding Script
│   │   └── page.tsx        # Chat Interface (In Progress)
│   ├── lib/
│   │   ├── openai.ts       # Embedding Generator
│   │   └── supabase.ts     # DB Connection
│   └── utils/              # Helper functions
└── ...
