const express = require('express');
const path = require('path');
const settings = require('./system/settings');

const runDisplay = require('./system/runDisplay');

const app = express();

const port = 80;

app.use(express.json());

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Internal error');
});

app.use(express.static(path.join(__dirname, 'ui/build')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'ui/build/index.html'));
});

app.get('/api/settings', (req, res) => {
  res.send(settings.get());
});

app.put('/api/settings', (req, res) => {
  // TODO: validation
  settings.set(req.body);
  res.status(200).json(req.body);
});

runDisplay();
console.log('Display initialized');

app.listen(port, () => console.log(`Server started on http://localhost:${port}`));
