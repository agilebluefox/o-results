'use strict()';

const express = require('express');

const app = express();

const Card = require('../src/models/card');

/**
 * API Docs
 */
app.get('/card', (req, res) => {
    Card.find({}, (error, cards) => {
        if (error) {
            // WINSTON.LOG('ERROR', '<I>Bad stuff happened</I>');
        }
    });
  res.send('Hello World!');
});

app.listen(3000, () => {
  console.log('listening on port 3000!');
});
