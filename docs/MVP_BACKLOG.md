# MVP Delivery Backlog (8–12 Weeks)

## Phase 1 — Foundation (Weeks 1–2)

### Story 1: Authentication + Workspace
- Implement login (email + OAuth).
- Create workspace and membership model.
- Acceptance: users can create workspace and invite one member.

### Story 2: Project CRUD
- Create/list/archive projects.
- Persist settings: repo URL, default branch, provider.
- Acceptance: project can be created and viewed in dashboard.

## Phase 2 — Agent Core (Weeks 3–5)

### Story 3: Prompt-to-Plan
- Endpoint to generate structured plan from prompt.
- Add approval gate and plan versioning.
- Acceptance: approved plan moves run to queued state.

### Story 4: Task Execution Engine
- Implement run/step state machine.
- Add tool adapters: file, shell, test.
- Acceptance: run can execute 3+ sequential steps with logs.

## Phase 3 — Git + PR (Weeks 6–8)

### Story 5: Repository Integration
- Connect provider app installation.
- Clone repo and create working branch.
- Acceptance: run creates branch and pushes commit.

### Story 6: Pull Request Automation
- Generate PR title/body with diff summary.
- Attach test outputs and risk notes.
- Acceptance: PR opens automatically after successful run.

## Phase 4 — Deploy + Reliability (Weeks 9–12)

### Story 7: Preview Deploy
- Integrate one hosting provider.
- Add env var management and deploy logs.
- Acceptance: preview URL shown in run details.

### Story 8: Audit + Observability
- Store full tool invocation ledger.
- Add dashboard for run outcomes and latency.
- Acceptance: audit view shows command history per run.

## Definition of Done (Global)

- Feature behind auth and workspace scope.
- Structured logs emitted and queryable.
- Error states visible in UI.
- Basic tests added for critical paths.
- Documentation updated.
