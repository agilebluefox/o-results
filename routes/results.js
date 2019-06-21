'use strict()';

const express = require('express');
const util = require('util');
const bodyParser = require('body-parser'); //parses information from POST
const nodeValidator = require('node-validator'); // Provides standard validation functions
const customValidator = require('../libs/custom-validators'); // additional validators 
const logger = require('../libs/logger'); // Provides logging functions
const myLibs = require('../libs/helpers'); // Common functions for app
const Result = require('../models/results'); // Mongoose model

const router = express.Router();
router.use(bodyParser.urlencoded({
    extended: true
}));

function createResultDoc(props, id) {
    const result = {};
    if (id) {
        result.id = props._id
    }
    result.entryId = props.entryId || '';
    result.studentId = props.studentId || '';
    result.card = props.card || '';
    result.status = props.status || '';
    result.course = props.course || '';
    return result;
}

// Get all the results for a particular event
router.get('/:eventId', (req, res) => {
    logger.debug(`In the Result '/:eventId' ... GET Method`);

    // Use the event id from the parameter list
    const eventId = req.params.eventId;

    // Locate the results from the current event
    Result.find({
        eventId: eventId
    }, (err, docs) => {
        if (err) {
            logger.error(err);
            return res.status(400).json({
                err
            });
        } else {
            return res.status(200).json({
                docs
            });
        }
    });
});

// Post a new result to the event
router.post('/', (req, res) => {
    logger.debug(`In the Result '/' ... POST Method`);

    // Store a new result
    const resultObj = createResultDoc(req.body);

    // Validation rules for the student document
    const checkStudent = nodeValidator.isObject()
        .withRequired('entryId', nodeValidator.isString())
        .withRequired('studentId', nodeValidator.isString())
        .withRequired('card', nodeValidator.isString())
        .withRequired('status', customValidator.isIn({
            list: ['Registered', 'Checked-In', 'On-Course', 'Completed']
        }))
        .withRequired('course', nodeValidator.isString());

    // Validate the input for the new document
    new Promise((resolve, reject) => {
            nodeValidator.run(checkStudent, resultObj, (errorCount, errors) => {
                logger.info(`VALIDATION ERRORS - The number of errors is ${errorCount}`);
                if (errorCount === 0) {
                    // If the input is valid, send the document without the error property
                    resolve(resultObj);
                } else {
                    // If the input is invalid, send the response with the errors
                    logger.debug(`VALIDATION ERRORS - The errors found are: ${util.inspect(errors)}`);
                    resultObj.errors = errors;
                    reject(resultObj);
                }
            });
        })
        // If the document has validation errors there's no need to check for duplicates
        .catch((resultObj) => {
            logger.info(resultObj);
            res.status(400).send(`There have been validation errors: ${ util.inspect(resultObj) }`);
        })
        // If there are no validation errors, make sure the entry will be unique
        .then((resultObj) => {
            // The validation promise was resolved, now use the validated
            // document in a new promise that checks for duplicates
            myLibs.checkForDuplicateDocs(resultObj, {
                    eventId: resultObj.eventId,
                    studentId: resultObj.studentId,
                    card: resultObj.card,
                    status: resultObj.status,
                    course: resultObj.course
                }, Result)
                // If the promise returns true, a duplicate result exists
                // The entry represents the return value for the second promise
                .then((entry) => {
                    if (entry) {
                        logger.info(`DUPLICATE - A duplicate result record was found`);
                        return res.status(200).json({
                            message: 'The result record already exists',
                            data: entry
                        });
                    } else {
                        //call the create function for our database
                        Result.create(resultObj, (err, doc) => {
                            if (err) {
                                logger.error('The result could not be added to the database');
                                res.json({
                                    message: 'There was a problem adding the result to the database.',
                                    data: doc
                                });
                            } else {
                                // The result has been created
                                logger.info(`POST creating new result record: ${doc}`);
                                res.json({
                                    message: 'The result was added to the database',
                                    data: doc
                                });
                            }
                        });
                    }
                });
        });
});

// Update a result in the event
router.put('/', (req, res) => {
    logger.debug(`In the Result '/' ... PUT Method`);

    // Store a new result
    const resultObj = createResultDoc(req.body, true);

    // Validation rules for the student document
    const checkStudent = nodeValidator.isObject()
        .withRequired('entryId', nodeValidator.isString())
        .withRequired('studentId', nodeValidator.isString())
        .withRequired('card', nodeValidator.isString())
        .withRequired('status', customValidator.isIn({
            list: ['Registered', 'Checked-In', 'On-Course', 'Completed']
        }))
        .withRequired('course', nodeValidator.isString());

    // Validate the input for the new document
    new Promise((resolve, reject) => {
            nodeValidator.run(checkStudent, resultObj, (errorCount, errors) => {
                logger.info(`VALIDATION ERRORS - The number of errors is ${errorCount}`);
                if (errorCount === 0) {
                    // If the input is valid, send the document without the error property
                    resolve(resultObj);
                } else {
                    // If the input is invalid, send the response with the errors
                    logger.debug(`VALIDATION ERRORS - The errors found are: ${util.inspect(errors)}`);
                    resultObj.errors = errors;
                    reject(resultObj);
                }
            });
        })
        // If the document has validation errors there's no need to check for duplicates
        .catch((resultObj) => {
            logger.info(resultObj);
            res.status(400).send(`There have been validation errors: ${ util.inspect(resultObj) }`);
        })
        // If there are no validation errors, make sure the entry will be unique
        .then((resultObj) => {
            // The validation promise was resolved, now use the validated
            // document in a new promise that checks for duplicates
            myLibs.checkForDuplicateDocs(resultObj, {
                    id: resultObj.id,
                    eventId: resultObj.eventId,
                    studentId: resultObj.studentId,
                    card: resultObj.card,
                    status: resultObj.status,
                    course: resultObj.course
                }, Result)
                // If the promise returns true, a duplicate result exists
                // The entry represents the return value for the second promise
                .then((entry) => {
                    if (entry) {
                        logger.info(`DUPLICATE - A duplicate result record was found`);
                        return res.status(200).json({
                            message: 'The result record already exists and does not need to be modified',
                            data: entry
                        });
                    } else {
                        // update the record in the db
                        Result.findByIdAndUpdate(resultObj.id, (err, doc) => {
                            if (err) {
                                logger.error('The result could not be updated');
                                res.json({
                                    message: 'There was a problem updating the result in the database.',
                                    data: doc
                                });
                            } else {
                                // The result has been modified and stored in the db
                                logger.info(`PUT updating the result record: ${doc}`);
                                res.json({
                                    message: 'The result was modified and stored in the database',
                                    data: doc
                                });
                            }
                        });
                    }
                });
        });

});

// Delete a result from the event
router.delete('/:id', (req, res) => {
    logger.debug(`In the Result '/' ... DELETE Method`);

    // Get the id of the result to delete
    const resultId = req.params.id;

    // Find and remove the result
    Result.findByIdAndRemove(resultId, (err, doc) => {
        if (err) {
            logger.error(err);
            return res.status(400).json({
                message: err.message,
                data: doc
            });
        } else {
            return res.status(200).json({
                message: 'The entry was successfully removed',
                data: doc
            });
        }
    });
});