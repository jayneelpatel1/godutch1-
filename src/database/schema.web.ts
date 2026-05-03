// Online-only mode: SQLite not used
// Offline sync will be implemented in later phase

export function initDatabase(): void {
  console.log('[schema.web] Online-only mode: SQLite disabled');
}

export function getDatabase(): never {
  throw new Error('SQLite not available in online-only mode');
}
