import type {StorageInterface} from '@/lib/storage';
import type {StoredProject} from './projects-types';

const STORE_NAME = 'projects_metadata';

export class ProjectsRepository {
    constructor(private readonly storage: StorageInterface) {}

    async findAll(): Promise<StoredProject[]> {
        return this.storage.getAll<StoredProject>(STORE_NAME);
    }

    async findById(id: string): Promise<StoredProject | undefined> {
        return this.storage.get<StoredProject>(STORE_NAME, id);
    }

    async save(project: StoredProject): Promise<void> {
        await this.storage.put(STORE_NAME, project.id, project);
    }

    async remove(id: string): Promise<void> {
        await this.storage.delete(STORE_NAME, id);
    }
}
