const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const pool = require('./db');

app.use(cors());
app.use(express.json());

// Serve uploaded evidence files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/health/db', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({
      ok: false,
      code: err.code || 'DB_ERROR',
      error: err.message,
    });
  }
});

// Existing routes
app.use('/api/dashboard',    require('./routes/dashboard'));
app.use('/api/crimes',       require('./routes/crimes'));
app.use('/api/persons',      require('./routes/persons'));
app.use('/api/officers',     require('./routes/officers'));
app.use('/api/stations',     require('./routes/stations'));
app.use('/api/locations',    require('./routes/locations'));
app.use('/api/cases',        require('./routes/cases'));
app.use('/api/firs',         require('./routes/firs'));
app.use('/api/evidence',     require('./routes/evidence'));
app.use('/api/court-cases',  require('./routes/courtCases'));
app.use('/api/crime-persons', require('./routes/crimePersons'));
app.use('/api/case-officers', require('./routes/caseOfficers'));

// New routes
app.use('/api/audit-logs',   require('./routes/auditLog'));
app.use('/api/ai',           require('./routes/ai'));
app.use('/api/map',          require('./routes/map'));

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Crime Management Server running on port ${PORT}`);
  pool.query('SELECT 1')
    .then(() => console.log('MySQL connection OK'))
    .catch((err) => {
      console.error('MySQL connection failed:', err.code || err.message);
      console.error('Check backend/.env DB_HOST, DB_USER, DB_PASSWORD, and DB_NAME.');
    });
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use.`);
    console.error('Close the existing backend terminal, or stop the Node process using that port, then run npm start again.');
    console.error(`On Windows, find it with: netstat -ano | findstr :${PORT}`);
    console.error('Then stop it with: taskkill /PID <PID> /F');
    process.exit(1);
  }

  console.error('Server failed to start:', err.message);
  process.exit(1);
});
