const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT cc.*, cf.case_status, c.crime_type
       FROM Court_Case cc
       JOIN Case_File cf ON cc.case_id = cf.case_id
       JOIN Crime c ON cf.crime_id = c.crime_id
       ORDER BY cc.hearing_date DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [[row]] = await pool.query(
      `SELECT cc.*, cf.case_status, c.crime_type, c.date AS crime_date
       FROM Court_Case cc
       JOIN Case_File cf ON cc.case_id = cf.case_id
       JOIN Crime c ON cf.crime_id = c.crime_id
       WHERE cc.court_case_id=?`, [req.params.id]
    );
    if (!row) return res.status(404).json({ error: 'Court case not found' });
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { case_id, court_name, verdict, hearing_date } = req.body;
    const [result] = await pool.query(
      'INSERT INTO Court_Case (case_id, court_name, verdict, hearing_date) VALUES (?,?,?,?)',
      [case_id, court_name || null, verdict || null, hearing_date || null]
    );
    res.status(201).json({ court_case_id: result.insertId, message: 'Court case created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { case_id, court_name, verdict, hearing_date } = req.body;
    await pool.query(
      'UPDATE Court_Case SET case_id=?, court_name=?, verdict=?, hearing_date=? WHERE court_case_id=?',
      [case_id, court_name || null, verdict || null, hearing_date || null, req.params.id]
    );
    res.json({ message: 'Court case updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM Court_Case WHERE court_case_id=?', [req.params.id]);
    res.json({ message: 'Court case deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
