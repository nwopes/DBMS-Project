const pool = require('../db');

async function logAudit(tableName, recordId, action, oldValues = null, newValues = null) {
  try {
    await pool.query(
      'INSERT INTO Audit_Log (table_name, record_id, action, changed_by, old_values, new_values) VALUES (?,?,?,?,?,?)',
      [
        tableName,
        recordId || null,
        action,
        'system',
        oldValues ? JSON.stringify(oldValues) : null,
        newValues ? JSON.stringify(newValues) : null,
      ]
    );
  } catch (err) {
    // Audit failures must never crash the main operation
    console.error('[Audit]', err.message);
  }
}

module.exports = { logAudit };
