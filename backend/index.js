const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const recordRoutes = require('./routes/recordRoutes');

const app = express();
// const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send('CRUD MVP API is running');
});

// ✅ Use Record Routes
app.use('/api/records', recordRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${PORT}`);
});

