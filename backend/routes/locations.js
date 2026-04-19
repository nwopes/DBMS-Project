const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Location ORDER BY city');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [[row]] = await pool.query('SELECT * FROM Location WHERE location_id=?', [req.params.id]);
    if (!row) return res.status(404).json({ error: 'Location not found' });
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { address, city, state, pincode, latitude, longitude } = req.body;
    const [result] = await pool.query(
      'INSERT INTO Location (address, city, state, pincode, latitude, longitude) VALUES (?,?,?,?,?,?)',
      [address || null, city || null, state || null, pincode || null,
       latitude ? parseFloat(latitude) : null, longitude ? parseFloat(longitude) : null]
    );
    res.status(201).json({ location_id: result.insertId, message: 'Location created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { address, city, state, pincode, latitude, longitude } = req.body;
    await pool.query(
      'UPDATE Location SET address=?, city=?, state=?, pincode=?, latitude=?, longitude=? WHERE location_id=?',
      [address || null, city || null, state || null, pincode || null,
       latitude ? parseFloat(latitude) : null, longitude ? parseFloat(longitude) : null,
       req.params.id]
    );
    res.json({ message: 'Location updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM Location WHERE location_id=?', [req.params.id]);
    res.json({ message: 'Location deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
