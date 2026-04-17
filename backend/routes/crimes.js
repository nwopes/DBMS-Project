const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET all crimes with location
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT c.*, l.address, l.city, l.state, l.pincode
       FROM Crime c LEFT JOIN Location l ON c.location_id = l.location_id
       ORDER BY c.date DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single crime with full details
router.get('/:id', async (req, res) => {
  try {
    const [[crime]] = await pool.query(
      `SELECT c.*, l.address, l.city, l.state, l.pincode
       FROM Crime c LEFT JOIN Location l ON c.location_id = l.location_id
       WHERE c.crime_id = ?`, [req.params.id]
    );
    if (!crime) return res.status(404).json({ error: 'Crime not found' });

    const [persons] = await pool.query(
      `SELECT p.*, cp.role FROM Crime_Person cp
       JOIN Person p ON cp.person_id = p.person_id
       WHERE cp.crime_id = ?`, [req.params.id]
    );

    const [caseFile] = await pool.query(
      `SELECT cf.*, po.name AS lead_officer_name FROM Case_File cf
       LEFT JOIN Police_Officer po ON cf.lead_officer_id = po.officer_id
       WHERE cf.crime_id = ?`, [req.params.id]
    );

    res.json({ ...crime, persons, cases: caseFile });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create crime
router.post('/', async (req, res) => {
  try {
    const { crime_type, date, time, location_id, description, status } = req.body;
    const [result] = await pool.query(
      'INSERT INTO Crime (crime_type, date, time, location_id, description, status) VALUES (?,?,?,?,?,?)',
      [crime_type, date, time || null, location_id || null, description || null, status || 'Open']
    );
    res.status(201).json({ crime_id: result.insertId, message: 'Crime created successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update crime
router.put('/:id', async (req, res) => {
  try {
    const { crime_type, date, time, location_id, description, status } = req.body;
    await pool.query(
      'UPDATE Crime SET crime_type=?, date=?, time=?, location_id=?, description=?, status=? WHERE crime_id=?',
      [crime_type, date, time || null, location_id || null, description || null, status, req.params.id]
    );
    res.json({ message: 'Crime updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE crime
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM Crime_Person WHERE crime_id=?', [req.params.id]);
    await pool.query('DELETE FROM FIR WHERE crime_id=?', [req.params.id]);
    const [cases] = await pool.query('SELECT case_id FROM Case_File WHERE crime_id=?', [req.params.id]);
    for (const c of cases) {
      await pool.query('DELETE FROM Case_Officer WHERE case_id=?', [c.case_id]);
      await pool.query('DELETE FROM Evidence WHERE case_id=?', [c.case_id]);
      await pool.query('DELETE FROM Court_Case WHERE case_id=?', [c.case_id]);
    }
    await pool.query('DELETE FROM Case_File WHERE crime_id=?', [req.params.id]);
    await pool.query('DELETE FROM Crime WHERE crime_id=?', [req.params.id]);
    res.json({ message: 'Crime deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
