export interface StorageInterface {
    get<T>(store: string, key: string): Promise<T | undefined>;
    getAll<T>(store: string): Promise<T[]>;
    put<T>(store: string, key: string, value: T): Promise<void>;
    delete(store: string, key: string): Promise<void>;
}
