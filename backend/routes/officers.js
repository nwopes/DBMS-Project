const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT po.*, ps.station_name FROM Police_Officer po
       LEFT JOIN Police_Station ps ON po.station_id = ps.station_id
       ORDER BY po.name`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [[officer]] = await pool.query(
      `SELECT po.*, ps.station_name FROM Police_Officer po
       LEFT JOIN Police_Station ps ON po.station_id = ps.station_id
       WHERE po.officer_id=?`, [req.params.id]
    );
    if (!officer) return res.status(404).json({ error: 'Officer not found' });
    const [cases] = await pool.query(
      `SELECT cf.* FROM Case_Officer co
       JOIN Case_File cf ON co.case_id = cf.case_id
       WHERE co.officer_id=?`, [req.params.id]
    );
    res.json({ ...officer, cases });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, designation, badge_number, phone_number, station_id } = req.body;
    const [result] = await pool.query(
      'INSERT INTO Police_Officer (name, designation, badge_number, phone_number, station_id) VALUES (?,?,?,?,?)',
      [name, designation || null, badge_number, phone_number || null, station_id || null]
    );
    res.status(201).json({ officer_id: result.insertId, message: 'Officer created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, designation, badge_number, phone_number, station_id } = req.body;
    await pool.query(
      'UPDATE Police_Officer SET name=?, designation=?, badge_number=?, phone_number=?, station_id=? WHERE officer_id=?',
      [name, designation || null, badge_number, phone_number || null, station_id || null, req.params.id]
    );
    res.json({ message: 'Officer updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM Case_Officer WHERE officer_id=?', [req.params.id]);
    await pool.query('UPDATE Case_File SET lead_officer_id=NULL WHERE lead_officer_id=?', [req.params.id]);
    await pool.query('DELETE FROM Police_Officer WHERE officer_id=?', [req.params.id]);
    res.json({ message: 'Officer deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
