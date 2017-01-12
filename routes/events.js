'use strict';

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

// Get API to return a single event
router.get('/:id', (req, res) => {
    logger.debug(`In the Event '/:id' ... GET Method`);

    // Get the id from the request body
    const id = req.params.id;
    logger.debug(`The event id parameter is ${id}`);

    // Find that event in the database
    Event.findById(id, (err, doc) => {
        if (err) {
            logger.error(err);
            return res.json({
                title: 'An error occurred retrieving the events',
                error: err
            });
        } else {
            logger.debug(`Here is the document found: ${doc}`);
            res.json({
                message: 'Success, found an event with that Id',
                data: doc
            });
        }
    });
});

// Get API to return a list of events
router.get('/', (req, res) => {
    logger.debug(`In the Event '/' ... GET Method`);
    Event.find({
            active: true
        })
        .exec((err, docs) => {
            if (err) {
                logger.error(err);
                return res.json({
                    title: 'An error occurred retrieving the events',
                    error: err
                });
            } else {
                return res.json({
                    message: 'Success',
                    data: docs
                });
            }
        });
});

// Post API to add a new single event
router.post('/', (req, res) => {
    logger.debug('In the Event route ... POST Method');
    // Get values from POST request.
    const active = req.body.active || true;
    const location = req.body.location;
    const name = req.body.name;
    const date = req.body.date;
    const students = req.body.students || [];
    // Store the data in the request
    let doc = {
        active: active,
        location: location,
        name: name,
        date: date,
        students: students
    };

    // Validation rules for the students property
    const checkStudent = nodeValidator.isObject()
        .withRequired('_id', customValidator.isMongoId());

    // Validation rules for the event document
    const checkEvent = nodeValidator.isObject()
        .withOptional('active', nodeValidator.isBoolean())
        .withRequired('location', customValidator.isIn({
            list: ['lake raleigh', 'lake johnson', 'schenck forest', 'umstead park']
        }))
        .withRequired('name', nodeValidator.isString({
            regex: /^[a-zA-Z0-9 ]{1,50}$/
        }))
        .withRequired('date', nodeValidator.isDate())
        .withOptional('students', nodeValidator.isArray(checkStudent));

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
            res.status(400).send({
                message: 'There have been validation errors',
                data: `${ util.inspect(doc) }`
            });
        })
        // If there are no validation errors, make sure the entry will be unique
        .then((doc) => {
            // The validation promise was resolved, now use the validated
            // document in a new promise that checks for duplicates
            myLibs.checkForDuplicateDocs(doc, {
                    location: doc.location,
                    name: doc.name,
                    date: doc.date,
                    students: doc.students
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
                            students
                        }, (err, doc) => {
                            if (err) {
                                res.send({
                                    message: 'There was a problem adding the event to the database.'
                                });
                                logger.error('The event could not be added to the database');
                            } else {
                                // event has been created
                                logger.info(`POST creating new event: ${doc}`);
                                // JSON response will show the newly created document
                                res.status(201).json({
                                    message: 'The event was successfully added to the database',
                                    data: doc
                                });
                            }
                        });
                    }
                });
        });
});

// Put API to update one or more events
router.put('/', (req, res) => {
    logger.debug('In the Event route ... PUT Method');
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
            return res.status(201).json({
                message: 'Check the data property for the results',
                data: all
            });
        }
        return;
    }

    // Iterate over the request to handle multiple updates
    req.body.forEach((entry) => {
        logger.debug(`The document in the loop is: ${util.inspect(entry)}`);

        // Store the properties in variables
        const id = entry._id;
        const active = entry.active;
        const location = entry.location;
        const name = entry.name;
        const date = entry.date;
        const students = entry.students || [];

        // Store the data in the request
        let doc = {
            id: id,
            active: active,
            location: location,
            name: name,
            date: date,
            students: students
        };

        // Validation rules for the students property
        const checkStudent = customValidator.isMongoId();

        // Validation rules for the event document
        const checkEvent = nodeValidator.isObject()
            .withRequired('id', customValidator.isMongoId())
            .withOptional('active', nodeValidator.isBoolean())
            .withRequired('location', customValidator.isIn({
                list: ['lake raleigh', 'lake johnson', 'schenck forest', 'umstead park']
            }))
            .withRequired('name', nodeValidator.isString({
                regex: /^[a-zA-Z0-9 ]{1,50}$/
            }))
            .withRequired('date', nodeValidator.isDate())
            .withOptional('students', nodeValidator.isArray(checkStudent));
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
                    _id: {
                        "$ne": doc.id
                    },
                    students: doc.students
                }, Event).then((entry) => {
                    if (entry) {
                        logger.info(`DUPLICATE - A duplicate event was found`);
                        doc.errors = [{
                            message: "An identical event already exists in the collection."
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
                            students
                        }, {
                            new: true
                        }, (error, doc) => {
                            // If an error occurs while attempting the update 
                            // add the event to the failed array
                            if (error) {
                                logger.error(error);
                                logger.info(`FAILED - The event was not updated.`);
                                logger.debug(`FAILED - The event failed to update: ${util.inspect(doc)}`);
                                failed.push(doc);
                                checkIfDone();
                            }
                            // Add the updated event to the success array
                            logger.info(`UPDATED - The event was updated.`);
                            logger.debug(`UPDATED - The event was updated: ${util.inspect(doc)}`);
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
});

// Delete API to remove a single event
router.delete('/', (req, res) => {
    logger.debug('In the Event route ... DELETE Method');
    const id = req.body.id;
    logger.debug(`The id of the event to remove is: ${id}`);
    Event.findByIdAndRemove(id, (error, doc) => {
        if (error) {
            return res.status(500).json({
                message: 'Could not remove the event from the database',
                data: doc
            });
        }
        res.status(201).json({
            message: 'The event was removed from the database',
            data: doc
        });
    });
});

module.exports = router;