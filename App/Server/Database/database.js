const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "minitwitter",
  password: process.env.DB_PASSWORD || "supersecret123",
  database: process.env.DB_NAME || "minitwitter",
  connectionLimit: 5,
});

// Function to execute queries
const query = async (sql, params = []) => {
  const [results] = await pool.execute(sql, params);
  return results;
};

module.exports = { query };