const express = require('express');
const router = express.Router();
const pool = require('../db');

const TABLES = ['Crime', 'Case_File', 'Evidence', 'FIR', 'Court_Case'];

// GET /api/audit-logs  — with optional filters: table_name, action, from, to, page, limit
router.get('/', async (req, res) => {
  try {
    const { table_name, action, from, to, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let where = '1=1';
    const params = [];

    if (table_name) { where += ' AND table_name = ?'; params.push(table_name); }
    if (action)     { where += ' AND action = ?';     params.push(action); }
    if (from)       { where += ' AND changed_at >= ?'; params.push(from); }
    if (to)         { where += ' AND changed_at <= ?'; params.push(to + ' 23:59:59'); }

    const [logs] = await pool.query(
      `SELECT * FROM Audit_Log WHERE ${where} ORDER BY changed_at DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM Audit_Log WHERE ${where}`,
      params
    );

    res.json({ logs, total, page: parseInt(page), limit: parseInt(limit), tables: TABLES });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
