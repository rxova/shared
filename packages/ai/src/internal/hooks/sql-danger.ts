// Programs that run SQL, and the statements that destroy data.
export const SQL_CLIENTS = new Set([
  'psql',
  'mysql',
  'mariadb',
  'sqlite3',
  'supabase',
  'prisma',
  'turso',
  'wrangler',
  'pgcli',
]);

export const DROP_SQL = /\b(drop\s+(database|schema|table)|truncate(\s+table)?\s+\w)/i;
