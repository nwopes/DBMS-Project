const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/map/crimes — crime points with lat/lng for heatmap
router.get('/crimes', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        c.crime_id, c.crime_type, c.date, c.status,
        l.latitude, l.longitude, l.city, l.address, l.state
      FROM Crime c
      JOIN Location l ON c.location_id = l.location_id
      WHERE l.latitude IS NOT NULL AND l.longitude IS NOT NULL
      ORDER BY c.date DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/map/stats — crime counts per city for summary panel
router.get('/stats', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        l.city, l.latitude, l.longitude,
        COUNT(*) AS total_crimes,
        SUM(c.status = 'Open') AS open_crimes,
        SUM(c.status = 'Closed') AS closed_crimes,
        SUM(c.status = 'Under Investigation') AS investigating
      FROM Crime c
      JOIN Location l ON c.location_id = l.location_id
      WHERE l.latitude IS NOT NULL AND l.longitude IS NOT NULL
      GROUP BY l.city, l.latitude, l.longitude
      ORDER BY total_crimes DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
