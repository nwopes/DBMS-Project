const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT e.*, c.crime_type, cf.case_status
       FROM Evidence e
       JOIN Case_File cf ON e.case_id = cf.case_id
       JOIN Crime c ON cf.crime_id = c.crime_id
       ORDER BY e.collected_date DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [[row]] = await pool.query(
      `SELECT e.*, c.crime_type FROM Evidence e
       JOIN Case_File cf ON e.case_id = cf.case_id
       JOIN Crime c ON cf.crime_id = c.crime_id
       WHERE e.evidence_id=?`, [req.params.id]
    );
    if (!row) return res.status(404).json({ error: 'Evidence not found' });
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { case_id, evidence_type, description, collected_date } = req.body;
    const [result] = await pool.query(
      'INSERT INTO Evidence (case_id, evidence_type, description, collected_date) VALUES (?,?,?,?)',
      [case_id, evidence_type || null, description || null, collected_date || null]
    );
    res.status(201).json({ evidence_id: result.insertId, message: 'Evidence added' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { case_id, evidence_type, description, collected_date } = req.body;
    await pool.query(
      'UPDATE Evidence SET case_id=?, evidence_type=?, description=?, collected_date=? WHERE evidence_id=?',
      [case_id, evidence_type || null, description || null, collected_date || null, req.params.id]
    );
    res.json({ message: 'Evidence updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM Evidence WHERE evidence_id=?', [req.params.id]);
    res.json({ message: 'Evidence deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
