import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL_NON_POOLING,
});

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('Running migration: Adding trips_completed column to guides table...');
    const result = await client.query(`
      ALTER TABLE guides ADD COLUMN IF NOT EXISTS trips_completed INTEGER DEFAULT 0;
    `);
    console.log('✅ Migration successful');
    console.log('trips_completed column added to guides table');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
