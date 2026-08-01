# Gesenu (解せぬを、解せるへ。)
### From "I don't get it" to "I get it" — A Context-First Japanese Vocabulary Learning System

> 🚧 **Status: In active development — not yet runnable.** Core pipeline and data model are being designed. This README documents the intended v1 product.

---

Have you ever encountered a Japanese sentence in a book, manga, or news article where you thought, *"I don't get this"* (**解せぬ**)?

**Gesenu** is a full-stack vocabulary acquisition tool designed to turn those moments of confusion into mastery (**解せる**). Instead of forcing you to study abstract, isolated word lists, Gesenu parses raw sentences, extracts candidate words, looks them up, and helps you study them in the exact context you found them.

---

## 🚀 Key Features (v1)

* **Sentence-Driven Capture**: Paste a Japanese sentence directly. Gesenu parses it with **SudachiPy**, handling conjugated/inflected forms (e.g. 走った → 走る) back to dictionary lemmas and filtering by part of speech, so you only study meaningful vocabulary.
* **Context-Bound Word Profiles**: Dictionary lookup (Jisho API + local JMdict fallback) enriches each saved word with meaning, reading, and JLPT level — and every card stays bound to the original sentence it came from, so meaning is disambiguated by context, not guessed in isolation.
* **Instant-feedback reviews with safe rollback**: Flashcard reviews update instantly in the UI and reconcile with the server in the background; a failed write rolls back and surfaces to you rather than silently drifting out of sync — near-zero perceived latency on the interaction you repeat most.
* **Correctness-by-construction progress tracking**: Card progression (`New → Learning → Known → Mastered`) is modeled as an explicit state machine rather than scattered conditionals, so invalid states can't happen and features like "undo last review" come nearly free.
* **Masked-Sentence Recall Testing**: Test active recall by typing the target word back into its original sentence context.
* **Compile-time contract enforcement**: TypeScript types are generated from the backend's OpenAPI schema at build time — a frontend/backend mismatch fails the build instead of shipping as a runtime bug.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React + TypeScript (Vite), Vanilla CSS |
| **Backend** | FastAPI (Python) |
| **Database** | SQLite (dev) / PostgreSQL or Supabase (production) |
| **Auth** | Supabase Auth — OAuth2/OIDC via social login |
| **Japanese Parsing** | SudachiPy (tokenization, lemmatization) |
| **Dictionary** | Jisho API + local JMdict fallback |
| **Contracts** | OpenAPI (FastAPI) → generated TypeScript types |
| **Deployment** | Vercel (frontend) · Render / Railway (backend) |

---

## 🗺️ Roadmap

| Phase | Status | Scope |
|---|---|---|
| **Design & Planning** | ✅ Done | Pipeline design, data model, scope tiers, tech stack decisions |
| **Contract Pipeline & Backend Foundation** | 🔲 Upcoming | FastAPI project, OpenAPI → TS generation (from the first endpoint), DB schema, SudachiPy parsing |
| **Auth** | 🔲 Upcoming | Supabase Auth (social login), protected endpoints |
| **Frontend & Study Loop** | 🔲 Upcoming | React + TS, encounter page, state-machine-driven flashcards with optimistic UI + rollback, recall test |
| **Deployment** | 🔲 Upcoming | Vercel + Render/Railway, live environment |
| **Optional, if time permits** | 🔲 Stretch | OCR input with polished UX, gacha-style arc card layout, basic analytics |

Richer enrichment (similar words, synonyms/antonyms, pitch accent), duplicate-merge UI, and proactive re-engagement (word "drops") are deliberately deferred past v1 — see the full project proposal for the reasoning behind each scope decision.

---

## 💡 The Core Philosophy: Context Over Isolation

Traditional vocabulary study relies on translating isolated words (e.g., matching *かける* to *to hang, to write, to sit*). This leads to cognitive fatigue and failure to apply the word in real speech.

Gesenu enforces **Context-First Learning**:
1. You only save words you've *actually encountered* in real Japanese media.
2. The card is bound to the original sentence.
3. The recall test asks you to fill in the blank inside that sentence.

By learning vocabulary within syntactic context, your brain associates grammar patterns, collocations, and particle use automatically, moving you from *"I don't get it"* to *"I get it"* far faster.
