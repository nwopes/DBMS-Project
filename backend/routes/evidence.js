const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const pool = require('../db');
const { logAudit } = require('../utils/audit');

// ── Multer config ──────────────────────────────────────────────
const UPLOAD_DIR = path.join(__dirname, '../uploads/evidence');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    cb(null, unique + path.extname(file.originalname).toLowerCase());
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
  fileFilter: (_req, file, cb) => {
    const allowed = /\.(jpg|jpeg|png|gif|webp|pdf|doc|docx|txt|xlsx|xls|mp3|mp4|wav|csv)$/i;
    if (allowed.test(path.extname(file.originalname))) cb(null, true);
    else cb(new Error('File type not allowed'));
  },
});

// ── Evidence CRUD ──────────────────────────────────────────────
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
       WHERE e.evidence_id=?`,
      [req.params.id]
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
    await logAudit('Evidence', result.insertId, 'INSERT', null, req.body);
    res.status(201).json({ evidence_id: result.insertId, message: 'Evidence added' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const [[old]] = await pool.query('SELECT * FROM Evidence WHERE evidence_id=?', [req.params.id]);
    const { case_id, evidence_type, description, collected_date } = req.body;
    await pool.query(
      'UPDATE Evidence SET case_id=?, evidence_type=?, description=?, collected_date=? WHERE evidence_id=?',
      [case_id, evidence_type || null, description || null, collected_date || null, req.params.id]
    );
    await logAudit('Evidence', parseInt(req.params.id), 'UPDATE', old, req.body);
    res.json({ message: 'Evidence updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const [[old]] = await pool.query('SELECT * FROM Evidence WHERE evidence_id=?', [req.params.id]);
    await pool.query('DELETE FROM Evidence WHERE evidence_id=?', [req.params.id]);
    await logAudit('Evidence', parseInt(req.params.id), 'DELETE', old, null);
    res.json({ message: 'Evidence deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── File upload endpoints ──────────────────────────────────────

// GET /api/evidence/:id/files
router.get('/:id/files', async (req, res) => {
  try {
    const [files] = await pool.query(
      'SELECT * FROM Evidence_File WHERE evidence_id=? ORDER BY uploaded_at DESC',
      [req.params.id]
    );
    res.json(files);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/evidence/:id/files  (multipart/form-data, field name: "files")
router.post('/:id/files', upload.array('files', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0)
      return res.status(400).json({ error: 'No files uploaded' });

    const inserted = [];
    for (const file of req.files) {
      const [result] = await pool.query(
        'INSERT INTO Evidence_File (evidence_id, filename, original_name, mimetype, file_size) VALUES (?,?,?,?,?)',
        [req.params.id, file.filename, file.originalname, file.mimetype, file.size]
      );
      inserted.push({ file_id: result.insertId, filename: file.filename, original_name: file.originalname });
    }
    res.status(201).json({ uploaded: inserted.length, files: inserted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/evidence/files/:fileId  — removes DB record only (file stays on disk)
router.delete('/files/:fileId', async (req, res) => {
  try {
    await pool.query('DELETE FROM Evidence_File WHERE file_id=?', [req.params.fileId]);
    res.json({ message: 'File record removed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Multer error handler
router.use((err, _req, res, _next) => {
  if (err.code === 'LIMIT_FILE_SIZE') return res.status(413).json({ error: 'File too large (max 20 MB)' });
  res.status(400).json({ error: err.message });
});

module.exports = router;
