# Emergent-Style AI Builder Platform (Runnable Preview)

This repository now includes a **working frontend preview** of an Emergent-like AI software builder interface.

## What is included

- A runnable web UI prototype (`index.html`, `styles.css`, `app.js`) showing:
  - Project prompt input
  - Plan generation panel
  - Run timeline simulation
  - Status cards for run state, branch, and preview URL
- Product planning documents:
  - `docs/PRD.md`
  - `docs/ARCHITECTURE.md`
  - `docs/MVP_BACKLOG.md`

## Run locally

```bash
python3 -m http.server 4173
```

Then open:

- `http://localhost:4173`

## Preview interactions

1. Click **Generate Plan** to populate milestones.
2. Click **Run Agent** to simulate execution and success state.
3. Click **Deploy Preview** to simulate deployment and production URL.

## Next implementation step

Move this prototype into a monorepo with:
- `apps/web` (Next.js)
- `services/api-gateway`
- `services/agent-orchestrator`
- `services/sandbox-runner`

and back the UI with real run APIs + websocket updates.
