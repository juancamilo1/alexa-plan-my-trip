const bodyParser = require('body-parser')
const express = require('express');
const planIt = require('./planit-handler')

const app = express();

// Parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false}));

// Parse application/json
app.use(bodyParser.json());

app.get('/', (req, res) => res.send('Hello World!'));

app.post('/planit', (req, res) => {
    planIt.process(req, res);
});

app.listen(3000, () => {
    console.log('Listening on port 3000');
});