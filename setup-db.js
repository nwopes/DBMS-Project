const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { spawnSync } = require('child_process');

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
    const runSqlFile = (fileName) => {
      const sqlPath = path.join(__dirname, fileName);
      const sql = fs.readFileSync(sqlPath, 'utf8');
      const result = spawnSync('mysql', ['-u', 'root'], {
        input: sql,
        encoding: 'utf8',
        env: { ...process.env, MYSQL_PWD: password },
      });

      if (result.error) throw result.error;
      if (result.status !== 0) {
        throw new Error((result.stderr || result.stdout || `mysql exited with code ${result.status}`).trim());
      }
    };

    console.log('Connected successfully!\n');
    console.log('Creating database, tables, routines, and seed data...');

    const setupFiles = [
      'schema.sql',
      'migration.sql',
      'data_expanded.sql',
    ];

    for (const file of setupFiles) {
      console.log(`Running ${file}...`);
      runSqlFile(file);
    }

    // Create or update backend/.env file
    const envPath = path.join(__dirname, 'backend', '.env');
    const defaultEnv = [
      'DB_HOST=localhost',
      'DB_USER=root',
      'DB_PASSWORD=',
      'DB_NAME=crime_db',
      'PORT=5000',
      '',
      '# Paste your OpenAI API key below',
      'OPENAI_API_KEY=sk-paste-your-key-here',
      '',
    ].join('\n');

    let env = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : defaultEnv;
    env = env.replace(/DB_PASSWORD=.*/, `DB_PASSWORD=${password}`);
    fs.writeFileSync(envPath, env);

    console.log('\n✓ Database created: crime_db');
    console.log('✓ Schema, routines, trigger, and base seed data loaded');
    console.log('✓ Migration applied (Audit_Log, Evidence_File, GPS columns)');
    console.log('✓ Expanded dummy dataset loaded from data_expanded.sql');
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
    console.log('  4. The MySQL client is available on PATH as mysql');
    process.exit(1);
  }
}

setup();
