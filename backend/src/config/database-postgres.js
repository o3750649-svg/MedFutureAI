import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

// Get database connection string from environment
const DATABASE_URL = process.env.DATABASE_URL || process.env.DB_PATH;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL or DB_PATH environment variable is required');
}

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: DATABASE_URL,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 2000, // How long to wait before timing out when connecting a new client
});

// Test the connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ PostgreSQL connection error:', err);
    throw err;
  }
  console.log('✅ PostgreSQL database connected successfully');
  release();
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Closing PostgreSQL connection pool...');
  await pool.end();
  console.log('PostgreSQL connection pool closed');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Closing PostgreSQL connection pool...');
  await pool.end();
  console.log('PostgreSQL connection pool closed');
  process.exit(0);
});

/**
 * Execute a query with parameters
 * @param {string} text - SQL query text
 * @param {Array} params - Query parameters
 * @returns {Promise<Object>} - Query result
 */
export async function query(text, params) {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
}

/**
 * Execute a query and return rows only
 * @param {string} text - SQL query text
 * @param {Array} params - Query parameters
 * @returns {Promise<Array>} - Array of rows
 */
export async function queryRows(text, params) {
  const result = await query(text, params);
  return result.rows;
}

/**
 * Execute a query and return first row
 * @param {string} text - SQL query text
 * @param {Array} params - Query parameters
 * @returns {Promise<Object|null>} - First row or null
 */
export async function queryRow(text, params) {
  const rows = await queryRows(text, params);
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Execute a query and return first value
 * @param {string} text - SQL query text
 * @param {Array} params - Query parameters
 * @returns {Promise<any|null>} - First value or null
 */
export async function queryValue(text, params) {
  const row = await queryRow(text, params);
  return row ? Object.values(row)[0] : null;
}

/**
 * Execute a query and return affected rows count
 * @param {string} text - SQL query text
 * @param {Array} params - Query parameters
 * @returns {Promise<number>} - Number of affected rows
 */
export async function queryAffectedRows(text, params) {
  const result = await query(text, params);
  return result.rowCount || 0;
}

/**
 * Initialize database schema
 * @returns {Promise<void>}
 */
export async function initDatabase() {
  try {
    const schemaPath = path.join(__dirname, '../../schema-postgres.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');
    
    // Split schema by semicolon and execute each statement
    const statements = schema.split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    for (const stmt of statements) {
      try {
        await query(stmt);
      } catch (err) {
        // Ignore errors for INSERT statements with conflicts
        if (!err.message.includes('duplicate key value violates unique constraint')) {
          console.error('Schema execution error:', err.message);
        }
      }
    }
    
    console.log('✅ PostgreSQL database schema initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    throw error;
  }
}
