const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/dashboard/stats
router.get('/stats', async (req, res) => {
  try {
    const [[crimeRow]] = await pool.query('SELECT COUNT(*) AS total FROM Crime');
    const [[openCases]] = await pool.query("SELECT COUNT(*) AS total FROM Case_File WHERE case_status = 'Open'");
    const [[officers]] = await pool.query('SELECT COUNT(*) AS total FROM Police_Officer');
    const [[stations]] = await pool.query('SELECT COUNT(*) AS total FROM Police_Station');
    const [[persons]] = await pool.query('SELECT COUNT(*) AS total FROM Person');
    const [[firs]] = await pool.query('SELECT COUNT(*) AS total FROM FIR');
    const [[evidence]] = await pool.query('SELECT COUNT(*) AS total FROM Evidence');
    const [[courtCases]] = await pool.query('SELECT COUNT(*) AS total FROM Court_Case');
    const [[closedCases]] = await pool.query("SELECT COUNT(*) AS total FROM Case_File WHERE case_status = 'Closed'");
    const [[underInv]] = await pool.query("SELECT COUNT(*) AS total FROM Case_File WHERE case_status = 'Under Investigation'");

    res.json({
      totalCrimes: crimeRow.total,
      openCases: openCases.total,
      closedCases: closedCases.total,
      underInvestigation: underInv.total,
      officers: officers.total,
      stations: stations.total,
      persons: persons.total,
      firs: firs.total,
      evidence: evidence.total,
      courtCases: courtCases.total
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/dashboard/crimes-by-type
router.get('/crimes-by-type', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT crime_type, COUNT(*) AS count FROM Crime GROUP BY crime_type ORDER BY count DESC'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/dashboard/crimes-by-city
router.get('/crimes-by-city', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT l.city, COUNT(c.crime_id) AS total_crimes
       FROM Crime c JOIN Location l ON c.location_id = l.location_id
       GROUP BY l.city ORDER BY total_crimes DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/dashboard/crimes-by-status
router.get('/crimes-by-status', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT status, COUNT(*) AS count FROM Crime GROUP BY status'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/dashboard/crimes-by-month
router.get('/crimes-by-month', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT DATE_FORMAT(date, '%b %Y') AS month, DATE_FORMAT(date, '%Y-%m') AS sort_key,
              COUNT(*) AS count
       FROM Crime
       GROUP BY month, sort_key
       ORDER BY sort_key ASC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/dashboard/recent-crimes
router.get('/recent-crimes', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT c.crime_id, c.crime_type, c.date, c.status,
              l.city, l.state
       FROM Crime c
       LEFT JOIN Location l ON c.location_id = l.location_id
       ORDER BY c.date DESC LIMIT 10`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
