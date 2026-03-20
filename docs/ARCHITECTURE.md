# Open Modeler TS Architecture Document

## Master Business Case

1. User can edit and save business logic scripts edited in a code editor (e.g. CodeMirror) within the React Flow
   low-code environment. Example of the script: [example-loan-return.ts](example-loan-return.ts)
2. Script is the project. Multiple projects can be stored in IndexedDB and listed in the landing page.
3. The script is parsed to the higher level OpenModel Project AST (using ts-morph) to generate the graph in the React
   Flow editor. Flow editor changes are serialized back to the script and saved in IndexedDB.
4. Script can be executed in a secure sandbox (QuickJS). Depending on hooks in the script, the sandbox can call out to
   the host environment to fetch data or call an LLM, or render graph or output table in the UI.

## Stack

- **QuickJS VM** — Secure, isolated JavaScript sandbox for business logic execution.
- **ts-morph** — TypeScript AST analysis for signature extraction and transpilation.
- **TanStack Query** — Imperative LLM request management, caching, and retries.
- **IndexedDB** — Local storage for business logic scripts.
- **Next.js & React** — Core SPA framework for the host environment.
- **TypeScript** — Primary development language for host and logic.

## Sequence Diagram

```mermaid
sequenceDiagram
    participant User as 👤 User (GUI)
    participant IDB as 💾 IndexedDB
    participant TSM as 🏗️ ts-morph
    participant QJS as 🛡️ QuickJS VM
    participant SPA as 🌐 SPA (Host)
    participant TSQ as 🔄 TanStack Query
    participant LLM as 🤖 Local LLM
    Note over User, TSM: Phase 1 — Analysis
    User ->> IDB: Fetch business_logic.js
    IDB -->> User: JS Code
    User ->> TSM: Read signatures
    TSM -->> User: Metadata
    Note over User, LLM: Phase 2 — Execution
    User ->> QJS: Init sandbox
    User ->> QJS: Register ai()
    QJS ->> QJS: Run script
    QJS ->> SPA: ai() call — VM suspends
    SPA ->> TSQ: fetchQuery()
    TSQ ->> LLM: HTTP request
    LLM -->> TSQ: JSON response
    TSQ -->> SPA: Resolved data
    SPA ->> QJS: Resume — resolve Promise
    QJS -->> User: Final result
    User ->> QJS: Dispose sandbox
```

## Phase 1 — Analysis

1. **Fetch business_logic.js** — GUI loads the script from IndexedDB.
2. **JS Code** — Raw JS returned to the caller.
3. **Read signatures** — ts-morph parses the AST to extract function names, parameter names/types, and return
   shapes. If the file is TypeScript, call `sourceFile.getEmitOutput()` or `project.emit()` here to get transpiled JS
   before passing to the VM.
4. **Metadata** — Signature metadata returned to the host so it knows what inputs to prepare before execution
   starts.

## Phase 2 — Execution

5. **Init sandbox** — A fresh QuickJS runtime instance is created: isolated heap, own global scope, no access to
   browser DOM or fetch.
6. **Register ai()** — The host injects `ai(prompt)` into the sandbox global scope before the script runs. Business
   logic can call it like any normal async function.
7. **Run script** — QuickJS executes business_logic.js inside the sandbox.
8. **ai() call — VM suspends** — When business logic hits `await ai("...")`, the VM yields control back to the SPA
   host and waits for the Promise to resolve.
9. **fetchQuery()** — Host calls `queryClient.fetchQuery()` imperatively to trigger the LLM HTTP call via TanStack
   Query.
10. **HTTP request** — TanStack Query sends the request to the LLM endpoint, with built-in deduplication, caching,
    and retry.
11. **JSON response** — LLM returns structured JSON.
12. **Resolved data** — TanStack Query hands the result back to the host.
13. **Resume — resolve Promise** — Host resolves the `ai()` Promise with the LLM result; the VM resumes from where
    it suspended.
14. **Final result** — Business logic finishes and returns its output to the GUI.
15. **Dispose sandbox** — QuickJS runtime is torn down, freeing heap memory and ensuring no state leaks into the
    next execution.

## Notes

### Analysis Phase

ts-morph is primarily a TypeScript AST tool but works on plain JS too. If input is TypeScript, call
`sourceFile.getEmitOutput()` or `project.emit()` to get transpiled JS directly from ts-morph — no esbuild needed. For
plain JS, ts-morph is purely used for signature extraction.

### Isolated Sandbox

A QuickJS sandbox is a self-contained JS runtime instance with its own heap, global scope, and event loop. It has zero
access to the browser DOM, `fetch`, or any host API unless explicitly registered. This is the security boundary —
business logic cannot reach outside it.

### The ai() Bridge

`ai()` is not standard JS — it is a host function registered into the sandbox global scope before execution starts. When
business logic calls `await ai("...")`, the VM suspends and yields control to the SPA host. The host resolves the LLM
response and resumes the VM by resolving the Promise. The business logic script sees it as a normal async call.

### TanStack Query

The LLM HTTP call is managed by TanStack Query. The host calls `queryClient.fetchQuery()` imperatively from within the
`ai()` bridge handler — outside of any React component. This gives you deduplication, caching, and retry for free,
without wiring up a hook.

### Context Disposal

Each execution run gets a fresh sandbox instance. Disposing it after the run frees the QuickJS heap and guarantees no
globals, closures, or module-level state persist into the next run. This is intentional — business logic scripts are
stateless by design.

## Proposed Project Component Structure

Based on standard Next.js and React best practices, the application should use a clean, layered architecture. This keeps
all UI in one place, avoids feature-folder duplication, and strictly adheres to the rule of using fully descriptive
names without abbreviations.

```text
open-modeler-ts/            # GitHub repository root
├── app/                    # Next.js App Router (Routing and Endpoints)
│   ├── health/             # System health check endpoint
│   │   └── page.tsx        # Health is a separate route with its own page component
│   ├── layout.tsx          # Root application layout
│   └── page.tsx            # Main Single Page Application router (Hash-based)
├── components/             # All React UI Components (Strictly UI layer)
│   └── common/             # Reusable shared UI elements (dialogs, toolbars)
│       ├── snackbar/       # notistack snackbar provider and hooks
│       └── ...             # Other common UI components
│   ├── views/              # High-level feature interfaces (FlowEditor, CodeEditor)
│   │   ├── app-preview     # Real-time app output visualization (MUI X Charts, tables)
│   │   ├── code-editor     # CodeMirror-based TypeScript editor
│   │   ├── deploy-manager  # App deployment and environment management
│   │   ├── flow-editor     # Main ReactFlow-based flow editor interface
│   │   ├── landing         # Public landing page components
│   │   ├── tests-manager   # Test case creation and execution interface
│   │   └── types-editor    # Custom types definition interface
│   ├── nodes/              # Custom ReactFlow node components
│   │   ├── common/     
│   │   ├── chart-node/     
│   │   └── function-node/     
│   ├── projects-library/   # Projects management UI (project cards)
│   ├── layouts/            # landing-layout.tsx for multi-project management, project-layout.tsx for in-project navigation
│   ├── services/           # External communication (LLM requests, HTTP clients)
│   └── theme/              # Material UI theme configuration
└── lib/                    # Core framework-agnostic business logic (React-free, tested with Jest)
    ├── ast/                # TypeScript AST parsing (ts-morph integrations)
    │   └── __tests__/      # Jest tests will be placed alongside
    ├── engine/             # QuickJS VM setup and execution sandbox
    ├── storage/            # IndexedDB client and schema definitions
    ├── utils/              # Shared helper functions and formatters
    └── types/              # Global TypeScript interfaces and types
```