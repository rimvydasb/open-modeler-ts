# Service 2: Project Service Architecture

## Bounded Context
This service acts as the orchestrator for a single project's internal data (Metadata, Assets, Types) *before* it gets handed to the AST or Flow editors.

*   **Depends on:** Service 1 (Projects), Service 3 (AST Parsing - for Types Extraction)
*   **Depended on by:** UI Layer (Project Editor, Assets Browser, Types Editor), Service 3, Service 4

*(Detailed architecture and data flows for this service will be documented here.)*