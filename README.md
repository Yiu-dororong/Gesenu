# Gesenu 

**Learn words where you found them.** 

> 🚧 **Status: In active development.** Core pipeline is functional; study loop and auth are in progress.

---

Language learning happens everywhere, books, anime, news, games, and more. We believe every unfamiliar word belongs with the context where you found it, not as an isolated dictionary entry. Gesenu captures both the word and its original context, helping you build understanding instead of simply memorizing definitions.

*解せぬを、解せるへ*

---

## 🚨 The Problem: Scattered Knowledge

Japanese learning often leaves learners struggling with fragmented, fragile vocabulary:

- **Vocabulary is fragmented** — Words encountered across books, anime, news, and social media are difficult to organize without losing the context in which they appeared.
- **Generic lists waste effort** — Studying pre-made vocabulary decks is inefficient because they inevitably mix words you already know with words you don't.
- **Meaning alone is not enough** — Memorizing dictionary definitions in isolation leaves words fragile; without original sentence context and particle usage, words evaporate quickly within days and remain hard to apply in real reading.

---

## 🚀 Key Features

Gesenu follows a simple learning loop: encounter → study → test. Capture vocabulary from real Japanese, organize it into context-bound cards, then reinforce it through sentence-based active recall.

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

## 🎯 Who is Gesenu for?

Gesenu is designed primarily for **intermediate and advanced Japanese learners** who regularly encounter vocabulary through authentic content such as books, anime, games, news, and online discussions.

If you're just beginning Japanese, traditional vocabulary lists and beginner textbooks are often a more effective way to build a core vocabulary. Once you start learning from real-world content, Gesenu helps turn those encounters into context-bound vocabulary that is easier to retain and revisit.