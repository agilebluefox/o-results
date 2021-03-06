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

// define the home page route
router.route('/')
    .get((req, res) => {
        logger.debug('In the Event route ... GET Method');
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
                        events: docs
                    });
                }
            });
    })
    .post((req, res) => {
        logger.debug('In the Event route ... POST Method');
        // Get values from POST request.
        const active = req.body.active || true;
        const location = req.body.location;
        const name = req.body.name;
        const date = req.body.date;
        const courses = req.body.courses || [];
        const classes = req.body.classes || [];
        const students = req.body.students || [];
        // Store the data in the request
        let doc = {
            active: active,
            location: location,
            name: name,
            date: date,
            courses: courses,
            classes: classes,
            students: students
        };

// Get API to return a single event
router.get('/:id', (req, res) => {
    logger.debug(`In the Event '/:id' ... GET Method`);

    // Get the id from the request body
    const id = req.params.id;
    logger.debug(`The event id parameter is ${id}`);

    // Find that event in the database
    Event.findById(id)
        .populate('results.student')
        .exec((err, doc) => {
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
        .populate('results.student')
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
    const results = req.body.results || [];

     let resultsWithStudentIds = results.map((result) => {
        let student = result.student;
        result.student = student._id;
        return result;
    });

<<<<<<< HEAD
            // Validation rules for the courses property
            const checkCourse = customValidator.isMongoId();

            // Validation rules for the classes property
            const checkClass = customValidator.isMongoId();

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
                .withOptional('courses', nodeValidator.isArray(checkCourse))
                .withOptional('classes', nodeValidator.isArray(checkClass))
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
                        }
                        // courses: doc.courses,
                        // classes: doc.classes,
                        // students: doc.students
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
                                classes,
                                students
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
        logger.debug('In the Event route ... DELETE Method');
        const id = req.body.id;
        Event.findByIdAndUpdate(id, {
            active: false
        }, {
            new: true
        }, (error, doc) => {
            if (error) {
                return res.status(500).json({
                    message: 'Could not delete the event'
=======
    // Store the data in the request
    let doc = {
        active,
        location,
        name,
        date,
        results: resultsWithStudentIds
    };

    // // Validation rules for the students property
    // const checkStudent = nodeValidator.isObject()
    //     .withRequired('_id', customValidator.isMongoId());

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
        .withOptional('results', nodeValidator.isArray());

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
                    results: doc.results
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
                            results
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
>>>>>>> 985ae825fbf3596f4369953d68a521d9d837102b
                });
        });
});

// Put API to update one or more events
router.put('/', (req, res) => {
    logger.debug('In the Event route ... PUT Method');

    // Get the event to update
    logger.debug(`The event to update is: ${util.inspect(req.body)}`);

    // Store the properties in variables
    const id = req.body._id;
    const active = req.body.active || true;
    const location = req.body.location;
    const name = req.body.name;
    const date = req.body.date;
    const results = req.body.results || [];

    let resultsWithStudentIds = results.map((result) => {
        let student = result.student;
        logger.debug(`The student is: `, student);
        result.student = student._id;
        logger.debug(`The student id to store in the db is: ${result.student}`);
        return result;
    });

    // Store the data in the request
    let doc = {
        id,
        active,
        location,
        name,
        date,
        results: resultsWithStudentIds
    };

    function getDoc(id) {
        // Find that event in the database
        let p = new Promise((resolve, reject) => {
            Event.findById(id)
                .populate('results.student')
                .exec((err, doc) => {
                    if (err) {
                        logger.error(err);
                        reject(err);
                    } else {
                        logger.debug(`Here is the event document found: ${doc}`);
                        resolve(doc);
                    }
                });
        })
        return p;
    }

    logger.debug(`This is the event to update - `, doc);
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
        .withOptional('results', nodeValidator.isArray());

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
                    return res.status(500).json({
                        message: doc.errors,
                        data: doc
                    });
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
                    results: doc.results
                }, Event)
                .then((entry) => {
                    if (entry) {
                        logger.info(`DUPLICATE - A duplicate event was found`);
                        doc.error = [{
                            message: "An identical event already exists in the collection."
                        }];
                        logger.debug(`FAILED - The entry failed to update: ${util.inspect(doc)}`);
                        getDoc(doc.id).then((doc) => {
                                return res.status(201).json({
                                    message: 'An identical event exists in the collection.',
                                    data: doc
                                });
                            });
                    } else {
                        // Make changes to the modified properties and send the object
                        Event.findByIdAndUpdate(id, {
                            active,
                            location,
                            name,
                            date,
                            results
                        }, {
                            new: true
                        }, (error, doc) => {
                            // If an error occurs while attempting the update 
                            // add the event to the failed array
                            if (error) {
                                logger.error(error);
                                logger.info(`FAILED - The event was not updated.`);
                                logger.debug(`FAILED - The event failed to update: ${util.inspect(doc)}`);
                                return res.status(500).json({
                                    message: doc.error,
                                    data: doc
                                });
                            }
                            // Add the updated event to the success array
                            logger.info(`UPDATED - The event was updated.`);
                            logger.debug(`UPDATED - The event was updated: ${util.inspect(doc)}`);
                            getDoc(doc.id).then((doc) => {
                                return res.status(201).json({
                                    message: 'The event was updated',
                                    data: doc
                                });
                            });
                        });
                    }
                });
        })
        // If the initial promise is rejected return an error
        .catch((doc) => {
            logger.debug(`FAILED - The entry failed to update: ${util.inspect(doc)}`);
            doc.error = 'The doc was not updated';
            return res.status(500).json({
                message: doc.error,
                data: doc
            });
        })
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
        res.status(200).json({
            message: 'The event was removed from the database',
            data: doc
        });
    });
});

module.exports = router;