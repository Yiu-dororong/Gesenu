# Gesenu (解せぬを、解せるへ。)
### From "I don't get it" to "I get it" — A Context-First Japanese Vocabulary Learning System

> 🚧 **Status: In active development — not yet runnable.** Core pipeline and data model are being designed. This README documents the intended product.

---

Have you ever encountered a Japanese sentence in a book, manga, or news article where you thought, *"I don't get this"* (**解せぬ**)? 

**Gesenu** is a full-stack vocabulary acquisition tool designed to turn those moments of confusion into mastery (**解せる**). Instead of forcing you to study abstract, isolated word lists, Gesenu parses raw sentences, extracts candidate words, enriches them with deep linguistic data, and helps you study them in the exact context you found them.

---

## 🚀 Key Features

* **Multimodal Sentence Encounter**: Paste raw Japanese text directly or upload/paste screenshots of text. Gesenu uses OCR (PaddleOCR/Google Vision) to pull Japanese text out of images instantly.
* **Smart Morphological Parsing**: Powered by **Sudachi**, Gesenu tokenizes Japanese sentences, handles complex de-inflections/conjugations back to their dictionary forms (lemmas), and filters them by Parts of Speech (POS) so you only study meaningful vocabulary.
* **Rich Linguistic Enrichment**: Every saved word is enriched with:
  * **Meanings & Readings**: Dictionary lookup via Jisho API and a local JMdict fallback, returning definitions, readings, JLPT level, and example sentences.
  * **Visual Pitch Accent Diagrams**: Phonetics and intonation maps using Kanjium data to help you learn natural pronunciations.
  * **Linguistic Discovery**: Semantic relations (synonyms/antonyms via Japanese WordNet) and similar words (chiVe vector embeddings).
* **Context-Bound Flashcards**: Study cards showing the exact sentence context where you first saw the word. Disambiguate meanings naturally instead of guessing in isolation.
* **Masked-Sentence Recall Testing**: Test your active recall by typing the target word back into its original sentence context.
* **Aggregated Progress Analytics**: Monitor your learning velocity with vocabulary growth charts, category breakdowns, and a GitHub-style review heatmap / streak counter.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React + TypeScript (Vite), Vanilla CSS |
| **Backend** | FastAPI (Python) |
| **Database** | SQLite (dev) / PostgreSQL (production) |
| **Auth** | JWT-based sessions |
| **Japanese Parsing** | SudachiPy (tokenization, lemmatization) |
| **OCR** | PaddleOCR / Google Cloud Vision |
| **Dictionary** | Jisho API + local JMdict fallback |
| **Semantics** | chiVe embeddings (similar words), Japanese WordNet (synonyms/antonyms) |
| **Phonetics** | Kanjium (pitch accent data) |
| **Deployment** | Vercel (frontend) · Render / Railway (backend) |

---

## 🗺️ Roadmap

| Phase | Status | Scope |
|---|---|---|
| **Design & Planning** | ✅ Done | Pipeline design, data model, tech stack decisions |
| **Backend Foundation** | 🔲 Upcoming | FastAPI project, DB schema, SudachiPy parsing service |
| **Dictionary & Discovery** | 🔲 Upcoming | Jisho API, JMdict fallback, WordNet, chiVe, Kanjium integration |
| **Auth Layer** | 🔲 Upcoming | User registration, JWT login, protected endpoints |
| **Frontend** | 🔲 Upcoming | React + TS, encounter page, flashcard player, recall test |
| **Analytics Dashboard** | 🔲 Upcoming | Stats, heatmap, vocabulary growth graph |
| **Deployment** | 🔲 Upcoming | Vercel + Render/Railway, live environment |

---

## 💡 The Core Philosophy: Context Over Isolation

Traditional vocabulary study relies on translating isolated words (e.g., matching *かける* to *to hang, to write, to sit*). This leads to cognitive fatigue and failure to apply the word in real speech.

Gesenu enforces **Context-First Learning**:
1. You only save words that you have *actually encountered* in real Japanese media.
2. The card is bound to the original sentence.
3. The recall test asks you to fill in the blank inside that sentence.

By learning vocabulary within syntactic context, your brain associates grammar patterns, collocations, and particle use automatically, moving you from *“I don’t get it”* to *“I get it”* far faster.
