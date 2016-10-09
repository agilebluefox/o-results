'use strict()';

const express = require('express');
const util = require('util');
const bodyParser = require('body-parser'); //parses information from POST
const nodeValidator = require('node-validator'); // Provides standard validation functions
const customValidator = require('../libs/custom-validators'); // additional validators 
const logger = require('../libs/logger'); // Provides logging functions
const myLibs = require('../libs/helpers'); // Common functions for app
const Result = require('../models/results');

const router = express.Router();
router.use(bodyParser.urlencoded({
    extended: true
}));

// define the home page route
router.route('/')
    //GET all results
    // TODO: Only retrieve results based on event and/or course
    .get((req, res) => {
        //retrieve all active results from Mongo
        Result.find({
                active: true
            })
            // TODO: Limit the populate method to specific properties
            .populate('event')
            .populate('course')
            .populate('student')
            .exec((err, docs) => {
                if (err) {
                    logger.error(err);
                } else {
                    // respond to both HTML and JSON. JSON responses require
                    // 'Accept: application/json;' in the Request Header
                    res.format({
                        //JSON response will show all results in JSON format
                        json: () => {
                            res.json(docs);
                        }
                    });
                }
            });
    })
    .post((req, res) => {
        // Get values from POST request and assign to variables
        const active = req.body.active;
        const event = req.body.event;
        const course = req.body.course;
        const card = req.body.card;
        const student = req.body.student;
        const cn = req.body.cn;
        const time = req.body.time;

        // Get values from POST request and assign to variables
        let doc = {
            event: event,
            course: course,
            student: student,
            card: card,
            cn: cn,
            time: time
        };

        // validation rules for the result document
        const checkResult = nodeValidator.isObject()
            .withOptional('active', nodeValidator.isBoolean())
            .withRequired('event', customValidator.isMongoId())
            .withRequired('course', customValidator.isMongoId())
            .withRequired('student', customValidator.isMongoId())
            .withRequired('card', nodeValidator.isString({
                regex: /^[0-9]{1,7}$/
            }))
            .withRequired('cn', nodeValidator.isString({
                regex: /^[0-9]{1,3}$/
            }))
            .withRequired('time', nodeValidator.isDate());

        // Validate the input for the new document
        new Promise((resolve, reject) => {
                nodeValidator.run(checkResult, doc, (errorCount, errors) => {
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
                        event: doc.event,
                        course: doc.course,
                        student: doc.student,
                        card: doc.card,
                        cn: doc.cn,
                        time: doc.time
                    }, Result)
                    // If the promise returns true, a duplicate student exists
                    // The entry represents the return value for the second promise
                    .then((entry) => {
                        if (entry) {
                            logger.info(`DUPLICATE - A duplicate student was found`);
                            return res.status(400).send({
                                message: 'This student already exists.',
                                data: doc
                            });
                        } else {
                            //call the create function for our database
                            Result.create({
                                active,
                                event,
                                course,
                                card,
                                student,
                                cn,
                                time
                            }, (err, doc) => {
                                if (err) {
                                    res.send('There was a problem adding the result to the database.');
                                    logger.error('The result could not be added to the database');
                                } else {
                                    //result has been created
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

            const id = entry._id;
            const event = entry.event;
            const course = entry.course;
            const card = entry.card;
            const student = entry.student;
            const cn = entry.cn;
            const time = entry.time;
            const active = entry.active

            // Get values from POST request and assign to variables
            let doc = {
                id: id,
                event: event,
                course: course,
                student: student,
                card: card,
                cn: cn,
                time: time,
                active: active
            };

            // validation rules for the result document
            const checkResult = nodeValidator.isObject()
                .withRequired('id', customValidator.isMongoId())
                .withOptional('active', nodeValidator.isBoolean())
                .withRequired('event', customValidator.isMongoId())
                .withRequired('course', customValidator.isMongoId())
                .withRequired('student', customValidator.isMongoId())
                .withRequired('card', nodeValidator.isString({
                    regex: /^[0-9]{1,7}$/
                }))
                .withRequired('cn', nodeValidator.isString({
                    regex: /^[0-9]{1,3}$/
                }))
                .withRequired('time', nodeValidator.isDate());

            // Validate the input for the new document
            new Promise((resolve, reject) => {
                    nodeValidator.run(checkResult, doc, (errorCount, errors) => {
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
                        event: doc.event,
                        course: doc.course,
                        student: doc.student,
                        card: doc.card,
                        cn: doc.cn,
                        time: doc.time
                    }, Result).then((entry) => {
                        if (entry) {
                            logger.info(`DUPLICATE - A duplicate document was found`);
                            doc.errors = [{
                                message: "An identical document already exists in the collection."
                            }];
                            logger.debug(`FAILED - The entry failed to update: ${util.inspect(doc)}`);
                            failed.push(doc);
                            checkIfDone();
                        } else {
                            // Update the document
                            Result.findByIdAndUpdate(id, {
                                active,
                                event,
                                course,
                                card,
                                student,
                                cn,
                                time
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
        Result.findByIdAndUpdate(id, {
            active: false
        }, {
            new: true
        }, (error, doc) => {
            if (error) {
                return res.status(500).json({
                    message: 'Could not delete the result'
                });
            }
            return res.status(201).json(doc);
        });
    });

module.exports = router;