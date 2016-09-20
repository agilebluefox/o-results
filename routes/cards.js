'use strict()';

const express = require('express');
const bodyParser = require('body-parser'); //parses information from POST
const logger = require('../logger');

const router = express.Router();

router.use(bodyParser.urlencoded({ extended: true }));

const Card = require('../models/cards');

// define the home page route
router.get('/', (req, res) => {
    Card.find({}, (error, cards) => {
        if (error) logger.error(error);
        res.send(cards);
    });
});

module.exports = router;
