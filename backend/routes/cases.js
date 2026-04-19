const express = require('express');
const router = express.Router();
const pool = require('../db');
const { logAudit } = require('../utils/audit');

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT cf.*, c.crime_type, c.date AS crime_date, c.status AS crime_status,
              po.name AS lead_officer_name, l.city
       FROM Case_File cf
       JOIN Crime c ON cf.crime_id = c.crime_id
       LEFT JOIN Police_Officer po ON cf.lead_officer_id = po.officer_id
       LEFT JOIN Location l ON c.location_id = l.location_id
       ORDER BY cf.start_date DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [[caseFile]] = await pool.query(
      `SELECT cf.*, c.crime_type, c.crime_id, c.date AS crime_date, c.description AS crime_description,
              c.status AS crime_status, po.name AS lead_officer_name,
              l.city, l.address, l.state
       FROM Case_File cf
       JOIN Crime c ON cf.crime_id = c.crime_id
       LEFT JOIN Police_Officer po ON cf.lead_officer_id = po.officer_id
       LEFT JOIN Location l ON c.location_id = l.location_id
       WHERE cf.case_id=?`,
      [req.params.id]
    );
    if (!caseFile) return res.status(404).json({ error: 'Case not found' });

    const [evidence] = await pool.query(
      'SELECT * FROM Evidence WHERE case_id=? ORDER BY collected_date',
      [req.params.id]
    );
    const [officers] = await pool.query(
      `SELECT po.* FROM Case_Officer co
       JOIN Police_Officer po ON co.officer_id = po.officer_id
       WHERE co.case_id=?`,
      [req.params.id]
    );
    const [courtCases] = await pool.query(
      'SELECT * FROM Court_Case WHERE case_id=?',
      [req.params.id]
    );
    // FIRs linked to the same crime
    const [firs] = await pool.query(
      `SELECT f.*, p.name AS filed_by_name, p.phone_number AS filed_by_phone
       FROM FIR f
       LEFT JOIN Person p ON f.filed_by = p.person_id
       WHERE f.crime_id=?`,
      [caseFile.crime_id]
    );

    res.json({ ...caseFile, evidence, officers, courtCases, firs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { crime_id, lead_officer_id, case_status, start_date, end_date } = req.body;
    const [result] = await pool.query(
      'INSERT INTO Case_File (crime_id, lead_officer_id, case_status, start_date, end_date) VALUES (?,?,?,?,?)',
      [crime_id, lead_officer_id || null, case_status || 'Open', start_date || null, end_date || null]
    );
    await logAudit('Case_File', result.insertId, 'INSERT', null, req.body);
    res.status(201).json({ case_id: result.insertId, message: 'Case created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const [[old]] = await pool.query('SELECT * FROM Case_File WHERE case_id=?', [req.params.id]);
    const { crime_id, lead_officer_id, case_status, start_date, end_date } = req.body;
    await pool.query(
      'UPDATE Case_File SET crime_id=?, lead_officer_id=?, case_status=?, start_date=?, end_date=? WHERE case_id=?',
      [crime_id, lead_officer_id || null, case_status, start_date || null, end_date || null, req.params.id]
    );
    await logAudit('Case_File', parseInt(req.params.id), 'UPDATE', old, req.body);
    res.json({ message: 'Case updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const [[old]] = await pool.query('SELECT * FROM Case_File WHERE case_id=?', [req.params.id]);
    await pool.query('DELETE FROM Case_Officer WHERE case_id=?', [req.params.id]);
    await pool.query('DELETE FROM Evidence WHERE case_id=?', [req.params.id]);
    await pool.query('DELETE FROM Court_Case WHERE case_id=?', [req.params.id]);
    await pool.query('DELETE FROM Case_File WHERE case_id=?', [req.params.id]);
    await logAudit('Case_File', parseInt(req.params.id), 'DELETE', old, null);
    res.json({ message: 'Case deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
