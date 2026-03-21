# EdgeRules Modeler - GEMINI Context

This project is a TypeScript-based implementation of a modeling tool or framework, focusing on visual rule modeling and testing.

## General Knowledge

### For Agent:

-   Execute actions one by one, do not run tools in parallel!
-   Do one thing at a time, do not multitask!
-   Gemini CLI Agent is not allowed to commit or create pull requests! Do not commit code changes! User must review all changes before committing or creating pull requests.

### Documentation & Architecture (CRITICAL)

The project architecture has been formally refined into a **7-Service Service-Oriented Architecture**. Always refer to these documents before implementation:

-   **Index:** [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — System overview, routing, and high-level structure.
-   **Service 1:** [docs/01-PROJECTS-SERVICE.md](docs/01-PROJECTS-SERVICE.md) — Multi-project workspace and metadata storage.
-   **Service 2:** [docs/02-PROJECT-SERVICE.md](docs/02-PROJECT-SERVICE.md) — Single project assets and types management.
-   **Service 3:** [docs/03-AST-PARSING.md](docs/03-AST-PARSING.md) — `ts-morph` parsing, multi-file compilation, and `SourceMutator`.
-   **Service 4:** [docs/04-FLOW-MODELING.md](docs/04-FLOW-MODELING.md) — ReactFlow modeling, scoped graph derivation, and visual mutations.
-   **Service 5:** [docs/05-EXECUTION-ENGINE.md](docs/05-EXECUTION-ENGINE.md) — QuickJS WASM sandbox, FFI hooks, and reactive data refresh.
-   **Service 6:** [docs/06-TESTING-SERVICE.md](docs/06-TESTING-SERVICE.md) — Test case orchestration and assertion evaluation.
-   **Service 7:** [docs/07-DEPLOYMENT-SERVICE.md](docs/07-DEPLOYMENT-SERVICE.md) — **(OUT OF SCOPE FOR MVP)**.

### Development Agent Guidelines

-   The Next.js server might be already started on http://localhost:3000 - this allows hot reloading and Cypress testing.
-   You are allowed for network access and network must be available - if you need network, and network is not available, you must inform the user and stop current task.

## Main Considerations

-   **SSG Priority:** The app must be deployable as a static site on AWS S3 (`output: 'export'`).
-   **Hash Routing:** Uses `use-hash-route.ts` to manage SPA state without server redirects.
-   **Single Source of Truth:** The TypeScript source code in IndexedDB is the canonical form. The visual graph and AST are re-derived.
-   **Lazy Loading:** Project assets (file content) are lazy-loaded from IndexedDB to prevent memory bloat.
-   **Reactive Refresh:** Visual nodes (charts/tables) subscribe to execution hook outputs for real-time updates.

## Stack

-   **Runtime**: Node.js v24.9.0 or later
-   **Framework**: Next.js 16.1.6 (App Router, Static Export)
-   **Language**: TypeScript 5.9+
-   **UI Library**: React 19.2.4
-   **Styling**: Material UI v7 (@mui/material)
-   **Flow Modeling**: ReactFlow v11
-   **Charts**: MUI X Charts v8
-   **Code Editor**: ACE Editor (react-ace)
-   **Database (Client)**: IndexedDB (via `idb`) with normalized metadata/asset stores.
-   **Testing**: Cypress v15.12.0 (E2E), Jest v30.2.0 (Unit)

## Navigation & Hash Routes

| View              | Hash Path                         |
| :---------------- | :-------------------------------- |
| **Landing**       | `#/`                              |
| **Flow Editor**   | `/#flow/:projectId/:key`          |
| **Visual Editor** | `/#visual-editor/:projectId/:key` |
| **Code Editor**   | `/#code-editor/:projectId/:key`   |
| **Types Editor**  | `/#types/:projectId`              |
| **Tests Manager** | `/#tests/:projectId`              |
| **App Preview**   | `/#app/:projectId`                |

## Project Structure

```text
/
├── docs/                   # 01-07 Service Architecture documents
├── src/
│   ├── app/                # Next.js entry (Static Router in page.tsx)
│   ├── components/
│   │   ├── nodes/          # Custom ReactFlow node types (Chart, Table, etc.)
│   │   ├── views/          # Feature-first view components (Colocated)
│   │   ├── flow/           # ReactFlow shared logic
│   │   └── project/        # Project UI orchestration
│   ├── hooks/              # use-hash-route, use-ast, use-execution, etc.
│   ├── lib/                # Pure Business Logic (Service Layer)
│   │   ├── projects/       # Service 1
│   │   ├── project/        # Service 2
│   │   ├── ast/            # Service 3 (ts-morph)
│   │   ├── flow/           # Service 4 (Graph Builder)
│   │   ├── engine/         # Service 5 (QuickJS)
│   │   └── testing/        # Service 6
│   └── types/              # Cross-service TypeScript interfaces
└── public/                 # pkg-web/ (WASM binaries)
```

## Testing Guidelines

-   **Jest:** Authority for `lib/` logic. Must reach 100% coverage for AST and Engine components.
-   **Cypress:** Authority for `views/` and user journeys.
-   **Health Check:** Always run `health.cy.ts` first.

## Known Issues and Memories

-   **Adjective word type:** Known issue where 'adjective' has only 6 entries, causing decoy generation failures in tests requiring 8 options.
-   **AST MVP Limitation:** Multi-file parsing is architecturally ready, but MVP implementation only parses the first TypeScript asset found in the project.
