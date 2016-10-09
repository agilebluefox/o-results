'use strict()';

const express = require('express');
const util = require('util');
const bodyParser = require('body-parser'); //parses information from POST
const nodeValidator = require('node-validator'); // Provides standard validation functions
const customValidator = require('../libs/custom-validators'); // additional validators 
const logger = require('../libs/logger'); // Provides logging functions
const myLibs = require('../libs/helpers'); // Common functions for app
const Card = require('../models/cards');

const router = express.Router();
router.use(bodyParser.urlencoded({
    extended: true
}));

// define the home page route
router.route('/')
    //GET all cards
    .get((req, res) => {
        //retrieve all active cards from Mongo
        Card.find({
            active: true
        }, (err, docs) => {
            if (err) {
                logger.error(err);
            } else {
                // respond to both HTML and JSON. JSON responses require
                // 'Accept: application/json;' in the Request Header
                res.format({
                    //JSON response will show all cards in JSON format
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
        const number = req.body.number;

        // The data needed for the new document
        let doc = {
            active: active,
            number: number
        };

        const checkCard = nodeValidator.isObject()
            .withRequired('number', nodeValidator.isString({
                regex: /^[0-9]+$/
            }))
            .withOptional('active', nodeValidator.isBoolean());

        // Validate the input for the new document
        new Promise((resolve, reject) => {
                nodeValidator.run(checkCard, doc, (errorCount, errors) => {
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
                        number: doc.number
                    }, Card)
                    // If the promise returns true, a duplicate control exists
                    .then((entry) => {
                        if (entry) {
                            logger.info(`DUPLICATE - A duplicate control was found`);
                            return res.status(400).send({
                                message: 'This control already exists.',
                                data: doc
                            });
                        } else {
                            //call the create function for our database
                            Card.create({
                                active,
                                number
                            }, (err, doc) => {
                                if (err) {
                                    res.send('There was a problem adding the card to the database.');
                                    logger.error('The card could not be added to the database');
                                } else {
                                    //Card has been created
                                    logger.info(`POST creating new class: ${doc}`);
                                    res.format({
                                        // JSON response will show the newly created class
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
            const id = req.body._id;
            const active = req.body.active;
            const number = req.body.number;

            // The data needed for the new document
            let doc = {
                id: id,
                active: active,
                number: number
            };

            const checkCard = nodeValidator.isObject()
                .withRequired('id', customValidator.isMongoId())
                .withRequired('number', nodeValidator.isString({
                    regex: /^[0-9]+$/
                }))
                .withOptional('active', nodeValidator.isBoolean());

            // Validate the input for the new document
            new Promise((resolve, reject) => {
                    nodeValidator.run(checkCard, doc, (errorCount, errors) => {
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
                        number: doc.number
                    }, Card).then((entry) => {
                        if (entry) {
                            logger.info(`DUPLICATE - A duplicate control was found`);
                            doc.errors = [{
                                message: "An identical document already exists in the collection."
                            }];
                            logger.debug(`FAILED - The entry failed to update: ${util.inspect(doc)}`);
                            failed.push(doc);
                            checkIfDone();
                        } else {
                            // Update the object
                            Card.findByAndUpdate(id, {
                                active,
                                number
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
    // Instead of deleting the document, set the active property to false
    .delete((req, res) => {
        const id = req.body._id;
        Card.findByIdAndUpdate(id, {
            active: false
        }, {
            new: true
        }, (error, doc) => {
            if (error) {
                return res.status(500).json({
                    message: 'Could not delete the card'
                });
            }
            return res.status(201).json(doc);
        });
    });

module.exports = router;