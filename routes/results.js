const express = require('express');
const bodyParser = require('body-parser'); //parses information from POST
const logger = require('../logger');

const router = express.Router();

router.use(bodyParser.urlencoded({ extended: true }));

const Result = require('../models/results');

// define the home page route
router.get('/', (req, res) => {
    Result.find({}, (error, results) => {
        if (error) logger.error(error);
        res.send(results);
    });
});

module.exports = router;
