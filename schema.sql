-- ============================================================
-- CRIME MANAGEMENT SYSTEM — COMPLETE SQL SCRIPT
-- ============================================================

CREATE DATABASE IF NOT EXISTS crime_db;
USE crime_db;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS Case_Officer;
DROP TABLE IF EXISTS Crime_Person;
DROP TABLE IF EXISTS Evidence;
DROP TABLE IF EXISTS Court_Case;
DROP TABLE IF EXISTS FIR;
DROP TABLE IF EXISTS Case_File;
DROP TABLE IF EXISTS Crime;
DROP TABLE IF EXISTS Police_Officer;
DROP TABLE IF EXISTS Police_Station;
DROP TABLE IF EXISTS Person;
DROP TABLE IF EXISTS Location;
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- SECTION A: TABLE CREATION (DDL)
-- ============================================================

CREATE TABLE Location (
    location_id INT PRIMARY KEY AUTO_INCREMENT,
    address VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(10)
);

CREATE TABLE Person (
    person_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    age INT,
    gender VARCHAR(10),
    phone_number VARCHAR(15),
    address VARCHAR(255)
);

CREATE TABLE Police_Station (
    station_id INT PRIMARY KEY AUTO_INCREMENT,
    station_name VARCHAR(100) NOT NULL,
    location_id INT,
    jurisdiction_area VARCHAR(255),
    FOREIGN KEY (location_id) REFERENCES Location(location_id)
);

CREATE TABLE Police_Officer (
    officer_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    designation VARCHAR(50),
    badge_number VARCHAR(50) UNIQUE NOT NULL,
    phone_number VARCHAR(15),
    station_id INT,
    FOREIGN KEY (station_id) REFERENCES Police_Station(station_id)
);

CREATE TABLE Crime (
    crime_id INT PRIMARY KEY AUTO_INCREMENT,
    crime_type VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    time TIME,
    location_id INT,
    description TEXT,
    status VARCHAR(50),
    FOREIGN KEY (location_id) REFERENCES Location(location_id)
);

CREATE TABLE Case_File (
    case_id INT PRIMARY KEY AUTO_INCREMENT,
    crime_id INT,
    lead_officer_id INT,
    case_status VARCHAR(50),
    start_date DATE,
    end_date DATE,
    FOREIGN KEY (crime_id) REFERENCES Crime(crime_id),
    FOREIGN KEY (lead_officer_id) REFERENCES Police_Officer(officer_id)
);

CREATE TABLE Court_Case (
    court_case_id INT PRIMARY KEY AUTO_INCREMENT,
    case_id INT,
    court_name VARCHAR(100),
    verdict VARCHAR(50),
    hearing_date DATE,
    FOREIGN KEY (case_id) REFERENCES Case_File(case_id)
);

CREATE TABLE FIR (
    fir_id INT PRIMARY KEY AUTO_INCREMENT,
    crime_id INT,
    filed_by INT,
    filing_date DATE NOT NULL,
    description TEXT,
    FOREIGN KEY (crime_id) REFERENCES Crime(crime_id),
    FOREIGN KEY (filed_by) REFERENCES Person(person_id)
);

CREATE TABLE Case_Officer (
    case_id INT,
    officer_id INT,
    PRIMARY KEY (case_id, officer_id),
    FOREIGN KEY (case_id) REFERENCES Case_File(case_id),
    FOREIGN KEY (officer_id) REFERENCES Police_Officer(officer_id)
);

CREATE TABLE Crime_Person (
    crime_id INT,
    person_id INT,
    role VARCHAR(20),
    PRIMARY KEY (crime_id, person_id),
    FOREIGN KEY (crime_id) REFERENCES Crime(crime_id),
    FOREIGN KEY (person_id) REFERENCES Person(person_id)
);

CREATE TABLE Evidence (
    evidence_id INT PRIMARY KEY AUTO_INCREMENT,
    case_id INT,
    evidence_type VARCHAR(100),
    description TEXT,
    collected_date DATE,
    FOREIGN KEY (case_id) REFERENCES Case_File(case_id)
);

-- ============================================================
-- SECTION B: STORED PROCEDURE
-- ============================================================

DELIMITER //
CREATE PROCEDURE GetCaseDetails(IN p_case_id INT)
BEGIN
    SELECT cf.case_id, c.crime_type, c.date AS crime_date,
           c.status AS crime_status, po.name AS lead_officer,
           cf.case_status, cf.start_date, l.city AS location
    FROM Case_File cf
    JOIN Crime c ON cf.crime_id = c.crime_id
    JOIN Police_Officer po ON cf.lead_officer_id = po.officer_id
    JOIN Location l ON c.location_id = l.location_id
    WHERE cf.case_id = p_case_id;

    SELECT e.evidence_type, e.description, e.collected_date
    FROM Evidence e
    WHERE e.case_id = p_case_id;
END //
DELIMITER ;

-- ============================================================
-- SECTION C: STORED FUNCTION
-- ============================================================

DELIMITER //
CREATE FUNCTION GetCrimeCount(p_city VARCHAR(100))
RETURNS INT
DETERMINISTIC
BEGIN
    DECLARE crime_count INT;
    SELECT COUNT(*) INTO crime_count
    FROM Crime c
    JOIN Location l ON c.location_id = l.location_id
    WHERE l.city = p_city;
    RETURN crime_count;
END //
DELIMITER ;

-- ============================================================
-- SECTION D: TRIGGER
-- ============================================================

DELIMITER //
CREATE TRIGGER after_crime_insert
    AFTER INSERT ON Crime
    FOR EACH ROW
    BEGIN
        INSERT INTO Case_File (crime_id, lead_officer_id, case_status, start_date)
        VALUES (NEW.crime_id, 1, 'Open', CURDATE());
    END //
DELIMITER ;

-- ============================================================
-- SECTION E: CURSOR PROCEDURE
-- ============================================================

DELIMITER //
CREATE PROCEDURE ListOpenCases()
BEGIN
    DECLARE done INT DEFAULT 0;
    DECLARE v_case_id INT;
    DECLARE v_crime_type VARCHAR(50);
    DECLARE v_officer VARCHAR(100);

    DECLARE case_cursor CURSOR FOR
        SELECT cf.case_id, c.crime_type, po.name
        FROM Case_File cf
        JOIN Crime c ON cf.crime_id = c.crime_id
        JOIN Police_Officer po ON cf.lead_officer_id = po.officer_id
        WHERE cf.case_status = 'Open';

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

    OPEN case_cursor;
    read_loop: LOOP
        FETCH case_cursor INTO v_case_id, v_crime_type, v_officer;
        IF done THEN LEAVE read_loop; END IF;
        SELECT v_case_id AS CaseID, v_crime_type AS CrimeType, v_officer AS LeadOfficer;
    END LOOP;
    CLOSE case_cursor;
END //
DELIMITER ;

-- ============================================================
-- SECTION F: SAMPLE DATA (DML)
-- ============================================================

INSERT INTO Location VALUES
(1,'123 MG Road','Delhi','Delhi','110001'),
(2,'45 Park Street','Mumbai','Maharashtra','400001'),
(3,'7 Lake View','Bangalore','Karnataka','560001'),
(4,'88 Anna Salai','Chennai','Tamil Nadu','600002'),
(5,'12 Hazratganj','Lucknow','Uttar Pradesh','226001'),
(6,'5 Salt Lake','Kolkata','West Bengal','700091'),
(7,'34 Banjara Hills','Hyderabad','Telangana','500034'),
(8,'9 Civil Lines','Jaipur','Rajasthan','302006'),
(9,'22 Connaught Place','Delhi','Delhi','110001'),
(10,'67 FC Road','Pune','Maharashtra','411004');

INSERT INTO Person VALUES
(1,'Rahul Sharma',32,'Male','9876543210','12 Main St, Delhi'),
(2,'Priya Mehta',27,'Female','9812345678','34 Oak Ave, Mumbai'),
(3,'Amit Kumar',45,'Male','9988776655','5 Hill Rd, Bangalore'),
(4,'Sunita Verma',38,'Female','9871234560','88 Anna Salai, Chennai'),
(5,'Vikram Singh',29,'Male','9823456781','12 Hazratganj, Lucknow'),
(6,'Anjali Rao',52,'Female','9834567892','5 Salt Lake, Kolkata'),
(7,'Deepak Nair',41,'Male','9845678903','34 Banjara Hills, Hyderabad'),
(8,'Meena Patel',35,'Female','9856789014','9 Civil Lines, Jaipur'),
(9,'Rohit Gupta',23,'Male','9867890125','22 CP, Delhi'),
(10,'Kavitha Iyer',30,'Female','9878901236','67 FC Road, Pune'),
(11,'Suresh Babu',55,'Male','9889012347','MG Road, Bangalore'),
(12,'Nisha Kapoor',26,'Female','9890123458','Bandra, Mumbai');

INSERT INTO Police_Station VALUES
(1,'Delhi Central Station',1,'Central Delhi'),
(2,'Mumbai South Station',2,'South Mumbai'),
(3,'Bangalore East Station',3,'East Bangalore'),
(4,'Chennai Central',4,'Central Chennai'),
(5,'Lucknow Kotwali',5,'Central Lucknow'),
(6,'Kolkata Lalbazar',6,'Central Kolkata'),
(7,'Hyderabad Banjara Hills',7,'Banjara Hills'),
(8,'Jaipur Walled City',8,'Old Jaipur');

INSERT INTO Police_Officer VALUES
(1,'Inspector Raj','Inspector','B1001','9900112233',1),
(2,'SI Preethi','Sub-Inspector','B1002','9900112244',2),
(3,'DSP Verma','DSP','B1003','9900112255',1),
(4,'Inspector Suresh','Inspector','B1004','9900112266',3),
(5,'SI Ananya','Sub-Inspector','B1005','9900112277',4),
(6,'Inspector Khan','Inspector','B1006','9900112288',5),
(7,'Constable Ravi','Constable','B1007','9900112299',6),
(8,'SI Meghna','Sub-Inspector','B1008','9900112300',7),
(9,'Inspector Bose','Inspector','B1009','9900112311',8),
(10,'DSP Sharma','DSP','B1010','9900112322',2);

SET FOREIGN_KEY_CHECKS = 0;

INSERT INTO Crime VALUES
(1,'Theft','2024-01-15','14:30:00',1,'Laptop stolen from office','Open'),
(2,'Robbery','2024-02-20','22:00:00',2,'ATM robbery at night','Closed'),
(3,'Assault','2024-03-05','18:45:00',3,'Street assault near market','Under Investigation'),
(4,'Fraud','2024-03-20','10:00:00',4,'Bank fraud reported','Open'),
(5,'Burglary','2024-04-10','02:15:00',5,'House broken into','Closed'),
(6,'Murder','2024-04-22','23:00:00',6,'Body found near river','Under Investigation'),
(7,'Kidnapping','2024-05-01','16:00:00',7,'Child reported missing','Open'),
(8,'Cybercrime','2024-05-15','09:00:00',8,'Online banking scam','Under Investigation'),
(9,'Drug Trafficking','2024-06-01','20:30:00',9,'Drugs seized at checkpoint','Closed'),
(10,'Arson','2024-06-10','03:00:00',10,'Warehouse set on fire','Open'),
(11,'Vandalism','2024-06-20','21:00:00',1,'Public property damaged','Closed'),
(12,'Extortion','2024-07-05','11:00:00',2,'Business owner threatened','Under Investigation'),
(13,'Hit and Run','2024-07-15','08:00:00',3,'Pedestrian struck by vehicle','Open'),
(14,'Forgery','2024-07-22','14:00:00',4,'Fake documents found','Closed'),
(15,'Smuggling','2024-08-01','04:00:00',5,'Contraband at border','Under Investigation');

SET FOREIGN_KEY_CHECKS = 1;

INSERT INTO Case_File VALUES
(1,1,1,'Open','2024-01-16',NULL),
(2,2,2,'Closed','2024-02-21','2024-03-10'),
(3,3,4,'Under Investigation','2024-03-06',NULL),
(4,4,5,'Open','2024-03-21',NULL),
(5,5,6,'Closed','2024-04-11','2024-05-01'),
(6,6,3,'Under Investigation','2024-04-23',NULL),
(7,7,8,'Open','2024-05-02',NULL),
(8,8,9,'Under Investigation','2024-05-16',NULL),
(9,9,10,'Closed','2024-06-02','2024-06-20'),
(10,10,1,'Open','2024-06-11',NULL),
(11,11,2,'Closed','2024-06-21','2024-07-10'),
(12,12,4,'Under Investigation','2024-07-06',NULL),
(13,13,6,'Open','2024-07-16',NULL),
(14,14,9,'Closed','2024-07-23','2024-08-15'),
(15,15,10,'Under Investigation','2024-08-02',NULL);

INSERT INTO FIR VALUES
(1,1,1,'2024-01-15','Laptop stolen from office premises at 2:30 PM'),
(2,2,2,'2024-02-20','ATM robbery witnessed near Park Street'),
(3,3,3,'2024-03-05','Victim was assaulted near the market area'),
(4,4,4,'2024-03-20','Fraudulent bank transactions reported'),
(5,5,5,'2024-04-10','House was burglarized in the early morning'),
(6,6,6,'2024-04-22','Body discovered near the river bank'),
(7,7,7,'2024-05-01','Child went missing from school premises'),
(8,8,8,'2024-05-15','Multiple victims of online banking fraud'),
(9,9,9,'2024-06-01','Large quantity of drugs seized'),
(10,10,10,'2024-06-10','Warehouse fire reported at 3 AM');

INSERT INTO Court_Case VALUES
(1,2,'Mumbai High Court','Guilty','2024-04-15'),
(2,5,'Lucknow District Court','Acquitted','2024-06-01'),
(3,9,'Delhi High Court','Guilty','2024-07-10'),
(4,11,'Mumbai Sessions Court','Guilty','2024-08-01'),
(5,14,'Chennai District Court','Pending','2024-09-15');

INSERT INTO Evidence VALUES
(1,1,'CCTV Footage','Camera footage from office lobby','2024-01-16'),
(2,2,'Weapon','Knife recovered at crime scene','2024-02-21'),
(3,3,'Medical Report','Victim injury documentation','2024-03-06'),
(4,4,'Documents','Forged bank documents','2024-03-21'),
(5,5,'Fingerprints','Prints found on window sill','2024-04-11'),
(6,6,'DNA Sample','Blood sample collected from scene','2024-04-23'),
(7,7,'Phone Records','Call logs and messages','2024-05-02'),
(8,8,'Digital Evidence','Phishing emails and logs','2024-05-16'),
(9,9,'Contraband','Drug samples for lab analysis','2024-06-02'),
(10,10,'Forensic Report','Accelerant traces found','2024-06-11'),
(11,1,'Witness Statement','Statement from receptionist','2024-01-17'),
(12,6,'Autopsy Report','Cause of death: blunt force trauma','2024-04-24'),
(13,7,'CCTV Footage','School gate camera recording','2024-05-03'),
(14,12,'Audio Recording','Extortion call recording','2024-07-07'),
(15,15,'Seized Goods','Contraband items catalogue','2024-08-02');

INSERT INTO Crime_Person VALUES
(1,1,'Victim'),
(1,9,'Suspect'),
(2,3,'Suspect'),
(2,2,'Witness'),
(3,2,'Witness'),
(3,5,'Victim'),
(4,4,'Victim'),
(4,11,'Suspect'),
(5,5,'Victim'),
(6,6,'Victim'),
(6,7,'Suspect'),
(7,7,'Victim'),
(8,8,'Victim'),
(9,9,'Suspect'),
(10,10,'Victim'),
(11,1,'Witness'),
(12,12,'Victim'),
(13,3,'Victim'),
(14,4,'Suspect'),
(15,6,'Witness');

INSERT INTO Case_Officer VALUES
(1,1),(1,7),(2,2),(2,10),(3,4),(3,8),(4,5),(5,6),
(6,3),(6,7),(7,8),(8,9),(9,10),(10,1),(11,2),(12,4),
(13,6),(14,9),(15,10),(3,1);
