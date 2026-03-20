# Business Logic Execution: ai() Method Bridge

Sequence diagram for secure TypeScript (TS) execution via QuickJS VM and LLM bridge.

## Execution Workflow

```mermaid
sequenceDiagram
    participant User as 👤 User (GUI)
    participant IDB as 💾 IndexedDB
    participant TSM as 🏗️ ts-morph
    participant ESB as ⚡ esbuild-wasm
    participant QJS as 🛡️ QuickJS VM
    participant SPA as 🌐 SPA (Host)
    participant LLM as 🤖 Local LLM

    User->>IDB: Fetch business_logic.ts
    IDB-->>User: Pure TS Code

    Note over User, TSM: 1. Analysis
    User->>TSM: Read Function Signatures
    TSM-->>User: Metadata (Params/Returns)

    Note over User, ESB: 2. Transpile
    User->>ESB: Strip Types (TS -> JS)

    Note over User, LLM: 3. Execution with ai() Bridge
    User->>QJS: Create Context
    User->>QJS: Inject native ai(prompt) bridge

    QJS->>QJS: Start Business Logic
    QJS->>SPA: ai("Analyze this...") call (Suspended)

    SPA->>LLM: Fetch completion
    LLM-->>SPA: JSON Response

    SPA->>QJS: Resolve ai() Promise & Resume

    QJS-->>User: Final Result
    User->>QJS: Dispose Context
```

## Key Phases

### 1. Analysis Phase
Uses **ts-morph** to extract AST metadata. The host knows exactly what inputs the script requires before it hits the VM.

### 2. Transpilation
**esbuild-wasm** strips types. Runs entirely within the browser's worker threads — no server round-trip.

### 3. The Bridge
`ai()` is a native injection, not standard JS. When called, it suspends the VM until the host resolves the LLM request.

### 4. Context Disposal
Each execution is ephemeral. Disposing the **QuickJS** context prevents memory leaks and ensures no state bleeds between runs.
