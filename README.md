# ∑ Sophos — Math Reviser
> Flashcard app for SMIS students with AI math solving powered by Sopho.

---

## Step-by-Step Development Guide

### Phase 1 — Environment Setup

**Step 1. Install prerequisites**
- Node.js v18+ → https://nodejs.org
- MongoDB Atlas (free) → https://cloud.mongodb.com
- VS Code → https://code.visualstudio.com
- Recommended VS Code extensions: ES7 React Snippets, Prettier, MongoDB for VS Code

**Step 2. Clone / open the project**
```
cd sophos
npm install
```

**Step 3. Create your .env file**
Copy `.env.example` to `.env` and fill in:
```
MONGO_URI=         ← your MongoDB Atlas connection string
JWT_SECRET=        ← any long random string
ANTHROPIC_API_KEY= ← from console.anthropic.com
ALLOWED_EMAIL_DOMAIN=smis.ac.jp
```

**Step 4. Start the dev server**
```
npm run dev
```
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

---

### Phase 2 — Test Core Features (in order)

**Step 5. Test registration**
- Go to http://localhost:3000/register
- Try a non-smis.ac.jp email → should be blocked
- Register with a @smis.ac.jp email → should succeed

**Step 6. Test login**
- Log in with the account you just created
- Check that wrong password gives an error

**Step 7. Create folders**
- On the dashboard, create a folder (e.g. "Calculus")
- Verify it appears in your folder grid

**Step 8. Test flashcards**
- Open a folder
- Click "Add Card" and upload a screenshot of a math problem
- Flip the card
- Click ⭐ to star it — card should get a yellow border
- Click ✦ to ask Sopho for an answer (needs ANTHROPIC_API_KEY)
- Click ✅ to mark as understood — card gets green border
- Test the Starred / Understood filter tabs at the top

**Step 9. Test sharing**
- Register a second account with a different @smis.ac.jp email
- In a folder, share it with that second email
- Log in as the second user — the folder should appear under "Shared with me"

---

### Phase 3 — Build & Deploy

**Step 10. Build the frontend**
```
npm run build
```
This creates a `build/` folder of static files.

**Step 11. Deploy options**
| Service | What to deploy | Notes |
|---------|---------------|-------|
| Railway | Full stack (Node + React) | Easiest, free tier |
| Render | Backend as Web Service | Add static site for frontend |
| Vercel | Frontend only | Point API_URL to separate backend |
| MongoDB Atlas | Database | Already cloud-hosted |

**Step 12. Set environment variables in your hosting platform**
Same variables as your `.env` file — set them in the platform's dashboard.

---

### Phase 4 — Future Features (next steps)

- [ ] Email verification on sign-up
- [ ] Drag-and-drop card reordering
- [ ] Study mode with progress tracking
- [ ] Share folder via link (public token)
- [ ] Mobile-responsive polish
- [ ] Paste screenshot directly (Ctrl+V) instead of file upload
- [ ] Text search across all cards
- [ ] Export folder as PDF

---

## Project Structure

```
sophos/
├── backend/
│   ├── models/        User, Card, Folder (MongoDB schemas)
│   ├── routes/        auth, cards, folders, ai
│   ├── middleware/    JWT auth guard
│   └── server.js      Express entry point
├── src/
│   ├── context/       AuthContext (login state)
│   ├── pages/         Login, Register, Dashboard, Folder, Study
│   ├── styles/        CSS per page
│   └── App.js         Routes
├── public/
│   └── index.html
├── .env.example
└── package.json
```

## Key Files to Edit

| File | What it controls |
|------|-----------------|
| `backend/routes/auth.js` | Email domain restriction |
| `backend/routes/ai.js` | Sopho AI system prompt |
| `src/styles/global.css` | Brand colors / dark theme |
| `src/pages/FolderPage.js` | Flashcard UI + star/understood logic |
| `src/pages/DashboardPage.js` | Folder grid |
