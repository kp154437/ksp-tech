# KSP Builder — No-Code Website & Web App Platform

A production-leaning, beginner-friendly no-code/low-code platform to visually build websites and simple web apps.

## What is included

- **Authentication**: signup/login/logout with JWT sessions.
- **User dashboard**: project list with create, rename, delete, load.
- **Visual builder**:
  - drag-and-drop component system,
  - instant canvas rendering,
  - desktop/mobile preview switch,
  - style sidebar.
- **Project workflow**:
  - multi-page projects,
  - auto-save,
  - undo/redo history,
  - reusable components,
  - asset manager (upload images and reuse).
- **Styling system**:
  - per-element style controls,
  - global styles (font/background),
  - theme color.
- **Export and publish**:
  - export as clean `index.html`,
  - publish to simulated hosted link: `/share/:token`.
- **UX and reliability**:
  - loading states,
  - error handling in API and UI,
  - modern SaaS-like layout.

## Tech Stack

- **Frontend**: React + Vite
- **Backend**: Node.js + Express
- **Database**: SQLite (local persistent file)
- **Auth**: JWT + bcrypt

## File structure

```txt
ksp-tech/
├── package.json
├── README.md
├── client/
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── api.js
│       └── styles.css
└── server/
    ├── package.json
    └── src/
        ├── index.js
        ├── db.js
        ├── auth.js
        └── render.js
```

## Quick start

### 1) Install dependencies

```bash
npm install
```

### 2) Run both frontend + backend

```bash
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:4000`

### 3) Production build

```bash
npm run build
npm run start
```

## Core user flow

1. Sign up or log in.
2. Create a project in the left panel.
3. Drag components from the component list onto the canvas.
4. Select components and edit styles/content in the right panel.
5. Add pages, upload image assets, and save reusable blocks.
6. Use **Export** to download HTML.
7. Use **Publish** to generate a share link.

## API overview

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/projects`
- `POST /api/projects`
- `GET /api/projects/:id`
- `PUT /api/projects/:id`
- `DELETE /api/projects/:id`
- `POST /api/projects/:id/publish`
- `GET /api/projects/:id/export`
- `GET /share/:token`

## Notes for scalability

This implementation keeps complexity low while staying maintainable:

- clear separation between frontend and backend,
- normalized server-side project persistence,
- isolated render utility for future export targets,
- room to add:
  - team collaboration,
  - versioning,
  - external hosting,
  - role-based permissions,
  - cloud storage for assets.

## Optional social login

Not enabled by default. To add Google OAuth, integrate Passport.js or Auth.js in `server/src/index.js` and store provider IDs in `users` table.

---

Built to feel like a real product while remaining simple enough for beginners to understand and extend.
