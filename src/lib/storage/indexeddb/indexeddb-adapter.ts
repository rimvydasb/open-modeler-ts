import {openDB, deleteDB, type IDBPDatabase} from 'idb';
import type {StorageInterface} from '../storage-interface';

const DATABASE_NAME = 'edgerules-modeler';
const DATABASE_VERSION = 2;

const STORE_NAMES = ['projects_metadata', 'project_assets'] as const;

let databasePromise: Promise<IDBPDatabase> | null = null;

function hasAllStores(database: IDBPDatabase): boolean {
    return STORE_NAMES.every((name) => database.objectStoreNames.contains(name));
}

async function openFreshDatabase(): Promise<IDBPDatabase> {
    return openDB(DATABASE_NAME, DATABASE_VERSION, {
        upgrade(database) {
            for (const storeName of STORE_NAMES) {
                if (!database.objectStoreNames.contains(storeName)) {
                    database.createObjectStore(storeName);
                }
            }
        },
    });
}

function getDatabase(): Promise<IDBPDatabase> {
    if (!databasePromise) {
        databasePromise = openFreshDatabase().then(async (database) => {
            if (hasAllStores(database)) {
                return database;
            }
            // Stale database from a previous schema — delete and recreate
            console.error(
                `[IndexedDbAdapter] Database "${DATABASE_NAME}" is missing stores. ` +
                `Expected: [${STORE_NAMES.join(', ')}], ` +
                `Found: [${Array.from(database.objectStoreNames).join(', ')}]. ` +
                `Deleting and recreating database.`
            );
            database.close();
            await deleteDB(DATABASE_NAME);
            return openFreshDatabase();
        });
    }
    return databasePromise;
}

export function resetDatabasePromise(): void {
    databasePromise = null;
}

export class IndexedDbAdapter implements StorageInterface {
    async get<T>(store: string, key: string): Promise<T | undefined> {
        try {
            const database = await getDatabase();
            return await (database.get(store, key) as Promise<T | undefined>);
        } catch (error) {
            console.error(`[IndexedDbAdapter] get("${store}", "${key}") failed:`, error);
            throw error;
        }
    }

    async getAll<T>(store: string): Promise<T[]> {
        try {
            const database = await getDatabase();
            return await (database.getAll(store) as Promise<T[]>);
        } catch (error) {
            console.error(`[IndexedDbAdapter] getAll("${store}") failed:`, error);
            throw error;
        }
    }

    async put<T>(store: string, key: string, value: T): Promise<void> {
        try {
            const database = await getDatabase();
            await database.put(store, value, key);
        } catch (error) {
            console.error(`[IndexedDbAdapter] put("${store}", "${key}") failed:`, error);
            throw error;
        }
    }

    async delete(store: string, key: string): Promise<void> {
        try {
            const database = await getDatabase();
            await database.delete(store, key);
        } catch (error) {
            console.error(`[IndexedDbAdapter] delete("${store}", "${key}") failed:`, error);
            throw error;
        }
    }
}
