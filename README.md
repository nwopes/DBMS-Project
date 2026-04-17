# Crime Management System

> A full-stack web application for managing criminal investigations, built as a course project for **Introduction to Database Systems**.

---

## Table of Contents

- [Overview](#overview)
- [Team](#team)
- [Tech Stack](#tech-stack)
- [Database Design](#database-design)
  - [ER Diagram Summary](#er-diagram-summary)
  - [Tables & Schema](#tables--schema)
  - [Normalization](#normalization)
  - [Constraints](#constraints)
  - [Stored Routines & Triggers](#stored-routines--triggers)
- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Database Setup](#database-setup)
  - [Running the App](#running-the-app)
- [API Reference](#api-reference)
- [Screenshots](#screenshots)

---

## Overview

The **Crime Management System** models the complete lifecycle of a criminal investigation — from the initial FIR (First Information Report) filing, through case investigation and evidence collection, all the way to court proceedings and verdicts.

The system manages 11 interrelated relational entities, all normalized to **3NF or higher**, with full referential integrity enforced through foreign key constraints. It is built as a production-grade full-stack application with a modern React frontend and a Node.js/Express REST API backed by MySQL.

---

## Team

| Name | Roll Number |
|------|-------------|
| Ishanvi Singh | 2410110150 |
| Anant Joshi | 2410110049 |
| Akshat Bansal | 2410110039 |
| Arpit Goel | 2410110075 |
| Manasvi Sharma | 2410110195 |

**Submitted to:** Prof. Sonia Khetarpaul  
**Course:** Introduction to Database Systems

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS |
| Charts | Recharts |
| Routing | React Router v6 |
| HTTP Client | Axios |
| Notifications | React Hot Toast |
| Backend | Node.js + Express |
| Database | MySQL 8.0 |
| ORM/Driver | mysql2/promise |

---

## Database Design

### ER Diagram Summary

The schema contains **11 tables** with the following relationships:

```
Location ──< Crime ──< FIR >── Person
               │
               └──< Case_File >──< Case_Officer >── Police_Officer >── Police_Station >── Location
                        │
                        ├──< Evidence
                        └──< Court_Case

Crime ──< Crime_Person >── Person
```

### Tables & Schema

#### 1. `Location`
Stores geographic location data used throughout the system (crime scenes, police stations).

| Column | Type | Constraints |
|--------|------|-------------|
| `location_id` | INT | PK, AUTO_INCREMENT |
| `address` | VARCHAR(255) | NULL |
| `city` | VARCHAR(100) | NULL |
| `state` | VARCHAR(100) | NULL |
| `pincode` | VARCHAR(10) | NULL |

#### 2. `Person`
Individuals involved in crimes — victims, suspects, or witnesses.

| Column | Type | Constraints |
|--------|------|-------------|
| `person_id` | INT | PK, AUTO_INCREMENT |
| `name` | VARCHAR(100) | NOT NULL |
| `age` | INT | NULL |
| `gender` | VARCHAR(10) | NULL |
| `phone_number` | VARCHAR(15) | NULL |
| `address` | VARCHAR(255) | NULL |

#### 3. `Police_Station`
Police stations and their jurisdictions.

| Column | Type | Constraints |
|--------|------|-------------|
| `station_id` | INT | PK, AUTO_INCREMENT |
| `station_name` | VARCHAR(100) | NOT NULL |
| `location_id` | INT | FK → Location |
| `jurisdiction_area` | VARCHAR(255) | NULL |

#### 4. `Police_Officer`
Officers posted at stations, assigned to lead or assist on cases.

| Column | Type | Constraints |
|--------|------|-------------|
| `officer_id` | INT | PK, AUTO_INCREMENT |
| `name` | VARCHAR(100) | NOT NULL |
| `designation` | VARCHAR(50) | NULL |
| `badge_number` | VARCHAR(50) | UNIQUE, NOT NULL |
| `phone_number` | VARCHAR(15) | NULL |
| `station_id` | INT | FK → Police_Station |

#### 5. `Crime`
Every recorded criminal incident.

| Column | Type | Constraints |
|--------|------|-------------|
| `crime_id` | INT | PK, AUTO_INCREMENT |
| `crime_type` | VARCHAR(50) | NOT NULL |
| `date` | DATE | NOT NULL |
| `time` | TIME | NULL |
| `location_id` | INT | FK → Location |
| `description` | TEXT | NULL |
| `status` | VARCHAR(50) | NULL — `Open` / `Closed` / `Under Investigation` |

#### 6. `Case_File`
Investigation case file opened for each crime.

| Column | Type | Constraints |
|--------|------|-------------|
| `case_id` | INT | PK, AUTO_INCREMENT |
| `crime_id` | INT | FK → Crime |
| `lead_officer_id` | INT | FK → Police_Officer |
| `case_status` | VARCHAR(50) | NULL |
| `start_date` | DATE | NULL |
| `end_date` | DATE | NULL |

#### 7. `Court_Case`
Court proceedings linked to a case file.

| Column | Type | Constraints |
|--------|------|-------------|
| `court_case_id` | INT | PK, AUTO_INCREMENT |
| `case_id` | INT | FK → Case_File |
| `court_name` | VARCHAR(100) | NULL |
| `verdict` | VARCHAR(50) | NULL — `Guilty` / `Acquitted` / `Pending` / `Dismissed` |
| `hearing_date` | DATE | NULL |

#### 8. `FIR` (First Information Report)
The initial formal complaint that triggers an investigation.

| Column | Type | Constraints |
|--------|------|-------------|
| `fir_id` | INT | PK, AUTO_INCREMENT |
| `crime_id` | INT | FK → Crime |
| `filed_by` | INT | FK → Person |
| `filing_date` | DATE | NOT NULL |
| `description` | TEXT | NULL |

#### 9. `Case_Officer` *(Junction Table)*
Many-to-many: multiple officers can be assigned to a single case.

| Column | Type | Constraints |
|--------|------|-------------|
| `case_id` | INT | PK, FK → Case_File |
| `officer_id` | INT | PK, FK → Police_Officer |

#### 10. `Crime_Person` *(Junction Table)*
Associates persons with crimes, capturing their role.

| Column | Type | Constraints |
|--------|------|-------------|
| `crime_id` | INT | PK, FK → Crime |
| `person_id` | INT | PK, FK → Person |
| `role` | VARCHAR(20) | NULL — `Suspect` / `Victim` / `Witness` |

#### 11. `Evidence`
Physical or digital evidence catalogued per case.

| Column | Type | Constraints |
|--------|------|-------------|
| `evidence_id` | INT | PK, AUTO_INCREMENT |
| `case_id` | INT | FK → Case_File |
| `evidence_type` | VARCHAR(100) | NULL |
| `description` | TEXT | NULL |
| `collected_date` | DATE | NULL |

---

### Normalization

All 11 tables satisfy **3NF or higher**:

| Table | Normal Form | Justification |
|-------|-------------|---------------|
| Crime | 3NF | All non-key attributes depend solely on `crime_id`; no transitive dependencies |
| Police_Officer | 3NF | All attributes depend directly on `officer_id` |
| Case_File | 3NF | No transitive or partial functional dependencies |
| Court_Case | 3NF | All non-key attributes depend only on `court_case_id` |
| FIR | 3NF | No partial or transitive dependencies; all attributes determined by `fir_id` |
| Case_Officer | **BCNF** | Composite primary key with no non-trivial functional dependencies |
| Crime_Person | 3NF | `role` depends on the full composite key |
| Police_Station | 3NF | All attributes depend solely on `station_id` |
| Evidence | 3NF | No transitive dependencies; all attributes depend on `evidence_id` |
| Location | 3NF | All attributes describe the location directly |
| Person | 3NF | All attributes depend solely on `person_id` |

---

### Constraints

The following integrity constraints are enforced across the schema:

- **Primary Keys** on all tables to guarantee entity integrity
- **Foreign Keys** on all relationships to enforce referential integrity
- **NOT NULL** on critical fields: `Crime.crime_type`, `Crime.date`, `Person.name`, `FIR.filing_date`, `Police_Officer.badge_number`
- **UNIQUE** on `Police_Officer.badge_number` to prevent duplicate badge assignments
- **AUTO_INCREMENT** on all single-column primary keys
- **Composite Primary Keys** on junction tables `Case_Officer` and `Crime_Person`

---

### Stored Routines & Triggers

#### Stored Procedure: `GetCaseDetails(p_case_id)`
Returns full case details including the crime, lead officer, location, and all collected evidence for a given case ID.

```sql
CALL GetCaseDetails(1);
```

#### Stored Function: `GetCrimeCount(p_city)`
Returns the total number of crimes recorded in a given city. Used for city-level analytics.

```sql
SELECT GetCrimeCount('Delhi');  -- Returns: 2
```

#### Trigger: `after_crime_insert`
Fires after every new crime insertion. Automatically creates a corresponding `Case_File` record with status `Open` and the current date as `start_date`, assigned to officer ID 1 by default.

```sql
-- Inserting a crime automatically creates a case file:
INSERT INTO Crime VALUES (16, 'Robbery', '2024-09-01', '20:00:00', 1, 'Shop robbery', 'Open');
-- → Case_File row automatically inserted
```

#### Cursor Procedure: `ListOpenCases()`
Uses a cursor to iterate over all open cases and return them one by one, demonstrating cursor-based row processing.

```sql
CALL ListOpenCases();
```

---

## Features

### Dashboard
- **Stat cards** — Total crimes, open/closed/under-investigation cases, officers, stations, FIRs, evidence count
- **Pie chart** — Crime distribution by type
- **Bar chart** — Crime count per city
- **Area chart** — Monthly crime trend over time
- **Recent incidents** feed with live status badges

### Crime Records
- Full CRUD: log, view, edit, delete crimes
- Search by type or city
- Filter by status (Open / Closed / Under Investigation)
- Detail view showing involved persons and linked case files

### Case Files
- Full CRUD for investigation cases
- Detail view showing assigned officers, evidence, and court proceedings
- Status tracking from Open → Under Investigation → Closed

### FIRs (First Information Reports)
- File, edit, delete FIRs
- Click any row to view the full FIR in a modal
- Linked to crime and filing person

### Evidence Locker
- Card-based view with colour-coded evidence types
- CCTV, Weapons, DNA, Digital Evidence, Forensic Reports, and more
- Linked to case files

### Court Cases
- Track court name, hearing date, and verdict
- Verdicts: Pending / Guilty / Acquitted / Dismissed / Under Appeal

### Police Officers
- Card layout with designation-coloured avatars
- Linked to police stations

### Police Stations
- Card layout with officer count per station
- Linked to location data

### Persons Registry
- Table view of all persons in the system
- Gender-coded avatar initials
- Linked to crimes via `Crime_Person`

### Locations
- Grid of location cards with state-coloured icons
- Used by crimes and police stations

---

## Project Structure

```
DBMS-Project/
│
├── schema.sql                  # Complete SQL: DDL, DML, procedures, trigger, cursor
├── setup-db.js                 # Interactive DB setup script (Node.js)
├── SETUP.bat                   # Run this first — creates the DB
├── START.bat                   # Starts both servers
├── .gitignore
│
├── backend/
│   ├── server.js               # Express app entry point
│   ├── db.js                   # MySQL connection pool
│   ├── .env                    # DB credentials (not in git)
│   ├── package.json
│   └── routes/
│       ├── dashboard.js        # Stats, charts, recent crimes
│       ├── crimes.js           # CRUD for Crime
│       ├── cases.js            # CRUD for Case_File
│       ├── firs.js             # CRUD for FIR
│       ├── evidence.js         # CRUD for Evidence
│       ├── courtCases.js       # CRUD for Court_Case
│       ├── officers.js         # CRUD for Police_Officer
│       ├── stations.js         # CRUD for Police_Station
│       ├── persons.js          # CRUD for Person
│       ├── locations.js        # CRUD for Location
│       ├── crimePersons.js     # Crime_Person junction
│       └── caseOfficers.js     # Case_Officer junction
│
└── frontend/
    ├── index.html
    ├── vite.config.js          # Proxies /api → localhost:5000
    ├── tailwind.config.js
    ├── package.json
    └── src/
        ├── main.jsx
        ├── App.jsx             # Router setup
        ├── index.css           # Global styles + utility classes
        ├── components/
        │   ├── Sidebar.jsx     # Navigation sidebar
        │   ├── Modal.jsx       # Reusable modal dialog
        │   ├── StatCard.jsx    # Dashboard stat card
        │   ├── StatusBadge.jsx # Coloured status pill
        │   └── PageHeader.jsx  # Page title + action button
        └── pages/
            ├── Dashboard.jsx
            ├── Crimes.jsx
            ├── CrimeDetail.jsx
            ├── Cases.jsx
            ├── CaseDetail.jsx
            ├── FIRs.jsx
            ├── Evidence.jsx
            ├── Officers.jsx
            ├── Stations.jsx
            ├── Persons.jsx
            ├── CourtCases.jsx
            └── Locations.jsx
```

---

## Getting Started

### Prerequisites

| Requirement | Version |
|-------------|---------|
| Node.js | v18+ |
| npm | v9+ |
| MySQL | v8.0 |

### Database Setup

**Option A — Automated (recommended)**

Double-click `SETUP.bat`. It will prompt for your MySQL root password, then:
- Create the `crime_db` database
- Run all DDL (11 tables)
- Load all sample data (15 crimes, 12 persons, 10 officers, 8 stations, 15 cases, 10 FIRs, 15 evidence items, stored procedures, trigger, cursor)
- Automatically update `backend/.env` with your password

**Option B — Manual**

```bash
mysql -u root -p < schema.sql
```

Then update `backend/.env`:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=crime_db
PORT=5000
```

### Running the App

**Option A — One click**

Double-click `START.bat`. Opens two terminal windows (backend + frontend).

**Option B — Manual**

Terminal 1 (backend):
```bash
cd backend
npm install
npm start
# API running at http://localhost:5000
```

Terminal 2 (frontend):
```bash
cd frontend
npm install
npm run dev
# App running at http://localhost:3000
```

Open your browser at **http://localhost:3000**.

---

## API Reference

All endpoints return JSON. Base URL: `http://localhost:5000`

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/stats` | Aggregate counts for all entities |
| GET | `/api/dashboard/crimes-by-type` | Crime count grouped by type |
| GET | `/api/dashboard/crimes-by-city` | Crime count grouped by city |
| GET | `/api/dashboard/crimes-by-month` | Monthly crime trend |
| GET | `/api/dashboard/recent-crimes` | 10 most recent crime records |

### Crimes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/crimes` | List all crimes with location |
| GET | `/api/crimes/:id` | Single crime with persons and cases |
| POST | `/api/crimes` | Create new crime |
| PUT | `/api/crimes/:id` | Update crime |
| DELETE | `/api/crimes/:id` | Delete crime (cascades to FIRs, cases) |

### Cases, FIRs, Evidence, Court Cases
All follow the same REST pattern: `GET /`, `GET /:id`, `POST /`, `PUT /:id`, `DELETE /:id`

Endpoints: `/api/cases`, `/api/firs`, `/api/evidence`, `/api/court-cases`

### Officers, Stations, Persons, Locations
Same REST pattern on: `/api/officers`, `/api/stations`, `/api/persons`, `/api/locations`

### Junction Tables
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/crime-persons` | All crime-person associations |
| POST | `/api/crime-persons` | Link a person to a crime with a role |
| DELETE | `/api/crime-persons` | Remove a crime-person link |
| GET | `/api/case-officers` | All case-officer assignments |
| POST | `/api/case-officers` | Assign officer to a case |
| DELETE | `/api/case-officers` | Remove officer from a case |

---

## Screenshots

> The application features a dark navy command-center aesthetic with electric blue accents, smooth animations, and colour-coded status badges throughout.

- **Dashboard** — Live stat cards, interactive charts (pie, bar, area), recent incidents feed
- **Crimes** — Searchable, filterable table with inline status badges and per-row actions
- **Case Detail** — Nested view showing officers, evidence, and court proceedings for a single case
- **Evidence Locker** — Card-based layout with type-coloured icons
- **Officers** — Avatar cards with designation-colour coding

---

*Built with MySQL 8.0 · Node.js · React 18 · Tailwind CSS*
