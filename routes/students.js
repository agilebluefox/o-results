const express = require('express');
const bodyParser = require('body-parser'); //parses information from POST
const logger = require('../logger');

const router = express.Router();

router.use(bodyParser.urlencoded({ extended: true }));

const Student = require('../models/students');

// define the home page route
router.get('/', (req, res) => {
    Student.find({}, (error, students) => {
        if (error) logger.error(error);
        res.send(students);
    });
});

module.exports = router;
