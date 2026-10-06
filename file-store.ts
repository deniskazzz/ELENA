// Dauerhafte Ablage hochgeladener Dateien (PDFs, Bilder) im Browser (IndexedDB).
// Fällt still auf die laufende Sitzung zurück, wenn der Browser-Speicher
// nicht verfügbar ist (z. B. in der Vorschau).

const DB = "elena-coaching-files";
const STORE = "files";
const memory = new Map<string, Blob>();

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    try {
      const req = indexedDB.open(DB, 1);
      req.onupgradeneeded = () => req.result.createObjectStore(STORE);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    } catch (e) {
      reject(e);
    }
  });
}

async function tx<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await open();
  return new Promise<T>((resolve, reject) => {
    const t = db.transaction(STORE, mode);
    const r = fn(t.objectStore(STORE));
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });
}

export async function saveFile(blob: Blob): Promise<string> {
  const id = `f-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  memory.set(id, blob);
  try {
    await tx("readwrite", (s) => s.put(blob, id));
  } catch {
    /* nur Sitzung */
  }
  return id;
}

export async function loadFile(id: string): Promise<Blob | null> {
  const m = memory.get(id);
  if (m) return m;
  try {
    const b = await tx<Blob | undefined>("readonly", (s) => s.get(id) as IDBRequest<Blob | undefined>);
    if (b) memory.set(id, b);
    return b ?? null;
  } catch {
    return null;
  }
}

export async function deleteFile(id: string): Promise<void> {
  memory.delete(id);
  try {
    await tx("readwrite", (s) => s.delete(id));
  } catch {
    /* ignore */
  }
}
