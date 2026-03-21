import type {Result} from '@/types/common';
import {success, failure} from '@/types/common';
import {NotFoundError, ServiceError} from '@/types/errors';
import {generateId, nowIso} from '@/lib/utils';
import type {StorageInterface} from '@/lib/storage';
import {ProjectsRepository} from './projects-repository';
import {validateCreate} from './projects-validator';
import type {StoredProject, ProjectListItem, CreateProjectInput} from './projects-types';

export class ProjectsService {
    constructor(
        private readonly repository: ProjectsRepository,
        private readonly storage: StorageInterface,
    ) {}

    async listProjects(): Promise<Result<ProjectListItem[]>> {
        try {
            const projects = await this.repository.findAll();
            const items: ProjectListItem[] = projects.map((project) => ({
                id: project.id,
                name: project.name,
                description: project.description,
                updatedAt: project.updatedAt,
                assetCount: project.assets.length,
            }));
            items.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
            return success(items);
        } catch (error) {
            console.error('[ProjectsService] listProjects failed:', error);
            return failure(new ServiceError('LIST_FAILED', 'Failed to list projects', error));
        }
    }

    async getProject(id: string): Promise<Result<StoredProject>> {
        try {
            const project = await this.repository.findById(id);
            if (!project) {
                return failure(new NotFoundError('Project', id));
            }
            return success(project);
        } catch (error) {
            console.error(`[ProjectsService] getProject("${id}") failed:`, error);
            return failure(new ServiceError('GET_FAILED', `Failed to get project ${id}`, error));
        }
    }

    async createProject(input: CreateProjectInput): Promise<Result<StoredProject>> {
        try {
            const existing = await this.repository.findAll();
            const validation = validateCreate(input, existing);
            if (!validation.valid) {
                return failure(validation.error!);
            }

            const now = nowIso();
            const project: StoredProject = {
                id: generateId(),
                name: input.name.trim(),
                description: input.description?.trim(),
                tags: input.tags ?? {},
                assets: [
                    {id: generateId(), filename: 'main.ts', kind: 'source'},
                    {id: generateId(), filename: 'types.ts', kind: 'types'},
                ],
                createdAt: now,
                updatedAt: now,
            };

            await this.repository.save(project);
            return success(project);
        } catch (error) {
            if ((error as {code?: string}).code === 'VALIDATION_ERROR') {
                return failure(error as ServiceError);
            }
            console.error('[ProjectsService] createProject failed:', error);
            return failure(new ServiceError('CREATE_FAILED', 'Failed to create project', error));
        }
    }

    async createProjectFromSource(
        input: CreateProjectInput,
        sourceContent: string,
    ): Promise<Result<StoredProject>> {
        try {
            const existing = await this.repository.findAll();

            let projectName = input.name.trim();
            const baseName = projectName;
            let counter = 1;
            while (existing.some((project) => project.name.toLowerCase() === projectName.toLowerCase())) {
                counter++;
                projectName = `${baseName} (${counter})`;
            }

            const now = nowIso();
            const mainAssetId = generateId();
            const project: StoredProject = {
                id: generateId(),
                name: projectName,
                description: input.description?.trim(),
                tags: {...(input.tags ?? {}), source: 'public-library'},
                assets: [
                    {id: mainAssetId, filename: 'main.ts', kind: 'source'},
                    {id: generateId(), filename: 'types.ts', kind: 'types'},
                ],
                createdAt: now,
                updatedAt: now,
            };

            await this.repository.save(project);

            await this.storage.put('project_assets', `${project.id}:${mainAssetId}`, {
                id: mainAssetId,
                projectId: project.id,
                filename: 'main.ts',
                kind: 'source',
                content: sourceContent,
                updatedAt: now,
            });

            return success(project);
        } catch (error) {
            console.error('[ProjectsService] createProjectFromSource failed:', error);
            return failure(new ServiceError('CREATE_FROM_SOURCE_FAILED', 'Failed to create project from source', error));
        }
    }

    async duplicateProject(id: string): Promise<Result<StoredProject>> {
        try {
            const original = await this.repository.findById(id);
            if (!original) {
                return failure(new NotFoundError('Project', id));
            }

            const existing = await this.repository.findAll();
            let copyName = `${original.name} (Copy)`;
            let counter = 1;
            while (existing.some((project) => project.name.toLowerCase() === copyName.toLowerCase())) {
                counter++;
                copyName = `${original.name} (Copy ${counter})`;
            }

            const now = nowIso();
            const duplicate: StoredProject = {
                ...original,
                id: generateId(),
                name: copyName,
                assets: original.assets.map((asset) => ({...asset, id: generateId()})),
                createdAt: now,
                updatedAt: now,
            };

            await this.repository.save(duplicate);
            return success(duplicate);
        } catch (error) {
            console.error(`[ProjectsService] duplicateProject("${id}") failed:`, error);
            return failure(new ServiceError('DUPLICATE_FAILED', `Failed to duplicate project ${id}`, error));
        }
    }

    async deleteProject(id: string): Promise<Result<void>> {
        try {
            const project = await this.repository.findById(id);
            if (!project) {
                return failure(new NotFoundError('Project', id));
            }
            await this.repository.remove(id);
            return success(undefined);
        } catch (error) {
            console.error(`[ProjectsService] deleteProject("${id}") failed:`, error);
            return failure(new ServiceError('DELETE_FAILED', `Failed to delete project ${id}`, error));
        }
    }
}
