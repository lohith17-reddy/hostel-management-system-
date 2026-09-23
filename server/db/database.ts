import initSqlJs, { Database } from 'sql.js';
import fs from 'fs';
import path from 'path';

let dbInstance: Database | null = null;
const DB_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'hostel.sqlite');

let saveTimeout: NodeJS.Timeout | null = null;

function scheduleSave() {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    saveToDisk();
  }, 100);
}

export function saveToDisk() {
  if (!dbInstance) return;
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    const data = dbInstance.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_FILE, buffer);
  } catch (err) {
    console.error('Failed to save SQLite database to disk:', err);
  }
}

export function flushSaveToDisk() {
  if (saveTimeout) {
    clearTimeout(saveTimeout);
    saveTimeout = null;
  }
  saveToDisk();
}

export async function getDb(): Promise<Database> {
  if (dbInstance) return dbInstance;

  const SQL = await initSqlJs();
  if (fs.existsSync(DB_FILE)) {
    const fileBuffer = fs.readFileSync(DB_FILE);
    dbInstance = new SQL.Database(fileBuffer);
  } else {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    dbInstance = new SQL.Database();
  }

  // Enable foreign keys
  dbInstance.exec('PRAGMA foreign_keys = ON;');
  return dbInstance;
}

export async function query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  const db = await getDb();
  const stmt = db.prepare(sql);
  try {
    if (params && params.length > 0) {
      stmt.bind(params);
    }
    const results: T[] = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject() as unknown as T);
    }
    return results;
  } finally {
    stmt.free();
  }
}

export async function queryOne<T = any>(sql: string, params: any[] = []): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

export async function run(sql: string, params: any[] = []): Promise<{ changes: number }> {
  const db = await getDb();
  const stmt = db.prepare(sql);
  try {
    if (params && params.length > 0) {
      stmt.bind(params);
    }
    stmt.step();
    const changes = db.getRowsModified();
    scheduleSave();
    return { changes };
  } finally {
    stmt.free();
  }
}

export async function exec(sql: string): Promise<void> {
  const db = await getDb();
  db.exec(sql);
  scheduleSave();
}
