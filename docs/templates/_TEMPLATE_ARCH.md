# Service N: [SERVICE NAME] — Architecture

- **Testing:** Jest (`lib/[service-path]/`) | Cypress (`views/[view-path]/`)
- **Depends on:** [DEPENDENCY 1], [DEPENDENCY 2]
- **Consumed by:** [CONSUMER 1], [CONSUMER 2]
- **Defined types:** `[Type1]`, `[Type2]`, `[Type3]`

## Overview

[Brief high-level description of the service's responsibility and its role in the system.]

## Structural Diagram

```mermaid
classDiagram
    direction TB

    class ServiceClass {
        +method1() void
        +method2() Result~Type~
    }

    class DataModel {
        +string id
        +string name
    }

    ServiceClass ..> DataModel : manages
```

## Behavioral Diagram

```mermaid
sequenceDiagram
    participant UI as [View Name]
    participant Hook as use[HookName]
    participant Svc as [ServiceClass]
    participant IDB as StorageInterface

    Note over UI, IDB: [Action Name] Flow
    UI ->> Hook: action()
    Hook ->> Svc: action()
    Svc ->> IDB: put()
    IDB -->> Svc: void
    Svc -->> Hook: Result
    Hook -->> UI: update UI
```

## Key Interfaces

```typescript
interface [Type1] {
    id: string;
    // ...
}
```

## Components

### [Component Name] (`[file-path].ts`)

[Description of the component's responsibility.]

**Test strategy (Jest):** [Description of testing approach.]

### [Component Name] (`[file-path].ts`)

[Description of the component's responsibility.]

**Test strategy (Jest):** [Description of testing approach.]

> For file structure, see
> [ARCHITECTURE.md — Proposed Project Component Structure](ARCHITECTURE.md#proposed-project-component-structure).
