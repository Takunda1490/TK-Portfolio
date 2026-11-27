import { pool } from '../connection.js';

export const up = async () => {
  const conn = await pool.getConnection();
  try {
    await conn.query(`
      CREATE TABLE IF NOT EXISTS profile (
        id INT PRIMARY KEY DEFAULT 1,
        name VARCHAR(255) NOT NULL,
        title VARCHAR(255) NOT NULL,
        bio TEXT,
        avatar_url VARCHAR(500),
        resume_url VARCHAR(500),
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('Created profile table');
  } finally {
    conn.release();
  }
};

export const down = async () => {
  const conn = await pool.getConnection();
  try {
    await conn.query('DROP TABLE IF EXISTS profile');
    console.log('Dropped profile table');
  } finally {
    conn.release();
  }
};