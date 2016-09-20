const express = require('express');
const bodyParser = require('body-parser'); //parses information from POST
const logger = require('../logger');

const router = express.Router();

router.use(bodyParser.urlencoded({ extended: true }));

const Control = require('../models/controls');

// define the home page route
router.get('/', (req, res) => {
    Control.find({}, (error, controls) => {
        if (error) logger.error(error);
        res.send(controls);
    });
});

module.exports = router;
