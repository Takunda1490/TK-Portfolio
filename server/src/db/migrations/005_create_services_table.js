import { pool } from '../connection.js';

export const up = async () => {
  const conn = await pool.getConnection();
  try {
    await conn.query(`
      CREATE TABLE IF NOT EXISTS services (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        icon VARCHAR(100),
        \`order\` INT NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Created services table');
  } finally {
    conn.release();
  }
};

export const down = async () => {
  const conn = await pool.getConnection();
  try {
    await conn.query('DROP TABLE IF EXISTS services');
    console.log('Dropped services table');
  } finally {
    conn.release();
  }
};