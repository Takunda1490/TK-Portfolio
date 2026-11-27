import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from './connection.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const migrationsDir = path.join(__dirname, 'migrations');

async function getAppliedMigrations(conn) {
  const [rows] = await conn.query('SELECT name FROM migrations ORDER BY id');
  return rows.map(r => r.name);
}

async function runMigrations() {
  const conn = await pool.getConnection();
  try {
    // Ensure migrations table exists
    await conn.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const applied = await getAppliedMigrations(conn);
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.js'))
      .sort();

    for (const file of files) {
      if (applied.includes(file)) {
        console.log(`SKIP: ${file} (already applied)`);
        continue;
      }

      const migration = await import(path.join(migrationsDir, file));
      if (typeof migration.up !== 'function') {
        console.error(`ERROR: ${file} does not export an 'up' function`);
        process.exit(1);
      }

      await conn.beginTransaction();
      try {
        await migration.up();
        await conn.query('INSERT INTO migrations (name) VALUES (?)', [file]);
        await conn.commit();
        console.log(`OK: ${file}`);
      } catch (e) {
        await conn.rollback();
        throw e;
      }
    }

    console.log('All migrations applied.');
  } finally {
    conn.release();
    await pool.end();
  }
}

async function rollbackLast() {
  const conn = await pool.getConnection();
  try {
    const applied = await getAppliedMigrations(conn);
    if (applied.length === 0) {
      console.log('No migrations to rollback');
      return;
    }

    const last = applied[applied.length - 1];
    const migration = await import(path.join(migrationsDir, last));

    if (typeof migration.down !== 'function') {
      console.error(`ERROR: ${last} does not export a 'down' function`);
      process.exit(1);
    }

    await conn.beginTransaction();
    try {
      await migration.down();
      await conn.query('DELETE FROM migrations WHERE name = ?', [last]);
      await conn.commit();
      console.log(`Rolled back: ${last}`);
    } catch (e) {
      await conn.rollback();
      throw e;
    }
  } finally {
    conn.release();
    await pool.end();
  }
}

async function status() {
  const conn = await pool.getConnection();
  try {
    await conn.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const applied = await getAppliedMigrations(conn);
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.js'))
      .sort();

    console.log('\nMigration Status:');
    console.log('-------------------');
    for (const file of files) {
      const isApplied = applied.includes(file);
      console.log(`${isApplied ? '[x]' : '[ ]'} ${file}`);
    }
    console.log('-------------------');
    console.log(`Applied: ${applied.length}/${files.length}\n`);
  } finally {
    conn.release();
    await pool.end();
  }
}

const command = process.argv[2];

switch (command) {
  case 'up':
  case 'migrate':
    runMigrations().catch(e => { console.error(e); process.exit(1); });
    break;
  case 'down':
  case 'rollback':
    rollbackLast().catch(e => { console.error(e); process.exit(1); });
    break;
  case 'status':
    status().catch(e => { console.error(e); process.exit(1); });
    break;
  default:
    console.log('Usage: node migrate.js [up|down|status]');
    console.log('  up (or migrate)   - Run pending migrations');
    console.log('  down (or rollback) - Rollback last migration');
    console.log('  status            - Show migration status');
    process.exit(1);
}