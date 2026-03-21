export type AssetKind = 'source' | 'types' | 'json' | 'csv' | 'utility' | 'service';

export interface ProjectAssetMeta {
    id: string;
    filename: string;
    kind: AssetKind;
}

export interface StoredProject {
    id: string;
    name: string;
    description?: string;
    tags: Record<string, string>;
    assets: ProjectAssetMeta[];
    createdAt: string;
    updatedAt: string;
}

export interface ProjectListItem {
    id: string;
    name: string;
    description?: string;
    updatedAt: string;
    assetCount: number;
}

export interface CreateProjectInput {
    name: string;
    description?: string;
    tags?: Record<string, string>;
}

export interface ExampleProjectManifest {
    id: string;
    name: string;
    description: string;
    sourceFile: string;
}
