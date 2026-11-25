import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { pool } from './connection.js';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error('Set ADMIN_EMAIL and ADMIN_PASSWORD in .env');
  process.exit(1);
}

const seed = async () => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const hash = await bcrypt.hash(ADMIN_PASSWORD, 12);
    await conn.query(
      'INSERT INTO users (email, password_hash) VALUES (?, ?) ON DUPLICATE KEY UPDATE password_hash=VALUES(password_hash)',
      [ADMIN_EMAIL, hash]
    );

    await conn.query(
      `INSERT INTO profile (id, name, title, bio) VALUES (1, 'TK', 'Web Developer', 'Hi, I am TK, a web developer.')
       ON DUPLICATE KEY UPDATE name=VALUES(name)`
    );

    await conn.query('DELETE FROM services');
    await conn.query(
      `INSERT INTO services (title, description, icon, \`order\`) VALUES
       ('Web Development','Custom websites and web applications','code',1),
       ('UI/UX Design','User-centered interface and experience design','pencil',2),
       ('API Integration','Third-party API and service integration','cpu',3)`
    );

    await conn.query('DELETE FROM skills');
    await conn.query(
      `INSERT INTO skills (name, level, category, \`order\`) VALUES
       ('JavaScript', 90, 'Frontend', 1),
       ('React', 85, 'Frontend', 2),
       ('Node.js', 80, 'Backend', 1),
       ('MySQL', 75, 'Database', 1),
       ('CSS', 85, 'Frontend', 3)`

    );

    await conn.query('DELETE FROM social_links');
    await conn.query(
      `INSERT INTO social_links (platform, url, icon, \`order\`) VALUES
       ('Facebook','https://facebook.com','#',1),
       ('Twitter','https://twitter.com','#',2),
       ('GitHub','https://github.com','#',3)`
    );

    await conn.query(
      `INSERT INTO projects (title, slug, description, tech_stack, published, \`order\`)
       VALUES ('Sample Project','sample-project','A sample portfolio project.', JSON_ARRAY('React','Node'), TRUE, 1)
       ON DUPLICATE KEY UPDATE title=VALUES(title)`
    );

    await conn.query(
      `INSERT INTO site_settings (\`key\`, \`value\`) VALUES ('seo_title','TK Portfolio') ON DUPLICATE KEY UPDATE \`value\`=VALUES(\`value\`)`
    );

    await conn.commit();
    console.log('Seed complete.');
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
    await pool.end();
  }
};

seed().catch((e) => { console.error(e); process.exit(1); });
