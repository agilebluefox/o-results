'use strict()';

const express = require('express');
const util = require('util');
// const expressValidator = require('express-validator');
const bodyParser = require('body-parser'); //parses information from POST
const validateClassDoc = require('../libs/custom-validators');
const logger = require('../libs/logger');
const Class = require('../models/classes');

const router = express.Router();
router.use(bodyParser.urlencoded({
    extended: true
}));
// router.use(expressValidator());

function checkDuplicateClass(entry) {
    logger.debug(`Checking for duplicate classes: ${util.inspect(entry)}`);
    Class.count({
        year: entry.year,
        semester: entry.semester,
        prefix: entry.prefix,
        number: entry.number,
        name: entry.name,
        section: entry.section
    }, (err, count) => {
        logger.debug(`The number of duplicate classes is: ${count}`);
        if (count > 0) {
            return true;
        }
    })
}

// build the REST operations at the base for classes
// this will be accessible from http://127.0.0.1:3000/classes if the default
// route for / is left unchanged
router.route('/')
    //GET all classes
    .get((req, res) => {
        //retrieve all classes from Mongo
        Class.find({
            active: true
        }, (err, classes) => {
            if (err) {
                logger.error(err);
            } else {
                // respond to both HTML and JSON. JSON responses require
                // 'Accept: application/json;' in the Request Header
                res.format({
                    // HTML response will render the index.pug file in the
                    // views/classes folder. We are also setting 'classes''
                    // to be an accessible variable in our pug view
                    // html: () => {
                    //     res.render('classes/index', {
                    //         title: 'All my classes',
                    //         classes
                    //     });
                    // },
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
        // Get values from POST request. These can be done through forms or
        // REST calls. These rely on the 'name'' attributes for forms
        const active = req.body.active || true;
        const year = req.body.year || year;
        const semester = req.body.semester || '';
        const prefix = req.body.prefix || '';
        const number = req.body.number || '';
        const name = req.body.name || '';
        const section = req.body.section || '';

        // Add the expected properties to an object
        let required = {
            year: year,
            semester: semester,
            prefix: prefix,
            number: number,
            name: name,
            section: section
        };

        let optional = {
            active: active
        }

        logger.info(entry);

        // Modify the entry to add an errors property including 
        // any validation errors that exist
        let entry = validateClassDoc(required, optional);

        // Make sure the new document is not a duplicate of a current
        // document in the collection
        let duplicate = checkDuplicateClass(entry);
        // logger.debug(`Are there duplicates? ${checkDuplicateClass(entry)}`);
        if (entry.hasOwnProperty('errors') && entry.errors.length > 0) {
            logger.debug(`The entry has errors: ${util.inspect(entry)}`);
            return res.status(400).send('There have been validation errors: ' + util.inspect(entry.errors));
        } else if (duplicate) {
            logger.debug(`A duplicate class was found`);
            return res.status(400).send('This class already exists: ' + res.json(entry));
        } else {
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
                    logger.error('The class could not be added to the database');
                    return res.send('There was a problem adding the class to the database.');
                } else {
                    //Class has been created
                    logger.info(`POST creating new class: ${doc}`);
                    res.format({
                        json: () => {
                            res.json(doc);
                        }
                    });
                }
            });
        }
    })
    .put((req, res) => {
        let length = req.body.length;
        let updated = [];
        let failed = [];
        req.body.forEach((entry) => {
            logger.debug(entry);
            // Prevent null or undefined properties 
            const id = entry._id || '';
            const active = entry.active || true;
            const year = entry.year || '';
            const semester = entry.semester || '';
            const prefix = entry.prefix || '';
            const number = entry.number || '';
            const name = entry.name || '';
            const section = entry.section || '';

            // Add the expected properties to an object

            let required = {
                id: id,
                year: year,
                semester: semester,
                prefix: prefix,
                number: number,
                name: name,
                section: section
            };

            let optional = {
                active: active,
            };

            // Modify the entry to add an errors property including 
            // any validation errors that exist
            entry = validateClassDoc(required, optional);
            logger.info(entry);

            // If the data does not validate, add the entry to the fail array
            if (entry.hasOwnProperty('errors') && entry.errors.length > 0) {
                failed.push(entry);
                if (updated.length + failed.length === length) {
                    let all = {
                        success: updated,
                        fail: failed
                    };
                    return res.status(201).json(all);
                }
                // If the data passes all validation checks...
            } else {
                // Update the modified object
                Class.findByIdAndUpdate(id, {
                    active,
                    year,
                    semester,
                    prefix,
                    number,
                    name,
                    section
                }, {
                    new: true
                }, (error, doc) => {
                    // If an error occurs while attempting the update 
                    // add the document to the fail array
                    if (error) {
                        logger.error(error);
                        failed.push(doc);
                        // When all of the documents have been evaluated
                        // respond with an object containing the list
                        // of failures and successes
                        if (updated.length + failed.length === length) {
                            let all = {
                                success: updated,
                                fail: failed
                            };
                            return res.status(201).json(all);
                        }
                    }
                    // Add the updated document to the success array
                    updated.push(doc);
                    // When all of the documents have been evaluated
                    // respond with an object containing the list
                    // of failures and successes
                    if (updated.length + failed.length === length) {
                        let all = {
                            success: updated,
                            fail: failed
                        };
                        return res.status(201).json(all);
                    }
                });
            }
        });
    })
    .delete((req, res) => {
        const id = req.body._id;
        Class.findByIdAndUpdate(id, {
            active: false
        }, {
            new: true
        }, (error, doc) => {
            if (error) {
                return res.status(500).json({
                    message: 'Could not delete the class'
                });
            }
            return res.status(201).json(doc);
        });
    });

module.exports = router;