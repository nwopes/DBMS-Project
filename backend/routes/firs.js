const express = require('express');
const router = express.Router();
const pool = require('../db');
const { logAudit } = require('../utils/audit');

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT f.*, c.crime_type, c.date AS crime_date,
              p.name AS filed_by_name, p.phone_number AS filed_by_phone
       FROM FIR f
       JOIN Crime c ON f.crime_id = c.crime_id
       LEFT JOIN Person p ON f.filed_by = p.person_id
       ORDER BY f.filing_date DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [[fir]] = await pool.query(
      `SELECT f.*, c.crime_type, c.date AS crime_date, c.description AS crime_description,
              p.name AS filed_by_name, p.phone_number AS filed_by_phone
       FROM FIR f
       JOIN Crime c ON f.crime_id = c.crime_id
       LEFT JOIN Person p ON f.filed_by = p.person_id
       WHERE f.fir_id=?`,
      [req.params.id]
    );
    if (!fir) return res.status(404).json({ error: 'FIR not found' });
    res.json(fir);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { crime_id, filed_by, filing_date, description } = req.body;
    const [result] = await pool.query(
      'INSERT INTO FIR (crime_id, filed_by, filing_date, description) VALUES (?,?,?,?)',
      [crime_id, filed_by || null, filing_date, description || null]
    );
    await logAudit('FIR', result.insertId, 'INSERT', null, req.body);
    res.status(201).json({ fir_id: result.insertId, message: 'FIR created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const [[old]] = await pool.query('SELECT * FROM FIR WHERE fir_id=?', [req.params.id]);
    const { crime_id, filed_by, filing_date, description } = req.body;
    await pool.query(
      'UPDATE FIR SET crime_id=?, filed_by=?, filing_date=?, description=? WHERE fir_id=?',
      [crime_id, filed_by || null, filing_date, description || null, req.params.id]
    );
    await logAudit('FIR', parseInt(req.params.id), 'UPDATE', old, req.body);
    res.json({ message: 'FIR updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const [[old]] = await pool.query('SELECT * FROM FIR WHERE fir_id=?', [req.params.id]);
    await pool.query('DELETE FROM FIR WHERE fir_id=?', [req.params.id]);
    await logAudit('FIR', parseInt(req.params.id), 'DELETE', old, null);
    res.json({ message: 'FIR deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
