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
        description: 'Description',
        tags: {},
        assets: [],
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
        ...overrides,
    };
}

describe('ProjectsRepository', () => {
    let storage: jest.Mocked<StorageInterface>;
    let repository: ProjectsRepository;

    beforeEach(() => {
        storage = createMockStorage();
        repository = new ProjectsRepository(storage);
    });

    describe('findAll', () => {
        it('should return all projects from storage', async () => {
            const projects = [makeProject({id: '1'}), makeProject({id: '2'})];
            storage.getAll.mockResolvedValue(projects);

            const result = await repository.findAll();

            expect(storage.getAll).toHaveBeenCalledWith('projects_metadata');
            expect(result).toEqual(projects);
        });

        it('should return empty array when no projects', async () => {
            storage.getAll.mockResolvedValue([]);

            const result = await repository.findAll();

            expect(result).toEqual([]);
        });
    });

    describe('findById', () => {
        it('should return a project by id', async () => {
            const project = makeProject();
            storage.get.mockResolvedValue(project);

            const result = await repository.findById('project-1');

            expect(storage.get).toHaveBeenCalledWith('projects_metadata', 'project-1');
            expect(result).toEqual(project);
        });

        it('should return undefined for missing project', async () => {
            storage.get.mockResolvedValue(undefined);

            const result = await repository.findById('nonexistent');

            expect(result).toBeUndefined();
        });
    });

    describe('save', () => {
        it('should persist a project to storage', async () => {
            const project = makeProject();
            storage.put.mockResolvedValue();

            await repository.save(project);

            expect(storage.put).toHaveBeenCalledWith('projects_metadata', 'project-1', project);
        });
    });

    describe('remove', () => {
        it('should delete a project from storage', async () => {
            storage.delete.mockResolvedValue();

            await repository.remove('project-1');

            expect(storage.delete).toHaveBeenCalledWith('projects_metadata', 'project-1');
        });
    });
});
