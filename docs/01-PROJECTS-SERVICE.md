# Service 1: Projects Service Architecture

## Bounded Context
This service focuses purely on Workspace concerns: multi-project listing, creation, deletion, and IndexedDB persistence orchestration.

*   **Depends on:** Storage Adapters (IndexedDB)
*   **Depended on by:** UI Layer (Workspace View, Service 2)

*(Detailed architecture and data flows for this service will be documented here.)*