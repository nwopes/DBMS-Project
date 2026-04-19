-- ============================================================
-- MIGRATION: Add new feature tables and columns
-- Run this against your existing crime_db
-- ============================================================

USE crime_db;

-- 1. Add latitude/longitude to Location table.
-- MySQL versions differ on ALTER TABLE ... ADD COLUMN IF NOT EXISTS, so use
-- information_schema to keep this migration repeatable.
DELIMITER //
DROP PROCEDURE IF EXISTS add_location_gps_columns //
CREATE PROCEDURE add_location_gps_columns()
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'Location'
      AND COLUMN_NAME = 'latitude'
  ) THEN
    ALTER TABLE Location ADD COLUMN latitude DECIMAL(10,6) NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'Location'
      AND COLUMN_NAME = 'longitude'
  ) THEN
    ALTER TABLE Location ADD COLUMN longitude DECIMAL(11,6) NULL;
  END IF;
END //
DELIMITER ;

CALL add_location_gps_columns();
DROP PROCEDURE add_location_gps_columns;

-- Populate approximate city-level coordinates for existing locations
UPDATE Location SET latitude = 28.6139, longitude = 77.2090 WHERE location_id = 1;  -- Delhi MG Road
UPDATE Location SET latitude = 19.0760, longitude = 72.8777 WHERE location_id = 2;  -- Mumbai Park Street
UPDATE Location SET latitude = 12.9716, longitude = 77.5946 WHERE location_id = 3;  -- Bangalore Lake View
UPDATE Location SET latitude = 13.0827, longitude = 80.2707 WHERE location_id = 4;  -- Chennai Anna Salai
UPDATE Location SET latitude = 26.8467, longitude = 80.9462 WHERE location_id = 5;  -- Lucknow Hazratganj
UPDATE Location SET latitude = 22.5726, longitude = 88.3639 WHERE location_id = 6;  -- Kolkata Salt Lake
UPDATE Location SET latitude = 17.3850, longitude = 78.4867 WHERE location_id = 7;  -- Hyderabad Banjara Hills
UPDATE Location SET latitude = 26.9124, longitude = 75.7873 WHERE location_id = 8;  -- Jaipur Civil Lines
UPDATE Location SET latitude = 28.6292, longitude = 77.2189 WHERE location_id = 9;  -- Delhi Connaught Place
UPDATE Location SET latitude = 18.5204, longitude = 73.8567 WHERE location_id = 10; -- Pune FC Road

-- 2. Evidence_File table (multiple files per evidence record)
CREATE TABLE IF NOT EXISTS Evidence_File (
    file_id       INT PRIMARY KEY AUTO_INCREMENT,
    evidence_id   INT NOT NULL,
    filename      VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    mimetype      VARCHAR(100),
    file_size     INT,
    uploaded_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (evidence_id) REFERENCES Evidence(evidence_id) ON DELETE CASCADE
);

-- 3. Audit_Log table
CREATE TABLE IF NOT EXISTS Audit_Log (
    log_id      INT PRIMARY KEY AUTO_INCREMENT,
    table_name  VARCHAR(50)  NOT NULL,
    record_id   INT,
    action      ENUM('INSERT','UPDATE','DELETE') NOT NULL,
    changed_by  VARCHAR(100) DEFAULT 'system',
    changed_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    old_values  JSON,
    new_values  JSON
);
