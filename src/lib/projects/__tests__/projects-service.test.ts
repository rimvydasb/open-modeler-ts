import {ProjectsService} from '../projects-service';
import {ProjectsRepository} from '../projects-repository';
import type {StorageInterface} from '@/lib/storage';
import type {StoredProject} from '../projects-types';

function createMockStorage(): jest.Mocked<StorageInterface> {
    return {
        get: jest.fn(),
        getAll: jest.fn(),
        put: jest.fn(),
        delete: jest.fn(),
    };
}

function makeProject(overrides: Partial<StoredProject> = {}): StoredProject {
    return {
        id: 'project-1',
        name: 'Test Project',
        description: 'A test project',
        tags: {},
        assets: [
            {id: 'asset-1', filename: 'main.ts', kind: 'source'},
            {id: 'asset-2', filename: 'types.ts', kind: 'types'},
        ],
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
        ...overrides,
    };
}

describe('ProjectsService', () => {
    let storage: jest.Mocked<StorageInterface>;
    let service: ProjectsService;

    beforeEach(() => {
        storage = createMockStorage();
        const repository = new ProjectsRepository(storage);
        service = new ProjectsService(repository, storage);
    });

    describe('listProjects', () => {
        it('should return project list items sorted by updatedAt descending', async () => {
            const projects = [
                makeProject({id: '1', name: 'Older', updatedAt: '2026-01-01T00:00:00.000Z'}),
                makeProject({id: '2', name: 'Newer', updatedAt: '2026-03-01T00:00:00.000Z'}),
            ];
            storage.getAll.mockResolvedValue(projects);

            const result = await service.listProjects();

            expect(result.ok).toBe(true);
            if (result.ok) {
                expect(result.data).toHaveLength(2);
                expect(result.data[0].name).toBe('Newer');
                expect(result.data[1].name).toBe('Older');
                expect(result.data[0].assetCount).toBe(2);
            }
        });

        it('should return empty list when no projects exist', async () => {
            storage.getAll.mockResolvedValue([]);

            const result = await service.listProjects();

            expect(result.ok).toBe(true);
            if (result.ok) {
                expect(result.data).toHaveLength(0);
            }
        });
    });

    describe('getProject', () => {
        it('should return a project by id', async () => {
            const project = makeProject();
            storage.get.mockResolvedValue(project);

            const result = await service.getProject('project-1');

            expect(result.ok).toBe(true);
            if (result.ok) {
                expect(result.data.name).toBe('Test Project');
            }
        });

        it('should return error for missing project', async () => {
            storage.get.mockResolvedValue(undefined);

            const result = await service.getProject('nonexistent');

            expect(result.ok).toBe(false);
            if (!result.ok) {
                expect(result.error.code).toBe('NOT_FOUND');
            }
        });
    });

    describe('createProject', () => {
        it('should create a project with default assets', async () => {
            storage.getAll.mockResolvedValue([]);
            storage.put.mockResolvedValue();

            const result = await service.createProject({name: 'New Project', description: 'A description'});

            expect(result.ok).toBe(true);
            if (result.ok) {
                expect(result.data.name).toBe('New Project');
                expect(result.data.description).toBe('A description');
                expect(result.data.assets).toHaveLength(2);
                expect(result.data.assets[0].filename).toBe('main.ts');
                expect(result.data.assets[0].kind).toBe('source');
                expect(result.data.assets[1].filename).toBe('types.ts');
                expect(result.data.assets[1].kind).toBe('types');
                expect(result.data.id).toBeDefined();
                expect(result.data.createdAt).toBeDefined();
            }
            expect(storage.put).toHaveBeenCalled();
        });

        it('should reject duplicate project names', async () => {
            storage.getAll.mockResolvedValue([makeProject({name: 'Existing'})]);

            const result = await service.createProject({name: 'Existing'});

            expect(result.ok).toBe(false);
            if (!result.ok) {
                expect(result.error.message).toContain('already exists');
            }
        });

        it('should reject empty project names', async () => {
            storage.getAll.mockResolvedValue([]);

            const result = await service.createProject({name: ''});

            expect(result.ok).toBe(false);
            if (!result.ok) {
                expect(result.error.message).toBe('Project name is required');
            }
        });
    });

    describe('duplicateProject', () => {
        it('should duplicate a project with a new name', async () => {
            const original = makeProject({name: 'Original'});
            storage.get.mockResolvedValue(original);
            storage.getAll.mockResolvedValue([original]);
            storage.put.mockResolvedValue();

            const result = await service.duplicateProject('project-1');

            expect(result.ok).toBe(true);
            if (result.ok) {
                expect(result.data.name).toBe('Original (Copy)');
                expect(result.data.id).not.toBe('project-1');
            }
        });

        it('should return error for missing project', async () => {
            storage.get.mockResolvedValue(undefined);

            const result = await service.duplicateProject('nonexistent');

            expect(result.ok).toBe(false);
            if (!result.ok) {
                expect(result.error.code).toBe('NOT_FOUND');
            }
        });
    });

    describe('deleteProject', () => {
        it('should delete an existing project', async () => {
            storage.get.mockResolvedValue(makeProject());
            storage.delete.mockResolvedValue();

            const result = await service.deleteProject('project-1');

            expect(result.ok).toBe(true);
            expect(storage.delete).toHaveBeenCalledWith('projects_metadata', 'project-1');
        });

        it('should return error when project not found', async () => {
            storage.get.mockResolvedValue(undefined);

            const result = await service.deleteProject('nonexistent');

            expect(result.ok).toBe(false);
            if (!result.ok) {
                expect(result.error.code).toBe('NOT_FOUND');
            }
        });
    });
});
