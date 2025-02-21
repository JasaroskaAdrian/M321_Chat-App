const mysql = require("mysql2/promise")
require("dotenv").config()

const pool = mysql.createPool({
  database: process.env.DB_NAME || 'chatdb',
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'chatdb',
  password: process.env.DB_PASSWORD || 'supersecret123',
  waitForConnections: true,
  connectionLimit: 10
})