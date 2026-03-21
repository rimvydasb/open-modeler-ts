# Service 1: Projects Management — Architecture

> **Service:** Projects Management (Service 1)
> **Testing:** Jest (`lib/projects/`) | Cypress (`views/workspace/`)
> **Depends on:** Storage Abstraction (`lib/storage/`)
> **Consumed by:** UI Layer (Workspace View), Project Management (Service 2)
> **Defined types:** `StoredProject`, `ProjectListItem`, `CreateProjectInput`

## Overview

The Projects Management service handles workspace-level operations: listing, creating, duplicating, and deleting
projects stored in IndexedDB. It defines the canonical **Project BOM** (Bill of Materials) — the `StoredProject`
interface that all other services reference when they need to know what a project contains.

This service is intentionally thin. It delegates persistence to the Storage Abstraction layer
(`lib/storage/storage-interface.ts`), which means the underlying storage backend (IndexedDB today, Git or file
system in the future) can be swapped without changing any service logic. Validation (name uniqueness, required
fields) is handled by a dedicated validator component.

The frontend counterpart is the Workspace view — a project cards grid with create/delete dialogs, accessed via the
`#workspace` hash route.

## Structural Diagram

```mermaid
classDiagram
    direction TB

    class StoredProject {
        +string id
        +string name
        +string? description
        +Record~string, string~ tags
        +ProjectAssetMeta[] assets
        +string createdAt
        +string updatedAt
    }

    class ProjectAssetMeta {
        +string id
        +string filename
        +AssetKind kind
    }

    class ProjectListItem {
        +string id
        +string name
        +string? description
        +string updatedAt
        +number assetCount
    }

    class CreateProjectInput {
        +string name
        +string? description
        +Record~string, string~? tags
    }

    class ProjectsService {
        +listProjects() Result~ProjectListItem[]~
        +getProject(id) Result~StoredProject~
        +createProject(input) Result~StoredProject~
        +duplicateProject(id) Result~StoredProject~
        +deleteProject(id) Result~void~
    }

    class ProjectsRepository {
        -StorageInterface storage
        +findAll() StoredProject[]
        +findById(id) StoredProject?
        +save(project) void
        +remove(id) void
    }

    class ProjectsValidator {
        +validateCreate(input, existing) ValidationResult
        +validateUpdate(input, existing) ValidationResult
    }

    class StorageInterface {
        <<interface>>
        +get~T~(store, key) T?
        +getAll~T~(store) T[]
        +put~T~(store, key, value) void
        +delete(store, key) void
    }

    ProjectsService --> ProjectsRepository : delegates persistence
    ProjectsService --> ProjectsValidator : validates input
    ProjectsRepository --> StorageInterface : abstracts storage
    ProjectsService ..> StoredProject : manages
    ProjectsService ..> ProjectListItem : returns
    ProjectsService ..> CreateProjectInput : accepts
    StoredProject *-- "0..*" ProjectAssetMeta : contains
```

> `ProjectAsset` (content) and `ProjectAssetMeta` are defined in [02-PROJECT-SERVICE.md](02-PROJECT-SERVICE.md).

## Behavioral Diagram

```mermaid
sequenceDiagram
    participant UI as Workspace View
    participant Hook as useProjects
    participant Svc as ProjectsService
    participant Val as ProjectsValidator
    participant Repo as ProjectsRepository
    participant IDB as StorageInterface

    Note over UI, IDB: Create Project Flow
    UI ->> Hook: createProject({ name, description })
    Hook ->> Svc: createProject(input)
    Svc ->> Val: validateCreate(input, existingProjects)
    Val -->> Svc: ValidationResult

    alt validation fails
        Svc -->> Hook: Result { ok: false, error }
        Hook -->> UI: show error snackbar
    else validation passes
        Svc ->> Svc: generate UUID, set timestamps
        Svc ->> Svc: create default assets (main.ts, types.ts)
        Svc ->> Repo: save(storedProject)
        Repo ->> IDB: put("projects_metadata", id, project)
        IDB -->> Repo: void
        Repo -->> Svc: void
        Svc -->> Hook: Result { ok: true, data: StoredProject }
        Hook -->> UI: navigate to #flow/{projectId}
    end

    Note over UI, IDB: List Projects Flow
    UI ->> Hook: useProjects()
    Hook ->> Svc: listProjects()
    Svc ->> Repo: findAll()
    Repo ->> IDB: getAll("projects_metadata")
    IDB -->> Repo: StoredProject[]
    Repo -->> Svc: StoredProject[]
    Svc ->> Svc: map to ProjectListItem[]
    Svc -->> Hook: Result { ok: true, data: ProjectListItem[] }
    Hook -->> UI: render project cards

    Note over UI, IDB: Delete Project Flow
    UI ->> Hook: deleteProject(id)
    Hook ->> Svc: deleteProject(id)
    Svc ->> Repo: remove(id)
    Repo ->> IDB: delete("projects_metadata", id)
    IDB -->> Repo: void
    Svc -->> Hook: Result { ok: true }
    Hook -->> UI: refresh project list
```

## Key Interfaces

```typescript
interface StoredProject {
    id: string;                        // UUID v4
    name: string;                      // User-defined, unique within workspace
    description?: string;
    tags: Record<string, string>;      // Arbitrary key-value metadata
    assets: ProjectAssetMeta[];        // List of assets (metadata only, no content)
    createdAt: string;                 // ISO 8601
    updatedAt: string;                 // ISO 8601
}

interface ProjectAssetMeta {
    id: string;
    filename: string;
    kind: AssetKind;
}

interface ProjectListItem {
    id: string;
    name: string;
    description?: string;
    updatedAt: string;
    assetCount: number;                // Derived from assets.length
}

interface CreateProjectInput {
    name: string;
    description?: string;
    tags?: Record<string, string>;
}
```

## Components

### ProjectsService (`projects-service.ts`)

Orchestrates all project CRUD operations. Coordinates between the validator (input checks) and the repository
(persistence). Generates UUIDs for new projects, manages timestamps, and creates default assets on project creation.

**Test strategy (Jest):** Mock `ProjectsRepository`, verify correct delegation, timestamp generation, and error
handling for duplicate names.

### ProjectsRepository (`projects-repository.ts`)

Thin adapter between the service layer and the `StorageInterface`. Maps `StoredProject` objects to/from the
`"projects"` store. Contains no business logic — purely a data access layer.

**Test strategy (Jest):** Mock `StorageInterface`, verify correct store name and key usage.

### ProjectsValidator (`projects-validator.ts`)

Validates `CreateProjectInput` and update inputs. Enforces business rules:
- Project name is required and non-empty
- Project name is unique within the workspace (checked against existing projects list)
- Name length and character constraints

**Test strategy (Jest):** Pure function tests with various valid/invalid inputs.

## Default Project Assets

When a new project is created, two default assets are generated:

1. **`main.ts`** (`kind: 'source'`) — the primary TypeScript source file, initially containing a minimal `main()`
   function template
2. **`types.ts`** (`kind: 'types'`) — the default types file for user-defined interfaces, initially empty

> For file structure, see
> [ARCHITECTURE.md — Proposed Project Component Structure](ARCHITECTURE.md#proposed-project-component-structure).