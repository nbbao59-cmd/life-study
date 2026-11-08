import { DocumentItem } from '../types';

const DATABASE = 'life-study-dashboard';
const STORE = 'documents';

interface StoredDocument extends DocumentItem {
  blob: Blob;
}

let database: Promise<IDBDatabase> | undefined;

function isIndexedDBAvailable(): boolean {
  try {
    return typeof indexedDB !== 'undefined' && indexedDB !== null;
  } catch {
    return false;
  }
}

function openDatabase(): Promise<IDBDatabase> {
  if (!isIndexedDBAvailable()) {
    return Promise.reject(new Error('Trình duyệt hoặc môi trường hiện tại không hỗ trợ IndexedDB để lưu trữ tài liệu cục bộ.'));
  }

  if (!database) {
    database = new Promise<IDBDatabase>((resolve, reject) => {
      try {
        const request = indexedDB.open(DATABASE, 1);
        request.onupgradeneeded = () => {
          const db = request.result;
          if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: 'id' });
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => {
          const err = request.error;
          reject(err ?? new Error('Không thể mở cơ sở dữ liệu IndexedDB trên thiết bị.'));
        };
        request.onblocked = () => reject(new Error('Kho tài liệu đang bị khóa bởi tab khác. Hãy tải lại trang.'));
      } catch (e) {
        reject(e instanceof Error ? e : new Error(String(e)));
      }
    }).catch((error) => {
      database = undefined;
      throw error;
    });
  }

  return database!;
}

function requestValue<T>(mode: IDBTransactionMode, action: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return openDatabase().then((db) => new Promise<T>((resolve, reject) => {
    try {
      const transaction = db.transaction(STORE, mode);
      const store = transaction.objectStore(STORE);
      const request = action(store);
      let value: T | undefined;

      request.onsuccess = () => { value = request.result; };
      request.onerror = () => {
        const err = request.error;
        if (err && (err.name === 'QuotaExceededError' || err.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
          reject(new Error('Dung lượng lưu trữ của trình duyệt đã đầy. Hãy xóa bớt tài liệu cũ trước khi thêm mới.'));
        } else {
          reject(err ?? new Error('Lỗi khi thao tác với kho tài liệu.'));
        }
      };

      transaction.oncomplete = () => resolve(value as T);
      transaction.onerror = () => {
        const err = transaction.error;
        if (err && (err.name === 'QuotaExceededError' || err.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
          reject(new Error('Dung lượng lưu trữ của trình duyệt đã đầy. Hãy xóa bớt tài liệu cũ trước khi thêm mới.'));
        } else {
          reject(err ?? new Error('Không thể hoàn tất giao dịch lưu tài liệu.'));
        }
      };
      transaction.onabort = () => {
        const err = transaction.error;
        if (err && (err.name === 'QuotaExceededError' || err.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
          reject(new Error('Dung lượng lưu trữ của trình duyệt đã đầy. Hãy xóa bớt tài liệu cũ trước khi thêm mới.'));
        } else {
          reject(err ?? new Error('Thao tác với kho tài liệu đã bị hủy.'));
        }
      };
    } catch (e) {
      reject(e instanceof Error ? e : new Error(String(e)));
    }
  }));
}

export async function listDocuments(): Promise<DocumentItem[]> {
  const stored = await requestValue<StoredDocument[]>('readonly', (store) => store.getAll());
  return stored
    .map((item) => ({ id: item.id, name: item.name, type: item.type, size: item.size, addedAt: item.addedAt }))
    .sort((a, b) => b.addedAt.localeCompare(a.addedAt));
}

export async function saveDocument(item: DocumentItem, file: File): Promise<void> {
  await requestValue<IDBValidKey>('readwrite', (store) => store.put({ ...item, blob: file } satisfies StoredDocument));
}

export async function readDocument(id: string): Promise<Blob | null> {
  const stored = await requestValue<StoredDocument | undefined>('readonly', (store) => store.get(id));
  return stored?.blob ?? null;
}

export async function removeDocument(id: string): Promise<void> {
  await requestValue<undefined>('readwrite', (store) => store.delete(id));
}
