# Tech Boilerplate — Universal Starter Template

> A one-page reference for the starter project this app is built on.
> Upload this into your Claude.com project files so the assistant knows the stack,
> conventions, and constraints before planning anything.

---

## What this is

A production-ready **full-stack web app starter** built on AWS Amplify Gen2 with a
Next.js frontend. It ships with working authentication, a database, a UI component
library, and CI/testing already wired up. You build your app by replacing the example
data models and pages — the plumbing is done.

---

## Core Stack

| Layer            | Technology                                  | Version    |
| ---------------- | ------------------------------------------- | ---------- |
| Framework        | Next.js (App Router, Turbopack)             | 15.5.6     |
| UI library       | React                                       | 19.1.0     |
| Language         | TypeScript (strict mode)                    | 5.9.3      |
| Backend platform | AWS Amplify Gen2 (code-first, TypeScript)   | 1.18.x     |
| Auth             | Amazon Cognito (via `defineAuth`)           | —          |
| Data/API         | AWS AppSync (GraphQL) + DynamoDB            | —          |
| Styling          | Tailwind CSS v4                             | 4.x        |
| Hosting/CI/CD    | AWS Amplify Hosting (`amplify.yml`)         | —          |
| Testing          | Jest + React Testing Library (jsdom)        | 30.x       |
| Tooling          | ESLint, Prettier, Husky, lint-staged        | —          |

---

## Architecture

- **Frontend-only repo with managed backend.** Backend infra is defined in code under
  `amplify/` and deployed by Amplify CI — no manual AWS console clicking.
- **Auth → Data flow.** Cognito user pool gates the app; AppSync/DynamoDB models use
  owner-based authorization tied to the Cognito identity.
- **Single backend definition** in `amplify/backend.ts` composes `auth` + `data`. Add
  `storage`, `functions`, etc. here as needed.

---

## Directory Layout

```
app/                  Next.js App Router pages
  layout.tsx          Root layout (fonts, globals)
  page.tsx            Landing page
  login/page.tsx      Login route
  dashboard/page.tsx  Authenticated dashboard route
  globals.css         Tailwind entrypoint

components/
  ui/                 Reusable UI primitives (see list below)
  auth/login-form.tsx Auth form component

amplify/
  backend.ts          Backend composition (defineBackend)
  auth/resource.ts    Cognito config (defineAuth)
  data/resource.ts    GraphQL schema + models (defineData)

lib/utils/            Shared helpers (e.g. clsx + tailwind-merge)
types/                Shared TypeScript types
docs/                 GETTING_STARTED.md, DEPLOYMENT.md
.github/              CI workflow, PR + issue templates
```

### Included UI components (`components/ui/`)
`navbar`, `sidebar`, `tabs`, `breadcrumbs`, `card`, `container`, `grid`, `stack`,
`button`, `input`, `textarea`, `select`, `checkbox`, `radio`.

---

## Data Layer (example schema — replace with your own)

Defined in `amplify/data/resource.ts`, default auth mode = **userPool** (Cognito).

- **UserProfile** — extended user info (email, displayName, bio, avatarUrl, preferences
  as JSON). Auth: `owner` manages own; `authenticated` can read.
- **Task** — example CRUD model (title, description, `status` enum
  todo/in_progress/done, `priority` enum low/medium/high, dueDate). Auth: `owner` only.

Client usage pattern:
```ts
"use client";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
const client = generateClient<Schema>();
// client.models.Task.list() / create() / update() / delete()
```

---

## Auth

`amplify/auth/resource.ts` — email-based login via Cognito (`loginWith: { email: true }`).
**Rule:** never fetch data before auth is initialized; don't break the Amplify auth flow.

---

## Commands

| Command                | Purpose                                  |
| ---------------------- | ---------------------------------------- |
| `npm run dev`          | Local dev server (Turbopack)             |
| `npm run build`        | Production build                         |
| `npm run lint`         | ESLint                                   |
| `npm test`             | Jest test suite                          |
| `npm run format`       | Prettier write                           |
| `npx ampx sandbox`     | Spin up personal cloud backend sandbox   |

Pre-PR: run `lint`, `test`, `build`. If the schema changed, run `npx ampx sandbox`.
Pre-commit hooks (Husky + lint-staged) auto-fix and format staged files.

---

## Path Aliases

`@/*` maps to the repo root (e.g. `@/components/ui/button`, `@/amplify/data/resource`).

---

## Key Constraints (important for planning)

- **Amplify / CloudFormation resource limit (~500).** Treat the GraphQL schema as a
  resource budget. Too many models/indexes/tables can break deploys. Reuse models;
  minimize schema growth; escalate risky schema changes before building.
- **Don't modify without approval:** `amplify.yml`, `amplify/*`, `package.json`,
  `tsconfig.json`, config files, env files.
- **Avoid new dependencies** unless necessary; follow existing patterns; keep changes small.
- **Testing happens on the deployed Amplify environment**, not just local dev.
- **Prefer workflows over agents.** Build the simplest system that works — known,
  decomposable steps should be deterministic workflows, not autonomous agents.

---

## How to extend it

1. Edit `amplify/data/resource.ts` to define your real models (replace UserProfile/Task).
2. Add routes under `app/` and compose screens from `components/ui/`.
3. Add `storage`/`functions` in `amplify/` and register them in `backend.ts` if needed.
4. Deploy via Amplify Hosting (push to branch → CI runs `amplify.yml`).

---

## System-Design Philosophy (how AI features should be built here)

> Full playbook lives in `CLAUDE_AGENT_PATTERNS.md`; rules live in `CLAUDE.md`.
> This is the short version for planning.

**Golden rule:** the goal is not to build agents — it's to build the **simplest system
that works.** Prefer deterministic workflows over autonomous agents.

**Pick the simplest pattern that solves it (stop at the first "good enough"):**

```
Single LLM call → Prompt chain (workflow) → Routing → Tool use → Agent loop → Multi-agent
  simplest ─────────────────────────────────────────────────────────────▶ most complex
```

- **Single call** — atomic task, simple output schema.
- **Prompt chain (DEFAULT)** — known, ordered steps. Most features belong here.
- **Routing** — a classifier picks which chain to run.
- **Tool use** — typed, single-responsibility tools for real-world actions.
- **Agent loop (RARE)** — only when steps are genuinely unknowable + iterative. Must have
  a stopping condition and log every step.
- **Multi-agent (VERY RARE)** — only for truly independent sub-problems.

**Every system is four blocks:** LLM (reasoning) · Tools (actions) · Context (input/memory)
· Control flow (workflow or loop). If you can't name all four, the design isn't done.

**Mandatory workflow shape:** `Extract → Validate → Clean → Review → Save`, with validation
between every step.

**Required for every system:**
- **Observability** — log inputs, outputs, steps, errors.
- **Evaluation** — define success criteria, accuracy metrics, and known failure cases.

**Build order:** single prompt → structured output → validation → workflow → tools →
agent (only if needed). Don't skip levels.

**Context discipline:** include only what the step needs; prefer retrieval over large
prompts; pass typed data between steps, not free-form prose.
