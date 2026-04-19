'use strict';
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const express  = require('express');
const cors     = require('cors');
const path     = require('path');
const { initDB } = require('./db');
const routes = require('./routes');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.use('/api', routes);

app.use(express.static(path.join(__dirname, '..', 'frontend')));

app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

(async () => {
  await initDB();
  app.listen(PORT, () => {
    console.log(`🚀  IPSS server running → http://localhost:${PORT}`);
  });
})();
