import { pool } from '../connection.js';

export const up = async () => {
  const conn = await pool.getConnection();
  try {
    await conn.query(`
      CREATE TABLE IF NOT EXISTS social_links (
        id INT AUTO_INCREMENT PRIMARY KEY,
        platform VARCHAR(50) NOT NULL,
        url VARCHAR(500) NOT NULL,
        icon VARCHAR(100) NOT NULL,
        \`order\` INT NOT NULL DEFAULT 0
      )
    `);
    console.log('Created social_links table');
  } finally {
    conn.release();
  }
};

export const down = async () => {
  const conn = await pool.getConnection();
  try {
    await conn.query('DROP TABLE IF EXISTS social_links');
    console.log('Dropped social_links table');
  } finally {
    conn.release();
  }
};