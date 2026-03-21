# Service 2: Project Management — Architecture

> **Service:** Project Management (Service 2)
> **Testing:** Jest (`lib/project/`) | Cypress (`views/code-editor/`, `views/types-editor/`, `views/assets-browser/`)
> **Depends on:** Projects Management (Service 1) for `StoredProject`, AST Parsing (Service 3) for type extraction,
> Storage Abstraction (`lib/storage/`)
> **Consumed by:** UI Layer (Code Editor, Types Editor, Assets Browser), Flow Modeling (Service 4), Execution Engine
> (Service 5)
> **Defined types:** `ProjectAsset`, `AssetKind`, `ProjectMeta`, `ManagedType`, `ImporterInterface`

## Overview

The Project Management service orchestrates operations on a **single open project**. It is the "work surface" between
the workspace (Service 1, which manages the collection of projects) and the downstream consumers (AST Parsing,
Flow Modeling, Execution Engine).

The service is divided into three sub-domains, each with its own types and logic:

- **Metadata** — project name, description, tags, and timestamp management. Simple CRUD.
- **Types Management** — extracts TypeScript interfaces from source files (delegating to Service 3's parser), provides
  UI-editable representations, and manages the default `types.ts` asset.
- **Assets** — manages project files. Each asset has a `kind` discriminator (`source`, `types`, `json`, `csv`,
  `utility`, `service`) and a text-based `content` field. Format-specific importers handle parsing during file import.

The `ProjectService` acts as a façade, exposing a unified API that coordinates the three sub-services. Hooks
(`use-project`, `use-project-assets`, `use-project-types`) bridge this service to the React UI layer.

## Structural Diagram

```mermaid
classDiagram
    direction TB

    class ProjectService {
        +openProject(id) Result~OpenProject~
        +saveProject() Result~void~
        +getMetadata() ProjectMeta
        +getAssets() ProjectAsset[]
        +getManagedTypes() ManagedType[]
    }

    class MetadataService {
        +getMeta(project) ProjectMeta
        +updateMeta(project, input) StoredProject
    }

    class ProjectMeta {
        +string name
        +string? description
        +Record~string, string~ tags
        +string createdAt
        +string updatedAt
    }

    class UpdateMetadataInput {
        +string? name
        +string? description
        +Record~string, string~? tags
    }

    class TypesService {
        +extractTypes(source) ManagedType[]
        +updateType(id, changes) ManagedType
        +syncToAsset(types, project) ProjectAsset
    }

    class TypesExtractor {
        +extract(source) ManagedType[]
    }

    class ManagedType {
        +string id
        +string name
        +PropertyInfo[] properties
        +string sourceAssetId
        +boolean isEdited
    }

    class AssetsService {
        +listAssetMetadata(project) ProjectAssetMeta[]
        +getAssetContent(assetId) ProjectAsset
        +addAsset(project, asset) StoredProject
        +removeAsset(project, assetId) StoredProject
        +updateAssetContent(project, assetId, content) StoredProject
        +importFile(project, file) StoredProject
    }

    class ProjectAsset {
        +string id
        +string filename
        +AssetKind kind
        +string content
        +string createdAt
        +string updatedAt
    }

    class AssetValidator {
        +validateImport(file) ValidationResult
        +validateKind(filename) AssetKind
    }

    class ImporterInterface {
        <<interface>>
        +canImport(filename) boolean
        +import(file) ProjectAsset
    }

    class JsonImporter {
        +canImport(filename) boolean
        +import(file) ProjectAsset
    }

    class CsvImporter {
        +canImport(filename) boolean
        +import(file) ProjectAsset
    }

    class TypeScriptImporter {
        +canImport(filename) boolean
        +import(file) ProjectAsset
    }

    ProjectService --> MetadataService : metadata ops
    ProjectService --> TypesService : types ops
    ProjectService --> AssetsService : asset ops

    MetadataService ..> ProjectMeta : returns
    MetadataService ..> UpdateMetadataInput : accepts

    TypesService --> TypesExtractor : delegates parsing
    TypesExtractor ..> ManagedType : produces
    TypesExtractor --> "Service 3" : calls parseProject()

    AssetsService --> AssetValidator : validates
    AssetsService --> ImporterInterface : delegates import
    ImporterInterface <|.. JsonImporter
    ImporterInterface <|.. CsvImporter
    ImporterInterface <|.. TypeScriptImporter

    AssetsService ..> ProjectAsset : manages
```

## Behavioral Diagram

```mermaid
sequenceDiagram
    participant UI as Code Editor / Assets Browser
    participant Hook as useProject / useProjectAssets
    participant Svc as ProjectService
    participant Assets as AssetsService
    participant Val as AssetValidator
    participant Imp as ImporterInterface
    participant S1 as ProjectsService (Svc 1)
    participant IDB as StorageInterface

    Note over UI, IDB: Edit & Save Source Code
    UI ->> Hook: updateSource(newContent)
    Hook ->> Svc: updateAssetContent(projectId, assetId, content)
    Svc ->> Assets: updateAssetContent(project, assetId, content)
    Assets ->> IDB: put("project_assets", assetId, asset)
    Assets ->> Assets: find asset meta, update updatedAt
    Assets -->> Svc: updated StoredProject
    Svc ->> S1: saveProject(updatedProject)
    S1 ->> IDB: put("projects_metadata", id, project)
    IDB -->> S1: void
    S1 -->> Svc: Result { ok: true }
    Svc -->> Hook: Result { ok: true }
    Hook -->> UI: trigger re-parse (invalidate AST query)

    Note over UI, IDB: Import External File
    UI ->> Hook: importFile(file)
    Hook ->> Svc: importFile(projectId, file)
    Svc ->> Assets: importFile(project, file)
    Assets ->> Val: validateImport(file)
    Val -->> Assets: ValidationResult

    alt validation fails
        Assets -->> Svc: Result { ok: false, error }
        Svc -->> Hook: error
        Hook -->> UI: show error snackbar
    else validation passes
        Assets ->> Val: validateKind(filename)
        Val -->> Assets: AssetKind
        Assets ->> Imp: import(file)
        Imp -->> Assets: ProjectAsset
        Assets ->> IDB: put("project_assets", asset.id, asset)
        Assets ->> Assets: append asset meta to project
        Assets -->> Svc: updated StoredProject
        Svc ->> S1: saveProject(updatedProject)
        S1 ->> IDB: put("projects_metadata", id, project)
        Svc -->> Hook: Result { ok: true }
        Hook -->> UI: refresh asset list
    end
```

## Key Interfaces

```typescript
type AssetKind = 'source' | 'types' | 'json' | 'csv' | 'utility' | 'service';

interface ProjectAsset {
    id: string; // UUID v4
    filename: string; // e.g. "main.ts", "config.json"
    kind: AssetKind; // Discriminator for UI rendering and import handling
    content: string; // File contents (text-based)
    createdAt: string; // ISO 8601
    updatedAt: string; // ISO 8601
}

interface ProjectMeta {
    name: string;
    description?: string;
    tags: Record<string, string>;
    createdAt: string;
    updatedAt: string;
}

interface UpdateMetadataInput {
    name?: string;
    description?: string;
    tags?: Record<string, string>;
}

interface ManagedType {
    id: string; // Derived from interface name
    name: string; // Interface name (e.g. "LoanInput")
    properties: PropertyInfo[]; // From AST parsing
    sourceAssetId: string; // Which asset this type was extracted from
    isEdited: boolean; // True if user has modified via Types Editor
}

interface ImporterInterface {
    canImport(filename: string): boolean;
    import(file: File | string): ProjectAsset;
}
```

## Components

### ProjectService (`project-service.ts`)

Façade that coordinates metadata, types, and assets sub-services. Provides a single entry point for hooks to
interact with a currently open project. Manages the "save to Service 1" workflow.

**Test strategy (Jest):** Mock sub-services, verify correct delegation and save coordination.

### MetadataService (`metadata/metadata-service.ts`)

Reads and updates project metadata fields. Automatically manages `updatedAt` timestamps on any change.

**Test strategy (Jest):** Pure functions — input/output pairs for metadata updates.

### TypesExtractor (`types-management/types-extractor.ts`)

Delegates to Service 3's `parseProject()` to extract `InterfaceDeclaration` entries from a source asset, then maps
them to `ManagedType[]` for the Types Editor UI. This is the bridge between the AST world and the types
management world.

**Test strategy (Jest):** Mock Service 3 parser, verify correct extraction and mapping of interface declarations.

### TypesService (`types-management/types-service.ts`)

CRUD operations on managed types. Handles user edits from the Types Editor and syncs changes back to the `types.ts`
asset content. Manages the creation of the default `types.ts` asset if it doesn't exist.

**Test strategy (Jest):** Verify type sync produces valid TypeScript interface strings.

### AssetsService (`assets/assets-service.ts`)

Asset CRUD operations: add, remove, rename, update content, and import. Coordinates with the validator and importers
during file import. Does not directly persist — returns the updated `StoredProject` for the caller to save.

**Test strategy (Jest):** Mock validators and importers, verify asset list manipulation.

### AssetValidator (`assets/asset-validator.ts`)

Validates file imports: checks file extension against allowed kinds, enforces size limits, detects duplicate filenames
within the project.

**Test strategy (Jest):** Pure validation functions with valid/invalid file inputs.

### Importers (`assets/importers/`)

Each importer implements `ImporterInterface`:

- **JsonImporter** — validates JSON syntax, creates `kind: 'json'` asset
- **CsvImporter** — parses CSV headers, creates `kind: 'csv'` asset
- **TypeScriptImporter** — reads TypeScript source, creates `kind: 'source'` or `kind: 'utility'` asset

**Test strategy (Jest):** Input file content → output `ProjectAsset` assertions.

> For file structure, see
> [ARCHITECTURE.md — Proposed Project Component Structure](ARCHITECTURE.md#proposed-project-component-structure).
