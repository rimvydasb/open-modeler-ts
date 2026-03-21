# EdgeRules Modeler

EdgeRules Modeler is a web-based tool for creating, editing, and testing EdgeRules rulesets and functions.

## Getting Started

### Prerequisites

- Node.js (version specified in `package.json`)
- npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build (Static Export for S3)

```bash
npm run build
```

The static files will be generated in the `dist/` directory, which can be uploaded directly to an S3 bucket.

## Project Structure

- `src/app`: App Router pages and layouts.
- `src/components`: Reusable UI components.
- `src/theme`: MUI theme configuration.
- `src/providers`: React Query and MUI providers.
- `src/lib`: Utility functions and core logic.
- `src/types`: TypeScript type definitions.
- `public`: Static assets.

## Stack

- **Framework:** Next.js (App Router)
- **UI:** Material UI (MUI)
- **State Management:** React Query (TanStack Query)
- **Node Graph:** ReactFlow
- **Code Editor:** ACE Editor (react-ace)
- **Testing:** Jest, Cypress
- **Styling:** Vanilla CSS (per instructions) / MUI Emotion
