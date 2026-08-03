# Gesenu (解せぬを、解せるへ。)
### From "I don't get it" to "I get it" — A Context-First Japanese Vocabulary Learning System

> 🚧 **Status: In active development.** Core pipeline is functional; study loop and auth are in progress.

---

Have you ever hit a Japanese sentence and thought *"I don't get this"* (**解せぬ**)? **Gesenu** turns those moments into vocabulary that sticks — by capturing the word *in the sentence you found it*, not in an abstract list.

---

## 🚀 Key Features

- **Sentence-Driven Capture** — Paste any Japanese sentence. SudachiPy tokenizes and normalises inflected forms back to dictionary lemmas (走った → 走る), filtering by POS so you only save meaningful vocabulary.
- **Context-Bound Cards** — Jisho API enriches each word with meaning, reading, and JLPT level. Every card stays bound to the original sentence, so context disambiguates meaning.
- **FSM Progress Tracking** — Card state (`New → Learning → Known → Mastered`) is an explicit state machine; invalid transitions are impossible by construction.
- **Optimistic Reviews** — Flashcard reviews update instantly and reconcile in the background. A failed write rolls back visibly rather than silently drifting.
- **Masked Recall Testing** — Active recall by filling the target word back into its original sentence context.
- **Compile-Time Contracts** — TypeScript types are generated from the FastAPI OpenAPI schema at build time; a frontend/backend mismatch fails the build.
- **Scrollytelling Landing Page** — Native CSS scroll-snap landing page with a persistent canvas particle animation: surface tokens morph into dictionary lemmas across 5 stages, then converge into 5 colour-coded Hanafuda deck stacks at the bottom of the viewport.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React + TypeScript (Vite), Vanilla CSS |
| **Backend** | FastAPI (Python) |
| **Database** | SQLite (dev) / Supabase PostgreSQL (production) |
| **Auth** | Supabase Auth (OAuth2 / social login) |
| **Japanese Parsing** | SudachiPy (tokenization, lemmatization) |
| **Dictionary** | Jisho API + local JMdict fallback |
| **Contracts** | OpenAPI (FastAPI) → generated TypeScript types |
| **Deployment** | Vercel (frontend) · Render / Railway (backend) |

---

## 🗺️ Roadmap

| Phase | Status | Scope |
|---|---|---|
| **Design & Planning** | ✅ Done | Pipeline design, data model, scope decisions |
| **Backend Foundation** | ✅ Done | FastAPI, SudachiPy parsing, Jisho lookup, OpenAPI → TS generation, DB schema |
| **Encounter Workflow** | ✅ Done | Sentence input → token parsing → Jisho lookup → save to deck |
| **Study UI & FSM** | ✅ Done | Hanafuda arc deck browser, flashcard session, FSM state pills, optimistic UI |
| **Landing Page** | ✅ Done | Scrollytelling layout, 5-stage canvas animation, deck convergence |
| **Auth** | 🔲 In progress | Supabase Auth (social login), protected endpoints |
| **Recall Test** | 🔲 Upcoming | Masked-sentence fill-in-the-blank session |
| **Deployment** | 🔲 Upcoming | Vercel + Render/Railway live environment |

---

## 💡 Core Philosophy: Context Over Isolation

Traditional vocab study matches isolated words to definitions — leading to fragile memory that doesn't hold in real reading. Gesenu enforces **Context-First Learning**:

1. You only save words you've *actually encountered* in real Japanese media.
2. Every card is bound to its original sentence.
3. Recall tests ask you to fill in the blank inside that sentence.

Vocabulary learned in syntactic context carries grammar patterns, collocations, and particle use — moving you from *解せぬ* to *解せる* far faster.
