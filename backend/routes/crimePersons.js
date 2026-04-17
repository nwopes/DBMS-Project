const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT cp.*, p.name, p.gender, c.crime_type FROM Crime_Person cp
       JOIN Person p ON cp.person_id = p.person_id
       JOIN Crime c ON cp.crime_id = c.crime_id`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { crime_id, person_id, role } = req.body;
    await pool.query(
      'INSERT INTO Crime_Person (crime_id, person_id, role) VALUES (?,?,?) ON DUPLICATE KEY UPDATE role=?',
      [crime_id, person_id, role || null, role || null]
    );
    res.status(201).json({ message: 'Crime-Person association created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/', async (req, res) => {
  try {
    const { crime_id, person_id } = req.body;
    await pool.query('DELETE FROM Crime_Person WHERE crime_id=? AND person_id=?', [crime_id, person_id]);
    res.json({ message: 'Association removed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
