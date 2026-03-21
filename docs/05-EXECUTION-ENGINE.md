# Service 5: Execution Engine Architecture

## Runtime Execution Architecture (Host vs. Guest)

This view focuses entirely on the Host vs. Guest execution boundary, memory isolation, and host-guest communication. The Guest (QuickJS) is completely unaware of TypeScript or the AST; it only executes transpiled JavaScript and communicates through the strict FFI (Foreign Function Interface) boundary.

```mermaid
graph TB
    subgraph HostEnvironment["Host Environment (SPA) - Execution Engine (Service 5)"]
        ENG["Host Context & Input Prep"]
        HOOKS["Host Bridge<br/>(Hooks Implementation)"]
        AP["App Preview<br/>(React State)"]
        TSQ["TanStack Query<br/>(Request Manager)"]
    end

    subgraph SecurityBoundary["FFI Boundary"]
        FFI["Secure Sandbox Isolation"]
    end

    subgraph GuestEnvironment["Guest Environment - QuickJS"]
        QJS["QuickJS VM<br/>(V8 / WASM)"]
        EXEC["Executing Logic"]
    end

    subgraph ExternalServices["External Services"]
        LLM["Local LLM Endpoint"]
        API["External HTTP APIs"]
    end

    ENG -- " 1. Inject Executable JS " --> QJS
    ENG -- " 2. Pass Inputs (mapped via signatures) " --> QJS
    
    QJS --- FFI
    FFI --- HOOKS

    QJS -- " await ai(), fetch() " --> HOOKS
    QJS -- " chart(), table(), log() " --> HOOKS

    HOOKS -- " push data " --> AP
    HOOKS -- " async request " --> TSQ
    
    TSQ -- " HTTP " --> LLM
    TSQ -- " HTTP " --> API

    style HostEnvironment fill: #e3f2fd, stroke: #1565c0
    style GuestEnvironment fill: #e8f5e9, stroke: #2e7d32
    style SecurityBoundary fill: #cfd8dc, stroke: #424242, color: #000
    style ExternalServices fill: #fce4ec, stroke: #c62828
```
