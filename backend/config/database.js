const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

// Create connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'certificate_verification',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Get promise-based connection
const promisePool = pool.promise();

// Test connection
promisePool.query('SELECT 1')
  .then(() => {
    console.log('Database connected successfully');
  })
  .catch((err) => {
    console.error('Database connection failed:', err.message);
  });

module.exports = promisePool;
