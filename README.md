## Project info

**URL**: https://AI-Hodco-Hub.com

## How it was built?

## Backend
Backend 

Database (PostgreSQL) — Stores all data: shareholders, documents, portfolio entities, valuations, purchase requests, user profiles, audit logs, and user roles. Row Level Security (RLS) policies protect data access.

Authentication — Built-in auth system with session management, OAuth (Google sign-in), and role-based access control (admin, moderator, user roles via the user_roles table and has_role() function).

Edge Functions (Deno/TypeScript) — Serverless backend functions that run on the edge:
process-document — The main AI pipeline: downloads uploaded PDFs from storage, sends them to Gemini 2.5 Pro for text extraction & metadata analysis (shareholder names, ownership %, dates, document type), then chunks the text and stores it for search.
        categorize-document — Document categorization helper.
        ai-assistant — Powers the AI chat assistant using document chunks for context-aware Q&A.

Architecture - File Storage — Two buckets: documents (private, for uploaded PDFs) and entity-logos (public, for portfolio company logos).

pgvector Extension — Enables vector similarity search on document chunks via embeddings, powering semantic search in the AI assistant.

AI Integration

All AI calls go through the API keys. The project uses (for now) Google Gemini 2.5 Pro for document processing (vision + text extraction from PDFs).

## How can I edit this code?

Simply fork it.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS


