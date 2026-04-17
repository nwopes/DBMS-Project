const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT ps.*, l.city, l.state, l.address,
              COUNT(po.officer_id) AS officer_count
       FROM Police_Station ps
       LEFT JOIN Location l ON ps.location_id = l.location_id
       LEFT JOIN Police_Officer po ON ps.station_id = po.station_id
       GROUP BY ps.station_id
       ORDER BY ps.station_name`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [[station]] = await pool.query(
      `SELECT ps.*, l.city, l.state, l.address, l.pincode FROM Police_Station ps
       LEFT JOIN Location l ON ps.location_id = l.location_id
       WHERE ps.station_id=?`, [req.params.id]
    );
    if (!station) return res.status(404).json({ error: 'Station not found' });
    const [officers] = await pool.query(
      'SELECT * FROM Police_Officer WHERE station_id=?', [req.params.id]
    );
    res.json({ ...station, officers });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { station_name, location_id, jurisdiction_area } = req.body;
    const [result] = await pool.query(
      'INSERT INTO Police_Station (station_name, location_id, jurisdiction_area) VALUES (?,?,?)',
      [station_name, location_id || null, jurisdiction_area || null]
    );
    res.status(201).json({ station_id: result.insertId, message: 'Station created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { station_name, location_id, jurisdiction_area } = req.body;
    await pool.query(
      'UPDATE Police_Station SET station_name=?, location_id=?, jurisdiction_area=? WHERE station_id=?',
      [station_name, location_id || null, jurisdiction_area || null, req.params.id]
    );
    res.json({ message: 'Station updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('UPDATE Police_Officer SET station_id=NULL WHERE station_id=?', [req.params.id]);
    await pool.query('DELETE FROM Police_Station WHERE station_id=?', [req.params.id]);
    res.json({ message: 'Station deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
