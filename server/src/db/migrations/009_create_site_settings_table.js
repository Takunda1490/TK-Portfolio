import { pool } from '../connection.js';

export const up = async () => {
  const conn = await pool.getConnection();
  try {
    await conn.query(`
      CREATE TABLE IF NOT EXISTS site_settings (
        \`key\` VARCHAR(100) PRIMARY KEY,
        \`value\` TEXT
      )
    `);
    console.log('Created site_settings table');
  } finally {
    conn.release();
  }
};

export const down = async () => {
  const conn = await pool.getConnection();
  try {
    await conn.query('DROP TABLE IF EXISTS site_settings');
    console.log('Dropped site_settings table');
  } finally {
    conn.release();
  }
};