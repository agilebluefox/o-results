'use strict()';

const express = require('express');
const util = require('util');
const bodyParser = require('body-parser');
const nodeValidator = require('node-validator'); // Provides standard validation functions
const customValidator = require('../libs/custom-validators'); // additional validators 
const logger = require('../libs/logger'); // Provides logging functions
const myLibs = require('../libs/helpers'); // Common functions for app
const Event = require('../models/events');

const router = express.Router();
router.use(bodyParser.urlencoded({
    extended: true
}));

// define the home page route
router.route('/')
    //GET all events
    .get((req, res) => {
        //retrieve all events from Mongo
        Event.find({
                active: true
            })
            .populate('courses')
            .populate('classes')
            .exec((err, docs) => {
                if (err) {
                    logger.error(err);
                } else {
                    // JSON responses require 'Accept: application/json;' in the Request Header
                    res.format({
                        //JSON response will show all events in JSON format
                        json: () => {
                            res.json(docs);
                        }
                    });
                }
            });
    })
    .post((req, res) => {
        // Get values from POST request.
        const active = req.body.active;
        const location = req.body.location.toLowerCase();
        const name = req.body.name.toLowerCase();
        const date = req.body.date;
        const courses = req.body.courses;
        const classes = req.body.classes;

        // Store the data in the request
        let doc = {
            active: active,
            location: location,
            name: name,
            date: date,
            courses: courses,
            classes: classes
        };

        // Validation rules for the courses property
        const checkCourse = nodeValidator.isObject()
            .withRequired('_id', customValidator.isMongoId());

        // Validation rules for the classes property
        const checkClass = nodeValidator.isObject()
            .withRequired('_id', customValidator.isMongoId());

        // Validation rules for the event document
        const checkEvent = nodeValidator.isObject()
            .withOptional('active', nodeValidator.isBoolean())
            .withRequired('location', customValidator.isIn({
                list: ['lake raleigh', 'lake johnson', 'schenck forest', 'umstead park']
            }))
            .withRequired('name', nodeValidator.isString({
                regex: /^[a-z0-9 ]{1,50}$/
            }))
            .withRequired('date', nodeValidator.isDate())
            .withOptional('courses', nodeValidator.isArray(checkCourse))
            .withOptional('classes', nodeValidator.isArray(checkClass));

        // Validate the input for the new document
        new Promise((resolve, reject) => {
                nodeValidator.run(checkEvent, doc, (errorCount, errors) => {
                    logger.info(`VALIDATION ERRORS - The number of errors is ${errorCount}`);
                    if (errorCount === 0) {
                        // If the input is valid, send the document without the error property
                        resolve(doc);
                    } else {
                        // If the input is invalid, send the response with the errors
                        logger.debug(`VALIDATION ERRORS - The errors found are: ${util.inspect(errors)}`);
                        doc.errors = errors;
                        reject(doc);
                    }
                });
            })
            // If the document has validation errors there's no need to check for duplicates
            .catch((doc) => {
                logger.info(doc);
                res.status(400).send(`There have been validation errors: ${ util.inspect(doc) }`);
            })
            // If there are no validation errors, make sure the entry will be unique
            .then((doc) => {
                // The validation promise was resolved, now use the validated
                // document in a new promise that checks for duplicates
                myLibs.checkForDuplicateDocs(doc, {
                        location: doc.location,
                        name: doc.name,
                        date: doc.date
                    }, Event)
                    // If the promise returns true, a duplicate event exists
                    // The entry represents the return value for the second promise
                    .then((entry) => {
                        if (entry) {
                            logger.info(`DUPLICATE - A duplicate event was found`);
                            return res.status(400).send({
                                message: 'This event already exists.',
                                data: doc
                            });
                        } else {
                            //call the create function for our database
                            Event.create({
                                active,
                                location,
                                name,
                                date,
                                courses,
                                classes
                            }, (err, doc) => {
                                if (err) {
                                    res.send('There was a problem adding the event to the database.');
                                    logger.error('The event could not be added to the database');
                                } else {
                                    // event has been created
                                    logger.info(`POST creating new event: ${doc}`);
                                    res.format({
                                        // JSON response will show the newly created document
                                        json: () => {
                                            res.json(doc);
                                        }
                                    });
                                }
                            });
                        }
                    });
            });
    })
    .put((req, res) => {
        // Use arrays to track passed and failed documents for final response
        let length = req.body.length;
        let passed = [];
        let failed = [];

        // Helper function to handle the response when all of the 
        // requested updates have been processed.
        function checkIfDone() {
            if (passed.length + failed.length === length) {
                let all = {
                    success: passed,
                    fail: failed,
                    errors: failed.length > 0
                };
                return res.status(201).json(all);
            }
            return;
        }

        // Iterate over the request to handle multiple updates
        req.body.forEach((entry) => {
            logger.debug(`The document in the loop is: ${util.inspect(entry)}`);

            // Store the properties in variables
            const id = entry._id;
            const active = entry.active;
            const location = entry.location.toLowerCase();
            const name = entry.name.toLowerCase();
            const date = entry.date;
            const courses = entry.courses;
            const classes = entry.classes;

            // Store the data in the request
            let doc = {
                id: id,
                active: active,
                location: location,
                name: name,
                date: date,
                courses: courses,
                classes: classes
            };

            // Validation rules for the courses property
            const checkCourse = nodeValidator.isObject()
                .withRequired('_id', customValidator.isMongoId());

            // Validation rules for the classes property
            const checkClass = nodeValidator.isObject()
                .withRequired('_id', customValidator.isMongoId());

            // Validation rules for the event document
            const checkEvent = nodeValidator.isObject()
                .withRequired('id', customValidator.isMongoId())
                .withOptional('active', nodeValidator.isBoolean())
                .withRequired('location', customValidator.isIn({
                    list: ['lake raleigh', 'lake johnson', 'schenck forest', 'umstead park']
                }))
                .withRequired('name', nodeValidator.isString({
                    regex: /^[a-z0-9 ]{1,50}$/
                }))
                .withRequired('date', nodeValidator.isDate())
                .withOptional('courses', nodeValidator.isArray(checkCourse))
                .withOptional('classes', nodeValidator.isArray(checkClass));

            // Validate the input for the new document
            new Promise((resolve, reject) => {
                    nodeValidator.run(checkEvent, doc, (errorCount, errors) => {
                        logger.info(`VALIDATION ERRORS - The number of errors is ${errorCount}`);
                        if (errorCount === 0) {
                            // If the input is valid, send the document without the error property
                            resolve(doc);
                        } else {
                            // If the input is invalid, send the response with the errors
                            logger.debug(`VALIDATION ERRORS - The errors found are: ${util.inspect(errors)}`);
                            doc.errors = errors;
                            reject(doc);
                        }
                    });
                })
                .then((doc) => {
                    // The validation promise was resolved, now use the 
                    // validated document in a new promise that checks for duplicates
                    myLibs.checkForDuplicateDocs(doc, {
                        location: doc.location,
                        name: doc.name,
                        date: doc.date,
                        courses: doc.courses,
                        classes: doc.classes
                    }, Event).then((entry) => {
                        if (entry) {
                            logger.info(`DUPLICATE - A duplicate document was found`);
                            doc.errors = [{
                                message: "An identical document already exists in the collection."
                            }];
                            logger.debug(`FAILED - The entry failed to update: ${util.inspect(doc)}`);
                            failed.push(doc);
                            checkIfDone();
                        } else {
                            // Make changes to the modified properties and send the object
                            Event.findByIdAndUpdate(id, {
                                active,
                                location,
                                name,
                                date,
                                courses,
                                classes
                            }, {
                                new: true
                            }, (error, doc) => {
                                // If an error occurs while attempting the update 
                                // add the document to the fail array
                                if (error) {
                                    logger.error(error);
                                    logger.info(`FAILED - The document was not updated.`);
                                    logger.debug(`FAILED - The document failed to update: ${util.inspect(doc)}`);
                                    failed.push(doc);
                                    checkIfDone();
                                }
                                // Add the updated document to the success array
                                logger.info(`UPDATED - The document was updated.`);
                                logger.debug(`UPDATED - The document was updated: ${util.inspect(doc)}`);
                                passed.push(doc);
                                checkIfDone();
                            });
                        }
                    });
                })
                // If the initial promise is rejected, add the document to the failed array
                .catch((doc) => {
                    logger.debug(`FAILED - The entry failed to update: ${util.inspect(doc)}`);
                    failed.push(doc);
                    checkIfDone();
                })
        });
    })
    .delete((req, res) => {
        const id = req.body._id;
        Event.findByIdAndUpdate(id, {
            active: false
        }, {
            new: true
        }, (error, doc) => {
            if (error) {
                return res.status(500).json({
                    message: 'Could not delete the event'
                });
            }
            return res.status(201).json(doc);
        });
    });

module.exports = router;