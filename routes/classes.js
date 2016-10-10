'use strict()';

const express = require('express');
const util = require('util');
const bodyParser = require('body-parser'); //parses information from POST
const nodeValidator = require('node-validator'); // Provides standard validation functions
const customValidator = require('../libs/custom-validators'); // additional validators 
const logger = require('../libs/logger'); // Provides logging functions
const myLibs = require('../libs/helpers'); // Common functions for app
const Class = require('../models/classes'); // Mongoose model

const router = express.Router();
router.use(bodyParser.urlencoded({
    extended: true
}));

// define the route
router.route('/')
    //GET all classes
    .get((req, res) => {
        //retrieve all classes from Mongo that are active
        Class.find({
            active: true
        }, (err, classes) => {
            if (err) {
                logger.error(err);
            } else {
                // JSON responses require 'Accept: application/json;' in the Request Header
                res.format({
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
        // Get values from POST request and assign to variables
        const active = req.body.active;
        const year = req.body.year;
        const semester = req.body.semester;
        const prefix = req.body.prefix;
        const number = req.body.number;
        const name = req.body.name;
        const section = req.body.section;

        // The properties for the new object
        let doc = {
            active: active,
            year: year,
            semester: semester,
            prefix: prefix,
            number: number,
            name: name,
            section: section
        };

        // Validation rules for the class document
        const checkClass = nodeValidator.isObject()
            .withOptional('active', nodeValidator.isBoolean())
            .withRequired('year', nodeValidator.isInteger({
                min: 2000
            }))
            .withRequired('semester', customValidator.isIn({
                list: ['fall', 'spring', 'summer 1', 'summer 2']
            }))
            .withRequired('prefix', nodeValidator.isString({
                regex: /[Hh][Ee][Ss][Oo]/
            }))
            .withRequired('number', nodeValidator.isString({
                regex: /(253)/
            }))
            .withRequired('name', nodeValidator.isString({
                regex: /[a-zA-Z]{1,30}/
            }))
            .withRequired('section', nodeValidator.isString({
                regex: /[0-9]{3}/
            }));

        // Validate the input for the new document
        new Promise((resolve, reject) => {
                nodeValidator.run(checkClass, doc, (errorCount, errors) => {
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
            // If there are no validation errors, make sure the document will be unique
            .then((doc) => {
                // The validation promise was resolved, now use the validated
                // document in a new promise that checks for duplicates
                myLibs.checkForDuplicateDocs(doc, {
                        year: doc.year,
                        semester: doc.semester,
                        prefix: doc.prefix,
                        number: doc.number,
                        name: doc.name,
                        section: doc.section
                    }, Class)
                    // If the promise returns true, a duplicate class exists
                    // The entry represents the return value for the second promise
                    .then((entry) => {
                        if (entry) {
                            logger.info(`DUPLICATE - A duplicate class was found`);
                            return res.status(400).send({
                                message: 'This class already exists.',
                                data: doc
                            });
                        } else {
                            // Call the create function for our database
                            Class.create({
                                active,
                                year,
                                semester,
                                prefix: prefix.toUpperCase(),
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
            const year = entry.year;
            const semester = entry.semester.toLowerCase();
            const prefix = entry.prefix.toLowerCase();
            const number = entry.number;
            const name = entry.name.toLowerCase();
            const section = entry.section;

            // The properties for the new object
            let doc = {
                id: id,
                active: active,
                year: year,
                semester: semester,
                prefix: prefix,
                number: number,
                name: name,
                section: section
            };

            const checkClass = nodeValidator.isObject()
                .withRequired('id', customValidator.isMongoId())
                .withOptional('active', nodeValidator.isBoolean())
                .withRequired('year', nodeValidator.isInteger({
                    min: 2000
                }))
                .withRequired('semester', customValidator.isIn({
                    list: ['fall', 'spring', 'summer 1', 'summer 2']
                }))
                .withRequired('prefix', nodeValidator.isString({
                    regex: /[Hh][Ee][Ss][Oo]/
                }))
                .withRequired('number', nodeValidator.isString({
                    regex: /(253)/
                }))
                .withRequired('name', nodeValidator.isString({
                    regex: /[a-zA-Z]{1,30}/
                }))
                .withRequired('section', nodeValidator.isString({
                    regex: /[0-9]{3}/
                }));

            // Validate the input for the new document
            new Promise((resolve, reject) => {
                    nodeValidator.run(checkClass, doc, (errorCount, errors) => {
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
                // If there are no validation errors, make sure the document will be unique
                .then((doc) => {
                    // The validation promise was resolved, now use the validated
                    // document in a new promise that checks for duplicates
                    myLibs.checkForDuplicateDocs(doc, {
                            year: doc.year,
                            semester: doc.semester,
                            prefix: doc.prefix,
                            number: doc.number,
                            name: doc.name,
                            section: doc.section
                        }, Class)
                        // If the promise returns true, a duplicate document exists
                        // The entry represents the return value for the second promise
                        .then((entry) => {
                            if (entry) {
                                logger.info(`DUPLICATE - A duplicate document was found`);
                                doc.errors = [{
                                    message: "An identical document already exists in the collection."
                                }];
                                logger.debug(`FAILED - The document failed to update: ${util.inspect(doc)}`);
                                failed.push(doc);
                                checkIfDone();
                            } else {
                                // Update the modified object
                                Class.findByIdAndUpdate(id, {
                                    active,
                                    year,
                                    semester,
                                    prefix: prefix.toUpperCase(),
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
                // If the document has validation errors there's no need to check for duplicates
                .catch((doc) => {
                    logger.debug(`FAILED - The entry failed to update: ${util.inspect(doc)}`);
                    failed.push(doc);
                    checkIfDone();
                })
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