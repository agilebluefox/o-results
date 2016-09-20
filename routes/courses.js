const express = require('express');
const bodyParser = require('body-parser'); //parses information from POST
const logger = require('../logger');

const router = express.Router();

router.use(bodyParser.urlencoded({ extended: true }));

const Course = require('../models/courses');

// define the home page route
router.get('/', (req, res) => {
    Course.find({}, (error, courses) => {
        if (error) logger.error(error);
        res.send(courses);
    });
});

module.exports = router;
