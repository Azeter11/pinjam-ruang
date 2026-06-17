const mysql = require('mysql2/promise');
require('dotenv').config();

async function run() {
  console.log('Running migration...');
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'pinjam_ruang2',
    port: parseInt(process.env.DB_PORT || '3306', 10),
  });

  try {
    // 1. Add proposal_url column if not exists
    const [columns] = await connection.execute(
      `SHOW COLUMNS FROM bookings LIKE 'proposal_url'`
    );

    if (columns.length === 0) {
      console.log("Adding 'proposal_url' column to 'bookings' table...");
      await connection.execute(
        `ALTER TABLE bookings ADD COLUMN proposal_url VARCHAR(255) NULL`
      );
      console.log("Column 'proposal_url' added successfully.");
    } else {
      console.log("Column 'proposal_url' already exists.");
    }

    // 2. Modify purpose to be NULL
    console.log("Modifying 'purpose' column to be NULL (optional)...");
    await connection.execute(
      `ALTER TABLE bookings MODIFY COLUMN purpose TEXT NULL`
    );
    console.log("Column 'purpose' modified successfully.");

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await connection.end();
  }
}

run();
