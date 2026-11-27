import { pool } from '../connection.js';

export const up = async () => {
  const conn = await pool.getConnection();
  try {
    await conn.query(`
      CREATE TABLE IF NOT EXISTS skills (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        level INT NOT NULL DEFAULT 0,
        category VARCHAR(100) NOT NULL,
        \`order\` INT NOT NULL DEFAULT 0
      )
    `);
    console.log('Created skills table');
  } finally {
    conn.release();
  }
};

export const down = async () => {
  const conn = await pool.getConnection();
  try {
    await conn.query('DROP TABLE IF EXISTS skills');
    console.log('Dropped skills table');
  } finally {
    conn.release();
  }
};