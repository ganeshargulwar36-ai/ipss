const mysql = require('mysql2/promise');

let db = null;

async function initDB() {
  const passwords = [
    process.env.DB_PASSWORD ?? '',
    '',
    'root',
  ];

  for (const pw of passwords) {
    try {
      const conn = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: pw,
        multipleStatements: true,
      });

      await conn.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'ipss'}\`;`);
      await conn.query(`USE \`${process.env.DB_NAME || 'ipss'}\`;`);
      await conn.query(`
        CREATE TABLE IF NOT EXISTS app_history (
          id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
          ts              DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
          machines        TINYINT      NOT NULL,
          jobs            SMALLINT     NOT NULL,
          chaos           TINYINT(1)   NOT NULL DEFAULT 0,
          improvement_pct FLOAT        NOT NULL DEFAULT 0,
          best_algo       VARCHAR(32)  NOT NULL DEFAULT '',
          saved_minutes   FLOAT        NOT NULL DEFAULT 0,
          full_data       LONGTEXT     NOT NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);

      db = conn;
      console.log(`✅  MySQL connected (password: '${pw}') — database 'ipss' ready.`);
      return db;
    } catch (err) {
      if (err.code === 'ER_ACCESS_DENIED_ERROR') {
        continue;
      }
      console.error('❌  DB init error:', err.message);
      return null;
    }
  }
  console.error('❌  All password attempts failed. App will run WITHOUT database persistence.');
  return null;
}

function getDB() {
  return db;
}

module.exports = { initDB, getDB };
