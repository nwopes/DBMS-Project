const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (q) => new Promise(resolve => rl.question(q, resolve));

async function setup() {
  console.log('\n========================================');
  console.log('  Crime Management System - DB Setup');
  console.log('========================================\n');

  const password = await question('Enter your MySQL root password: ');
  rl.close();

  console.log('\nConnecting to MySQL...');

  try {
    const conn = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: password,
      multipleStatements: true
    });

    console.log('Connected successfully!\n');
    console.log('Creating database and tables...');

    const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await conn.query(sql);
    await conn.end();

    // Update .env file
    const envPath = path.join(__dirname, 'backend', '.env');
    let env = fs.readFileSync(envPath, 'utf8');
    env = env.replace(/DB_PASSWORD=.*/, `DB_PASSWORD=${password}`);
    fs.writeFileSync(envPath, env);

    console.log('\n✓ Database created: crime_db');
    console.log('✓ All 11 tables created');
    console.log('✓ Sample data loaded (15 crimes, 10 officers, 15 cases...)');
    console.log('✓ Backend .env updated with your password');
    console.log('\n========================================');
    console.log('  Setup complete! Now run: START.bat');
    console.log('  Then open: http://localhost:3000');
    console.log('========================================\n');
  } catch (err) {
    console.error('\n✗ Error:', err.message);
    console.log('\nPlease check:');
    console.log('  1. MySQL is running');
    console.log('  2. Password is correct');
    console.log('  3. Your user has CREATE DATABASE permission');
    process.exit(1);
  }
}

setup();
