const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  port: process.env.DB_PORT,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function testConnection() {
  const maxAttempts = 3;
  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const conn = await pool.getConnection();
      console.log(`MySQL connected on attempt ${attempt}`);
      conn.release();
      return;
    } catch (err) {
      lastError = err;
      console.error(`MySQL connection attempt ${attempt}/${maxAttempts} failed: ${err.message}`);

      if (attempt < maxAttempts) {
        console.log('Retrying in 5 seconds...');
        await wait(5000);
      }
    }
  }

  console.error('MySQL connection failed after 3 attempts:', lastError?.message);
  process.exit(1);
}

module.exports = { pool, testConnection };
