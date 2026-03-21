export type {StorageInterface} from './storage-interface';
export {IndexedDbAdapter, resetDatabasePromise} from './indexeddb/indexeddb-adapter';

import {IndexedDbAdapter} from './indexeddb/indexeddb-adapter';
import type {StorageInterface} from './storage-interface';

let storageInstance: StorageInterface | null = null;

export function getStorage(): StorageInterface {
    if (!storageInstance) {
        storageInstance = new IndexedDbAdapter();
    }
    return storageInstance;
}

export function setStorage(storage: StorageInterface): void {
    storageInstance = storage;
}
