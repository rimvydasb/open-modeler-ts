# Copilot Instructions — EdgeRules Modeler

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

## Commands

```bash
npm run dev            # Dev server on http://localhost:3000
npm run build          # Static export to dist/ (SSG for S3)
npm run lint           # ESLint
npm run typecheck      # tsc --noEmit
npm run format         # Prettier check

npm test               # Jest unit tests
npm test -- --testPathPattern='storage' # Run tests matching a pattern
npm test -- path/to/file.test.ts        # Run a single test file
npm run test:watch     # Jest watch mode

npm run cypress:open   # Cypress interactive
npm run cypress:run    # Cypress headless (requires dev server on :3000)
```

## Architecture

This is a **statically exported Next.js SPA** deployed to S3. There is no server — all logic runs client-side.

### Hash-Based Routing (not file-based)

The app uses **hash-based routing** (`#view/projectId/subView`) instead of Next.js file-based routing. This is required for S3 static hosting compatibility.

- `src/app/page.tsx` acts as the single entry point / router, switching views based on the URL hash.
- Views live in `src/components/views/`, not in `src/app/` pages.
- The `useHashRoute` hook (in `src/hooks/`) parses hash state.
- Layouts (`LandingLayout` / `ProjectLayout`) wrap views based on context.

### Data Flow

- **Persistence**: IndexedDB via the `idb` library (database name: `edgerules-modeler`). No backend.
- **WASM Engine**: EdgeRules engine binaries in `public/pkg-web/`, aliased as `edge-rules` in tsconfig paths.
- **State**: TanStack Query for async state; React context providers in `src/providers/`.
- **Execution**: Business logic scripts are parsed via ts-morph AST, then executed in a QuickJS VM sandbox.

### Provider Hierarchy (in `layout.tsx`)

```
QueryProvider → MuiProvider (ThemeProvider + CssBaseline + SnackbarProvider) → Page
```

## Key Conventions

- **Indentation**: 4 spaces (2 spaces for JSON files).
- **Line length**: 120 characters.
- **Quotes**: Single quotes, no bracket spacing (`{foo}` not `{ foo }`), trailing commas.
- **Naming**: Use full descriptive names — never 1–3 letter abbreviations (`service` not `svc`, `project` not `prj`).
- **Path alias**: `@/` maps to `src/` (e.g., `import theme from '@/theme/theme'`).
- **Client components**: Mark with `'use client'` — required since SSG has no server runtime.
- **Styling**: Material UI v7 (`@mui/material`), using `sx` prop. No CSS modules.

## Testing

- **Jest**: Unit tests in TypeScript. Uses `jsdom` environment with `@testing-library/react`.
- **Cypress**: E2E tests in `cypress/e2e/`. Tests must clear IndexedDB (`edgerules-modeler`) for clean state.
  - Click buttons by text content (mimics user behavior), not by selectors.
  - Use `data-testid` attributes for scoping non-button elements.
  - If `health.cy.ts` exists and fails, stop — other tests are unreliable.
  - Check `cypress/screenshots/` for failure analysis.

## Documentation

Architecture docs and design specs live in `docs/`. Additional stories and specs may be in the sibling repo `../edgerules-docs`. Document naming:

- `*_ARCH.md` — Architecture design
- `*_REQ.md` — Requirements
- `*_STORY.md` — Implementation stories
- `*_SPEC.md` — Completed specifications
