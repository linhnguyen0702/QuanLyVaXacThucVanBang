const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

// Create connection pool using mysql2
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '123456',
  database: process.env.DB_NAME || 'certificate_verification',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: '+07:00'
});

// Get promise-based connection pool
const promisePool = pool.promise();

// Test database connection asynchronously
(async () => {
  try {
    const [rows] = await promisePool.query('SELECT 1 + 1 AS result');
    console.log('✅ Connected to MySQL Database successfully:', process.env.DB_NAME);
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
  }
})();

module.exports = promisePool;
