// Database connection utility for Neon PostgreSQL
const { Pool } = require('@neondatabase/serverless');

let pool = null;

function getPool() {
    if (!process.env.DATABASE_URL) {
        const err = new Error('Missing DATABASE_URL. Set it in Netlify env vars (Site settings → Environment variables) or in a local .env file when running `netlify dev`.');
        err.code = 'MISSING_DATABASE_URL';
        throw err;
    }
    if (!pool) {
        pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: {
                rejectUnauthorized: false
            }
        });
    }
    return pool;
}

async function query(text, params) {
    const pool = getPool();
    try {
        const result = await pool.query(text, params);
        return result;
    } catch (error) {
        console.error('Database query error:', error);
        throw error;
    }
}

module.exports = { query, getPool };

