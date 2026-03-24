const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

pool.on("error", (err) => {
  console.error("Unexpected PostgreSQL pool error:", err);
});

async function initializeDatabase() {
  await pool.query("SELECT 1");

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id BIGSERIAL PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password TEXT NOT NULL,
      wallet_balance NUMERIC(14,2) NOT NULL DEFAULT 0,
      credit_score INTEGER NOT NULL DEFAULT 650,
      status VARCHAR(20) NOT NULL DEFAULT 'active',
      role VARCHAR(20) NOT NULL DEFAULT 'user',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id BIGSERIAL PRIMARY KEY,
      user_id BIGINT REFERENCES users(id),
      type VARCHAR(20),
      amount NUMERIC(14,2),
      status VARCHAR(20),
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS deposit_requests (
      id BIGSERIAL PRIMARY KEY,
      user_id BIGINT REFERENCES users(id),
      amount NUMERIC(14,2),
      status VARCHAR(20) DEFAULT 'pending',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS withdraw_requests (
      id BIGSERIAL PRIMARY KEY,
      user_id BIGINT REFERENCES users(id),
      amount NUMERIC(14,2),
      status VARCHAR(20) DEFAULT 'pending',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  console.log("✅ PostgreSQL connected");
}

module.exports = { pool, initializeDatabase };
