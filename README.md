# 🧘‍♀️ MILA - MULA Yoga AI Assistant

**MILA** is an intelligent, nurturing virtual assistant designed for **MULA Yoga Studio**. Built using **RAG (Retrieval-Augmented Generation)** technology, Mila helps members check schedules, understand pricing, and manage class bookings with a human-like, supportive persona.

![MULA Yoga Banner](https://placehold.co/1200x400/F3E5F5/4A148C?text=MILA+AI+Assistant)

---

## 🚀 Key Features

### 🧠 Advanced RAG Engine
- **Hybrid Search:** Combines semantic search (OpenAI Embeddings) with keyword matching using **Supabase pgvector** for high accuracy.
- **Knowledge Base:** Indexed from real studio PDFs (Schedules, Pricing, Locations, Policies).
- **Anti-Hallucination:** Strictly answers based on indexed data; admits ignorance politely when data is missing.

### 🗄️ Admin CMS & Knowledge Management (New!)
- **Full CRUD System:** Create, Read, Update, and Delete knowledge base documents directly from a secure admin dashboard.
- **Dual-Language Control:** Seamlessly toggle and manage Indonesian (`knowledge_entries`) and English (`documents_en`) database tables.
- **Modern & Safe UI/UX:** Built with Shadcn UI featuring smooth dropdowns, smart routing (`/admin/knowledge/[id]/edit`), and protective Alert Dialogs to prevent accidental data loss.

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
| UI Components | Tailwind CSS + [shadcn/ui](https://ui.shadcn.com/) |

---

## 📂 Project Structure
```text
├── src
│   ├── app
│   │   ├── (auth)
│   │   │   └── login/page.tsx
│   │   ├── admin                 # Admin CMS Dashboard
│   │   │   ├── knowledge
│   │   │   │   ├── [id]/edit/page.tsx  # Dynamic Edit Form
│   │   │   │   ├── new/page.tsx        # Create Data Form
│   │   │   │   └── page.tsx            # Data Table & Delete Logic
│   │   │   ├── conversations/page.tsx
│   │   │   ├── settings/page.tsx
│   │   │   ├── tools/page.tsx
│   │   │   ├── layout.tsx        # Admin Sidebar & Layout
│   │   │   └── page.tsx          # Admin Overview
│   │   ├── api
│   │   │   ├── _seed/route.ts    # Seed script to Supabase
│   │   │   └── chat/route.ts     # RAG pipeline: embed → search → Claude → reply
│   │   ├── layout.tsx            # Root layout
│   │   └── page.tsx              # Public Chat UI
│   ├── components
│   │   ├── ui                    # shadcn/ui components (alert-dialog, select, etc.)
│   │   ├── AnimatedGreeting.tsx
│   │   └── ThemeToggle.tsx
│   └── lib
│       ├── data/yogaData.ts      # Q&A knowledge base
│       ├── prompts/systemPrompt.ts
│       ├── openai.ts             # OpenAI embedding helper
│       └── supabase.ts           # Supabase client
├── middleware.ts
├── tailwind.config.ts
└── tsconfig.json
```
---

## 🛠️ Database Setup (Seeding)

This app uses Supabase as a Vector Database. To seed the initial knowledge base, follow these steps:

1. Make sure the app is running locally (`npm run dev`).
2. Open the `src/app/api/_seed` folder and temporarily rename it to `seed` (remove the underscore).
3. Open your browser or Postman and visit: `http://localhost:3000/api/seed` **ONCE ONLY**.
4. Wait for the process to complete. Check your Supabase dashboard to confirm the data from `lib/yogaData.ts` has been inserted.
5. **IMPORTANT:** Rename the folder back to `_seed` to prevent this route from being exposed in production and avoid build errors during `npm run build`.

---

## 🚦 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Sultvnnnn/mila-chat.git
cd mila-chat
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

- [x] ~~Week 1: Project Setup & Database Schema~~
- [x] ~~Week 2: Backend RAG Logic, Seeding, & Persona Tuning~~
- [x] ~~Week 3: Frontend UI (Chat Bubble, Animations, Responsive Design)~~
- [ ] Week 4: Deployment & Final Polish

---

Created with ❤️ by Sultvnnnn.
