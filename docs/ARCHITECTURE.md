# Architecture Blueprint

## 1. High-Level Topology

1. `web-app` sends requests to `api-gateway`.
2. `api-gateway` stores state in Postgres and enqueues jobs.
3. `agent-orchestrator` consumes jobs and builds task graph.
4. `sandbox-runner` executes tool actions in isolated containers.
5. `git-service` handles branch/commit/PR operations.
6. `deploy-service` performs preview deploy and status callbacks.
7. Logs and artifacts are persisted to storage and surfaced in UI.

## 2. Suggested Components

### web-app
- Next.js App Router.
- Run timeline view with SSE/websocket updates.
- Plan approval and deploy approval dialogs.

### api-gateway
- AuthN/AuthZ.
- Project, run, and settings APIs.
- Publishes work items to Redis queue.

### agent-orchestrator
- Planner and executor state machines.
- Retry policies and timeout management.
- Budget enforcement (token/time spend).

### sandbox-runner
- Ephemeral container per task/run.
- Mount project workspace at controlled path.
- Restrict egress by allowlist.

### git-service
- Clone/fetch repository via app credentials.
- Branch naming convention: `run/<run_id>-<slug>`.
- PR template with plan, changes, tests, risks.

### deploy-service
- Provider adapter interface.
- Preview URL lifecycle + status ingestion.
- Rollback endpoint.

## 3. Core Data Model (MVP)

- `users`
- `workspaces`
- `workspace_members`
- `projects`
- `project_repositories`
- `runs`
- `run_steps`
- `tool_invocations`
- `artifacts`
- `deployments`
- `audit_events`

## 4. Security Controls

- Ephemeral run tokens.
- Secret manager with just-in-time injection.
- Command denylist (e.g., destructive host operations).
- Full run transcript retention for forensic review.

## 5. Failure Handling

- Per-step timeout and retry policy.
- Circuit breaker for unstable providers.
- Clear terminal states: `succeeded`, `failed`, `cancelled`, `needs_approval`.

## 6. Scalability Notes

- Horizontal scale for orchestrator and runner pools.
- Queue partitioning by workspace tier.
- Archive old artifacts by retention policy.
