# EdgeRules Modeler - GEMINI Context

This project is a TypeScript-based implementation of a modeling tool or framework, focusing on visual rule modeling and testing.

## General Knowledge

### For Agent:

- Execute actions one by one, do not run tools in parallel!
- Do one thing at a time, do not multitask!
- Gemini CLI Agent is not allowed to commit or create pull requests! Do not commit code changes! User must review all changes before committing or creating pull requests.

### Documentation & Context

- Documentation, stories, and specifications may reside in the sibling directory `../edgerules-docs`.
- If a referenced file (e.g., `*_STORY.md`, `*_SPEC.md`) is not found in the current project, verify its existence in `../edgerules-docs` before reporting it as missing.

### Development Agent Guidelines

- The Next.js server might be already started on http://localhost:3000 - this allows hot reloading and Cypress testing.
- You are allowed for network access and network must be available - if you need network, and network is not available, you must inform the user and stop current task.

## Main Considerations

- Static Site Generation (SSG) must be used to be able to deploy EdgeRules Modeler on S3.
- Prioritize Next.js 16+ features and best practices.
- React 19+ best practices (Hooks).
- TypeScript best practices (Strict mode, proper typing).
- Material UI v7 for styling.
- Always keep dependencies up to date.
- TanStack Query is used for front-end and external services communication.

## Stack

- **Runtime**: Node.js v24.9.0 or later
- **Framework**: Next.js 16.1.6
- **Language**: TypeScript 5.9+
- **UI Library**: React 19.2.4
- **Styling**: Material UI v7 (@mui/material)
- **Flow Modeling**: ReactFlow v11
- **Charts**: MUI X Charts v8
- **Code Editor**: ACE Editor (react-ace) / CodeMirror v6
- **Database (Client)**: IndexedDB (via `idb`)
- **Testing**:
    - **E2E**: Cypress v15.12.0
    - **Unit**: Jest v30.2.0 (ts-jest)

## Navigation & SPA Architecture

The EdgeRules Modeler is a Single Page Application (SPA) that utilizes **Hash-based Routing** instead of traditional path-based navigation. This approach ensures compatibility with Static Site Generation (SSG) for deployment on environments like AWS S3.

### Key Navigation Concepts:

- **Router**: The main entry point in `app/page.tsx` acts as a dynamic router, switching between different views based on the URL hash.
- **Hash Format**: The application uses a structured hash pattern: `#[view]/[projectId]/[subView]`.
  - Examples:
    - `#flow/project-id`: Opens the Flow Editor for a specific project.
    - `#boxed/project-id`: Opens the Boxed Expressions Editor.
    - `#code/project-id`: Opens the Code Editor.
    - `#workspace`: Navigates to the user's project workspace.
- **Hook**: The custom `useHashRoute` hook in `hooks/use-hash-route.ts` monitors `hashchange` events and parses the current view state.
- **View Components**: Instead of Next.js pages, features are organized into "Views" under `components/views/`. These are swapped dynamically within `app/page.tsx`.
- **Layouts**: The router wraps views in either `LandingLayout` or `ProjectLayout` based on the context, providing consistent navigation bars and toolbars.

## Project Structure & Module Organization

```text
/
├── bin/                    # Helper scripts (e.g., test-cypress.sh)
├── src/
│   ├── app/                # Next.js App Router (Routing)
│   │   ├── (landing)/      # Public landing/marketing routes
│   │   ├── project/        # Core editor & project operations
│   │   └── health/         # System health check endpoint
│   ├── components/         # UI Components by domain
│   │   ├── common/         # Shared UI (headers, dialogs)
│   │   ├── flow/           # ReactFlow wrappers & actions
│   │   ├── nodes/          # Custom ReactFlow node types
│   │   ├── project/        # Project management UI (toolbars, providers)
│   │   ├── layouts/        # Page-level templates (Landing vs Project)
│   │   ├── views/          # Large-scale features (Boxed/Code/Flow editors)
│   │   └── snackbar/       # Global notifications & reporting
│   ├── hooks/              # Custom React hooks (logic & state)
│   ├── providers/          # React context providers (MUI, Query, etc.)
│   ├── theme/              # MUI theme configuration
│   ├── lib/                # Core non-UI logic & utilities
│   │   ├── edgerules/      # WASM engine integration layer
│   │   ├── flow/           # Graph modeling types & mock data
│   │   ├── rules/          # Rule graph execution & validation
│   │   ├── storage/        # IndexedDB persistence layer
│   │   ├── parsers/        # Data transformations (e.g., Boxed to Portable)
│   │   └── utils/          # Shared helpers (safety, formatting)
│   └── types/              # TypeScript type definitions
├── cypress/                # E2E testing (specs & support)
├── docs/                   # Technical docs & user stories
└── public/                 # Static assets & WASM binaries (pkg-*/)
```

## Build, Test, and Development Commands

### Setup

```bash
npm install
```

### Development

- **Start Dev Server**:

    ```bash
    npm run dev
    ```

    Runs on `http://localhost:3000`.

- **Production Build**:
    ```bash
    npm run build
    ```

### Code Quality

- **Lint**:
    ```bash
    npm run lint
    ```
- **Type Check**:
    ```bash
    npm run typecheck
    ```
- **Format**:
    ```bash
    npm run format
    ```

### Testing

- **Unit Tests (Jest)**:
    ```bash
    npm run test
    npm run test:watch
    ```
- **E2E Tests (Cypress)**:
    ```bash
    npm run cypress:open  # Interactive mode
    npm run cypress:run   # Headless mode
    ```

## Coding Style & Naming Conventions

- 4 spaces for indentation
- Line length: 120 chars
- Best TypeScript, Next.js and React practices
- Use descriptive names. Never use 1 to 3 letter abbreviations (e.g., use `service` instead of `svc`, `project` instead of `prj`).

## Testing Guidelines

- Cypress for GUI testing
- Jest for unit testing
- All tests must be written in TypeScript

### Cypress Testing

- Use the helper script `bin/test-cypress.sh` (if available) to safely start the server.
- The most important test is `health.cy.ts` - if this test fails, there's no reason to continue with other tests. Warn user if health check fails!
- For failed test cases, search images in `cypress/screenshots` and analyze them to identify UI issues.
- You can add `datatest-id` attributes to elements to simplify Cypress selector scoping. However, button search and click should happen by text content to mimic user behavior.
- Tests must manually clear IndexedDB (`edgerules-modeler`) to ensure a clean state, as the app persists data locally.

## Known Issues and Memories

- **Game Option Type Consistency:** There is a known issue where the 'adjective' word type has only 6 entries, while the game logic requires 7 decoys (total 8 options) of the same type. This must be addressed when implementing the word/type logic.
