'use strict()';

const express = require('express');
const bodyParser = require('body-parser'); //parses information from POST
const logger = require('../libs/logger');

const router = express.Router();

router.use(bodyParser.urlencoded({ extended: true }));

const Class = require('../models/classes');

// build the REST operations at the base for classes
// this will be accessible from http://127.0.0.1:3000/classes if the default
// route for / is left unchanged
router.route('/')
    //GET all classes
    .get((req, res) => {
        //retrieve all classes from Mongo
        Class.find({ active: true }, (err, classes) => {
            if (err) {
                logger.error(err);
            } else {
                // respond to both HTML and JSON. JSON responses require
                // 'Accept: application/json;' in the Request Header
                res.format({
                    // HTML response will render the index.pug file in the
                    // views/classes folder. We are also setting 'classes''
                    // to be an accessible variable in our pug view
                    html: () => {
                        res.render('classes/index', {
                            title: 'All my classes',
                            classes
                        });
                    },
                    //JSON response will show all classes in JSON format
                    json: () => {
                        logger.info(classes);
                        res.json(classes);
                    }
                });
            }
        });
    })
    .post((req, res) => {
        // TODO: Validate data in the request
        // Get values from POST request. These can be done through forms or
        // REST calls. These rely on the 'name'' attributes for forms
        const active = req.body.active;
        const year = req.body.year;
        const semester = req.body.semester;
        const prefix = req.body.prefix;
        const number = req.body.number;
        const name = req.body.name;
        const section = req.body.section;
        //call the create function for our database
        Class.create({
            active,
            year,
            semester,
            prefix,
            number,
            name,
            section
        }, (err, doc) => {
            if (err) {
                res.send('There was a problem adding the class to the database.');
                logger.error('The class could not be added to the database');
            } else {
                //Class has been created
                logger.error(`POST creating new class: ${doc}`);
                res.format({
                    // HTML response will set the location and redirect back
                    // to the home page. You could also create a 'success'
                    // page if that's your thing
                    html: () => {
                        // If it worked, set the header so the address bar
                        // doesn't still say /adduser
                        res.location('classes');
                        // And forward to success page
                        res.redirect('/classes');
                    },
                    // JSON response will show the newly created class
                    json: () => {
                        res.json(doc);
                    }
                });
            }
        });
    })
    .put((req, res) => {
        const id = req.body._id;
        const active = req.body.active;
        const year = req.body.year;
        const semester = req.body.semester;
        const prefix = req.body.prefix;
        const number = req.body.number;
        const name = req.body.name;
        const section = req.body.section;
        // Update the modified object
        Class.findByIdAndUpdate(id, {
            active,
            year,
            semester,
            prefix,
            number,
            name,
            section
        }, { new: true }, (error, doc) => {
            if (error) {
                return res.status(500).json({
                    message: 'Could not update the class document'
                });
            }
            return res.status(201).json(doc);
        });
    })
    .delete((req, res) => {
        const id = req.body._id;
        Class.findByIdAndUpdate(id, {
            active: false
        }, { new: true }, (error, doc) => {
            if (error) {
                    return res.status(500).json({
                        message: 'Could not delete the class'
                    });
                }
                return res.status(201).json(doc);
        });
    });

module.exports = router;
