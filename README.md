# PostWise-AI - AI Social Media Content Calendar Generator

**PostWise-AI** is a modern, full-stack AI-powered social media management platform that transforms brand identity, voice guidelines, and marketing goals into a complete **30-day social media calendar** for **Instagram**, **LinkedIn**, and **X (Twitter)**.

Built with a **Node.js/Express** backend, **MongoDB (Mongoose)** with an automatic in-memory fallback, and a reactive **React + Vite** frontend styled with **Tailwind CSS**.

---

## Key Features

### 1. 30-Day AI Content Calendar Generation
- **One-Click Generation**: Automatically generates a 30-day publishing schedule complete with hooks, captions, hashtag clusters, visual prompts, and strategic engagement tips.
- **Platform-Specific Rules**:
  - **Instagram**: Engaging visual hooks, spacing, emoji accents, and strong calls-to-action (CTAs).
  - **LinkedIn**: Professional thought leadership, industry insights, and conversation-starting hooks.
  - **X (Twitter)**: High-impact, concise copy under the 280-character limit.
- **AI Model Flexibility**: Powered by **Groq API** (`llama-3.3-70b-versatile`) with built-in fallback to **OpenAI** (`gpt-4o-mini`) and an intelligent offline mock generator when API keys are absent.

### 2. Pexels Stock Photo Integration & Carousel
- **Dynamic Content Matching**: Generates concise search terms (1 to 3 words) extracted from the post title and caption, removing stop words and punctuation.
- **In-Memory Cache (10-Minute TTL)**: Caches search results on the backend for 10 minutes to minimize API consumption and optimize load times.
- **Multi-Photo Carousel (`PexelsCarousel`)**: Displays 1 to 3 suggested high-resolution images with previous/next controls, slide dot indicators, and counter badges.
- **Live Post Feed Previews**: Renders the matched Pexels imagery directly within real-time Instagram, LinkedIn, and X post preview cards.

### 3. Full-Screen Interactive Post Editor
- **Multi-Platform Live Simulation**: Instantly preview how a post will look on Instagram, LinkedIn, and X/Twitter.
- **Single-Post AI Regeneration**: Re-craft individual post copy with custom prompts (e.g., *"Make it punchier with a question hook"*) while maintaining brand voice.
- **Live Counters**: Real-time word count and character count with character limit alerts for X (280 chars).
- **Interactive Visual Match Widget**: View the active Pexels search query, match count, and refresh images with one click.

### 4. Interactive Content Calendar & Rescheduling
- **Multiple Views**: Seamlessly switch between **Month Grid**, **Week View**, and **Agenda List**.
- **Drag-and-Drop Rescheduling**: Move posts across calendar dates with smooth, instant state updates.
- **Publish Status Control**: Track and toggle posts across `draft`, `scheduled`, and `published` states.

### 5. Brand Voice & Profile Management
- **Brand Identity**: Define brand name, industry, target audience, tone of voice, platforms, keywords, description, and handles.
- **Auto-Seeding**: Automatically seeds a default brand profile (`EcoGlow Organics`) if no brands exist, ensuring seamless first-time generation without MongoDB `CastError` issues.

### 6. Export Options
- **JSON Export**: Full structured calendar export with metadata for external integrations.
- **CSV Export**: Formatted for direct upload to scheduling tools like Buffer, Hootsuite, and Notion.

### 7. UI / UX & Architecture
- **Dark & Light Mode**: Seamless theme toggling with smooth transitions and persistent preference.
- **JWT Authentication & Demo Mode**: Full register/login flows plus a 1-click **Demo Login** for instant access.
- **Resilient Storage**: Transparently operates on MongoDB when connected, or falls back to an in-memory data store when local MongoDB is unavailable.

---

## Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide React Icons, React Router DOM |
| **Backend** | Node.js (v18+), Express.js, Native `fetch` (Node 18+) |
| **Database** | MongoDB with Mongoose (with automated in-memory mock fallback) |
| **AI & Media APIs** | Groq API (`llama-3.3-70b-versatile`), OpenAI API, Pexels API |
| **Authentication**| JSON Web Tokens (JWT), bcryptjs |

---

## Environment Variables Configuration

Create a `.env` file in the `backend/` directory with the following variables:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/postwise_ai
JWT_SECRET=your_super_secret_jwt_key_here

# AI Engine (Groq is prioritized; OpenAI is optional fallback)
GROQ_API=gsk_your_groq_api_key_here
# OPENAI_API_KEY=sk-your_openai_key_here

# Pexels API (supports either variable name)
PEXELS_API=your_pexels_api_key_here
# PEXELS_API_KEY=your_pexels_api_key_here
```

| Variable | Required | Description |
| :--- | :---: | :--- |
| `PORT` | Optional | Backend server port (defaults to `5000`). |
| `MONGODB_URI` | Optional | MongoDB connection string. If MongoDB is unreachable, server runs in mock mode. |
| `JWT_SECRET` | **Required** | Secret key for signing and verifying JWT tokens. |
| `GROQ_API` | Optional | Groq API key for LLaMA-3.3-70B calendar & post generation. |
| `OPENAI_API_KEY` | Optional | OpenAI API key fallback if Groq is not configured. |
| `PEXELS_API` | Optional | Pexels API key for stock photo discovery and carousel previews. |

---

## Backend API Endpoints Reference

All routes except `/api/auth/register`, `/api/auth/login`, and `/api/health` require a Bearer token in the `Authorization` header:
`Authorization: Bearer <jwt_token>`

### 1. Authentication (`/api/auth`)

| Method | Endpoint | Description | Request Body |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Create a new user account | `{ "name", "email", "password" }` |
| `POST` | `/api/auth/login` | Login and obtain JWT token | `{ "email", "password" }` |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | *None* |

### 2. Brand Profiles (`/api/brands`)

| Method | Endpoint | Description | Request Body |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/brands` | List user brands (auto-seeds default if empty) | *None* |
| `POST` | `/api/brands` | Create new brand profile | `{ "name", "industry", "targetAudience", "tone", "platforms", "keywords", "description", "website" }` |
| `GET` | `/api/brands/:id` | Retrieve single brand profile | *None* |
| `PUT` | `/api/brands/:id` | Update brand profile | `{ "name", "industry", "targetAudience", "tone", ... }` |
| `DELETE` | `/api/brands/:id` | Delete brand profile | *None* |

### 3. Calendar Engine (`/api/calendars`)

| Method | Endpoint | Description | Request Body |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/calendars/generate` | Generate 30-day AI content calendar | `{ "brandId", "startDate", "month", "year", "topicNiche", "goals" }` |
| `GET` | `/api/calendars` | List all calendars for authenticated user | *None* |
| `GET` | `/api/calendars/:id` | Get calendar details and all 30 posts | *None* |
| `GET` | `/api/calendars/:id/export/json`| Download calendar as JSON file | *None* |
| `GET` | `/api/calendars/:id/export/csv` | Download calendar as CSV file | *None* |
| `DELETE` | `/api/calendars/:id` | Delete calendar and all associated posts | *None* |

### 4. Post Operations (`/api/posts`)

| Method | Endpoint | Description | Request Body |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/posts` | Manually add a post to a calendar | `{ "calendarId", "brandId", "date", "platform", "title", "caption", "hashtags", "timeSlot", "status" }` |
| `PUT` | `/api/posts/:id` | Update post details, caption, or status | `{ "title", "caption", "hashtags", "platform", "date", "timeSlot", "status", ... }` |
| `POST` | `/api/posts/:id/regenerate` | Regenerate post copy with custom AI prompt | `{ "customInstruction": "Make it more casual" }` |
| `PATCH` | `/api/posts/:id/reschedule` | Reschedule post date | `{ "date": "2026-10-15" }` |
| `DELETE` | `/api/posts/:id` | Delete a single scheduled post | *None* |

### 5. Media & Stock Photos (`/api/pexels`)

| Method | Endpoint | Description | Query Parameters |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/pexels/search` | Search Pexels photos (10-min cache, max 3 photos) | `?term=morning+routine` |

### 6. System Health (`/api/health`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Check API server status, database connection, and uptime timestamp |

---

## Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or later
- **npm**: v9.0.0 or later
- **MongoDB** *(Optional)*: If MongoDB is not running locally, PostWise-AI automatically runs in fallback in-memory mode.

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/Rahul-49/PostWise-AI.git
cd PostWise-AI
```

---

### Step 2: Backend Setup

1. Open a terminal and navigate to the `backend` folder:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` to supply your `GROQ_API`, `PEXELS_API`, and `JWT_SECRET`.

4. Start the backend server:
   ```bash
   # Production / Standard run:
   node server.js

   # Or development with auto-reload:
   npm run dev
   ```
   The backend will be available at: **`http://localhost:5000`**  
   Health endpoint: **`http://localhost:5000/api/health`**

---

### Step 3: Frontend Setup

1. Open a new terminal and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   The application will be running at: **`http://localhost:3000`**

---

## Quick Start Guide

1. Navigate to `http://localhost:3000`.
2. Click **"Demo Login"** to sign in instantly, or create a new account via **"Get Started"**.
3. Go to **"AI Generator"** or click **"Generate AI Calendar"** in the top navbar.
4. Select your brand, target platforms (**Instagram**, **LinkedIn**, **X**), campaign goal, and month.
5. Click **"Generate 30-Day Calendar"** — the AI engine will create 30 platform-tailored posts.
6. Click any post card to open the **Full-Screen Editor Modal**:
   - Preview how the post looks live on Instagram, LinkedIn, and X.
   - Cycle through relevant Pexels images via the image carousel.
   - Use **"Regenerate"** to give custom AI directions for single posts.
   - Reschedule posts via drag-and-drop on the calendar grid.
7. Export your schedule via **"Export CSV"** or **"Export JSON"** at any time.

---

## License
MIT License. Built with passion for content creators and marketing teams.