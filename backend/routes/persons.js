const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Person ORDER BY name');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [[person]] = await pool.query('SELECT * FROM Person WHERE person_id=?', [req.params.id]);
    if (!person) return res.status(404).json({ error: 'Person not found' });
    const [crimes] = await pool.query(
      `SELECT c.*, cp.role FROM Crime_Person cp
       JOIN Crime c ON cp.crime_id = c.crime_id
       WHERE cp.person_id = ?`, [req.params.id]
    );
    res.json({ ...person, crimes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, age, gender, phone_number, address } = req.body;
    const [result] = await pool.query(
      'INSERT INTO Person (name, age, gender, phone_number, address) VALUES (?,?,?,?,?)',
      [name, age || null, gender || null, phone_number || null, address || null]
    );
    res.status(201).json({ person_id: result.insertId, message: 'Person created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, age, gender, phone_number, address } = req.body;
    await pool.query(
      'UPDATE Person SET name=?, age=?, gender=?, phone_number=?, address=? WHERE person_id=?',
      [name, age || null, gender || null, phone_number || null, address || null, req.params.id]
    );
    res.json({ message: 'Person updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM Crime_Person WHERE person_id=?', [req.params.id]);
    await pool.query('DELETE FROM FIR WHERE filed_by=?', [req.params.id]);
    await pool.query('DELETE FROM Person WHERE person_id=?', [req.params.id]);
    res.json({ message: 'Person deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
