const express = require('express');
const bodyParser = require('body-parser'); //parses information from POST
const logger = require('../logger');

const router = express.Router();

router.use(bodyParser.urlencoded({ extended: true }));

const Event = require('../models/events');

// define the home page route
router.get('/', (req, res) => {
    Event.find({}, (error, events) => {
        if (error) logger.error(error);
        res.send(events);
    });
});

module.exports = router;
