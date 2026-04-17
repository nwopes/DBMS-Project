const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/crimes', require('./routes/crimes'));
app.use('/api/persons', require('./routes/persons'));
app.use('/api/officers', require('./routes/officers'));
app.use('/api/stations', require('./routes/stations'));
app.use('/api/locations', require('./routes/locations'));
app.use('/api/cases', require('./routes/cases'));
app.use('/api/firs', require('./routes/firs'));
app.use('/api/evidence', require('./routes/evidence'));
app.use('/api/court-cases', require('./routes/courtCases'));
app.use('/api/crime-persons', require('./routes/crimePersons'));
app.use('/api/case-officers', require('./routes/caseOfficers'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Crime Management Server running on port ${PORT}`);
});
