# GEMINI Context: open-modeler-ts

This project is a TypeScript-based implementation of a modeling tool or framework, currently in its initial setup phase.

## Project Overview

- **Name:** open-modeler-ts
- **Type:** Code Project (TypeScript/Node.js)
- **Status:** Initialized (Skeleton)
- **License:** Apache License 2.0

## Technology Stack

- **Language:** TypeScript
- **Runtime:** Node.js (inferred from `.gitignore`)
- **IDE:** IntelliJ IDEA (configured with `.idea` folder)
- **Version Control:** Git

## Building and Running

Since the project is in its initial phase and lacks a `package.json` or build scripts, the following steps are required to initialize the environment:

- [ ] Run `npm init` to create a `package.json` file.
- [ ] Install TypeScript and necessary development tools: `npm install --save-dev typescript @types/node`.
- [ ] Initialize TypeScript configuration: `npx tsc --init`.
- [ ] Define build and test scripts in `package.json`.

## Development Conventions

All development must adhere to the global standards defined in the environment:

- **Indentation:** 4 spaces (never tabs).
- **Line Length:** Maximum 120 characters for code and markdown.
- **Naming:** Descriptive names for variables, functions, and classes; no abbreviations.
- **Constants:** Always in `UPPER_CASE`.
- **Documentation:** Markdown format with proper headings and lists.
- **Tasks:** Use markdown checkboxes (`- [ ] Task`) for tracking progress.

### Workflow

- **Task Management:** Tasks, stories, and specifications use the `_STORY.md` and `_SPEC.md` naming conventions.
- **Git:** All code changes must be reviewed; committing or pushing directly is prohibited.
- **Validation:** Always verify changes with tests and linting before completion.

## Known Issues and Memories

- **Game Option Type Consistency:** There is a known issue (possibly inherited from a related project or a design requirement) where the 'adjective' word type has only 6 entries, while the game logic requires 7 decoys (total 8 options) of the same type. This must be addressed when implementing the word/type logic.
