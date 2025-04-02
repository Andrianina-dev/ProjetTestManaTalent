const mysql = require('mysql2/promise');
require('dotenv').config();

let pool;

async function initDB() {
  pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
  });

  try {
    const connection = await pool.getConnection();
    console.log('✅ Connecté à la base de données MySQL!');
    connection.release();
  } catch (err) {
    console.error('❌ Erreur de connexion:', err.message);
    process.exit(1);
  }
}

function getPool() {
  if (!pool) {
    throw new Error('La base de données n’est pas encore initialisée');
  }
  return pool;
}

module.exports = { initDB, getPool };
