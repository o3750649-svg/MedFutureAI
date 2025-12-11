import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DB_PATH = process.env.DB_PATH || join(__dirname, '../../database.sqlite');

let db;

export function initDatabase() {
  try {
    // Create database file if it doesn't exist
    db = new Database(DB_PATH, { verbose: console.log });
    
    // Enable WAL mode for better concurrent access
    db.pragma('journal_mode = WAL');
    
    // Read and execute schema
    const schemaPath = join(__dirname, '../../schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');
    
    // Execute schema (split by semicolon and filter empty statements)
    schema.split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0)
      .forEach(stmt => {
        try {
          db.exec(stmt);
        } catch (err) {
          // Ignore errors for INSERT OR IGNORE statements
          if (!err.message.includes('UNIQUE constraint')) {
            console.error('Schema execution error:', err.message);
          }
        }
      });
    
    console.log('✅ Database initialized successfully at:', DB_PATH);
    return db;
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    throw error;
  }
}

export function getDatabase() {
  if (!db) {
    return initDatabase();
  }
  return db;
}

export function closeDatabase() {
  if (db) {
    db.close();
    console.log('Database connection closed');
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  closeDatabase();
  process.exit(0);
});

process.on('SIGTERM', () => {
  closeDatabase();
  process.exit(0);
});
