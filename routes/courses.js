'use strict()';

const express = require('express');
const bodyParser = require('body-parser'); //parses information from POST
const util = require('util');
const nodeValidator = require('node-validator'); // Provides standard validation functions
const customValidator = require('../libs/custom-validators'); // additional validators 
const logger = require('../libs/logger'); // Provides logging functions
const myLibs = require('../libs/helpers'); // Common functions for app
const createCodename = require('../libs/codename');
const Course = require('../models/courses');

const router = express.Router();
router.use(bodyParser.urlencoded({
    extended: true
}));

// define the home page route
router.route('/')
    //GET all active documents
    .get((req, res) => {
        //retrieve all courses from Mongo that are active
        Course.find({
            active: true
        }, (err, courses) => {
            if (err) {
                logger.error(err);
            } else {
                // JSON responses require 'Accept: application/json;' in the Request Header
                res.format({
                    //JSON response will show all courses in JSON format
                    json: () => {
                        res.json(courses);
                    }
                });
            }
        });
    })
    .post((req, res) => {
        // Get values from POST request and assign to variables
        const active = req.body.active;
        const location = req.body.location;
        const name = req.body.name;
        const mapdate = req.body.mapdate;
        const codename = createCodename(name, mapdate);
        const type = req.body.type.toLowerCase();
        const inorder = req.body.inorder;
        const controls = req.body.controls;

        let doc = {
            active: active,
            location: location,
            name: name,
            mapdate: mapdate,
            codename: codename,
            type: type,
            inorder: inorder,
            controls: controls
        };

        // Validation rules for controls property
        const checkControl = nodeValidator.isObject()
            .withRequired('number', nodeValidator.isString({
                regex: /^[0-9]+$/
            }))
            .withRequired('type', customValidator.isIn({
                list: ['station', 'control', 'clear', 'finish', 'start']
            }))
            .withRequired('points', nodeValidator.isInteger({
                min: 0
            }));

        // Validation rules for the course document
        const checkCourse = nodeValidator.isObject()
            .withOptional('active', nodeValidator.isBoolean())
            .withRequired('location', customValidator.isIn({
                list: ['lake raleigh', 'lake johnson', 'schenck forest', 'umstead park']
            }))
            .withRequired('name', nodeValidator.isString({
                regex: /^[A-Za-z0-9 ]{1,50}$/
            }))
            .withRequired('mapdate', nodeValidator.isDate())
            .withRequired('codename', nodeValidator.isString({
                    // example: 'upnc2016109-2040''
                    regex: /^[a-zA-Z]{1,6}[0-9]{1,8}-[0-9]{4}$/
            }))
            .withRequired('type', customValidator.isIn({
                list: ['score', 'classic']
            }))
            .withRequired('inorder', nodeValidator.isBoolean())
            .withOptional('controls', nodeValidator.isArray(checkControl, {
                min: 1
            }));

        // Validate the input for the new document
        new Promise((resolve, reject) => {
                nodeValidator.run(checkCourse, doc, (errorCount, errors) => {
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
                        mapdate: doc.mapdate,
                        name: doc.name,
                        type: doc.type,
                        inorder: doc.inorder,
                        controls: doc.controls
                    }, Course)
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
                            Course.create({
                                location,
                                mapdate,
                                name,
                                codename: codename.toLowerCase(),
                                type,
                                inorder,
                                controls
                            }, (err, course) => {
                                if (err) {
                                    res.send('There was a problem adding the course to the database.');
                                    logger.error('The course could not be added to the database');
                                } else {
                                    //course has been created
                                    logger.info(`POST creating new class: ${course}`);
                                    res.format({
                                        // JSON response
                                        json: () => {
                                            res.json(course);
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
            const location = entry.location;
            const name = entry.name;
            const mapdate = entry.mapdate;
            const codename = createCodename(name, mapdate);
            const type = entry.type;
            const inorder = entry.inorder;
            const controls = entry.controls;

            let doc = {
                active: active,
                location: location,
                name: name,
                mapdate: mapdate,
                codename: codename,
                type: type,
                inorder: inorder,
                controls: controls
            };

            // Validation rules for controls property
            const checkControl = nodeValidator.isObject()
                .withRequired('number', nodeValidator.isString({
                    regex: /^[0-9]+$/
                }))
                .withRequired('type', customValidator.isIn({
                    list: ['station', 'control', 'clear', 'finish', 'start']
                }))
                .withRequired('points', nodeValidator.isInteger({
                    min: 0
                }));

            // Validation rules for the course document
            const checkCourse = nodeValidator.isObject()
                .withOptional('active', nodeValidator.isBoolean())
                .withRequired('location', customValidator.isIn({
                    list: ['lake raleigh', 'lake johnson', 'schenck forest', 'umstead park']
                }))
                .withRequired('name', nodeValidator.isString({
                    regex: /^[A-Za-z0-9 ]{1,50}$/
                }))
                .withRequired('mapdate', nodeValidator.isDate())
                .withRequired('codename', nodeValidator.isString({
                    // example: 'upnc2016109-2040''
                    regex: /^[a-z]{1,6}[0-9]{1,8}-[0-9]{4}$/
                }))
                .withRequired('type', customValidator.isIn({
                    list: ['score', 'classic']
                }))
                .withRequired('inorder', nodeValidator.isBoolean())
                .withOptional('controls', nodeValidator.isArray(checkControl, {
                    min: 1
                }))

            // Validate the input for the new document
            new Promise((resolve, reject) => {
                    nodeValidator.run(checkCourse, doc, (errorCount, errors) => {
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
                            mapdate: doc.mapdate,
                            name: doc.name,
                            type: doc.type,
                            inorder: doc.inorder,
                            controls: doc.controls
                        }, Course)
                        // If the promise returns true, a duplicate control exists
                        .then((entry) => {
                            if (entry) {
                                logger.info(`DUPLICATE - A duplicate control was found`);
                                doc.errors = [{
                                    message: "An identical document already exists in the collection."
                                }];
                                logger.debug(`FAILED - The entry failed to update: ${util.inspect(doc)}`);
                                failed.push(doc);
                                checkIfDone();
                            } else {
                                // Make changes to the property and send the entire object
                                Course.findByIdAndUpdate(id, {
                                    active,
                                    location,
                                    mapdate,
                                    name,
                                    codename: codename.toLowerCase(),
                                    type,
                                    inorder,
                                    controls
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
        Course.findByIdAndUpdate(id, {
            active: false
        }, {
            new: true
        }, (error, doc) => {
            if (error) {
                return res.status(500).json({
                    message: 'Could not delete the course'
                });
            }
            return res.status(201).json(doc);
        });
    });

module.exports = router;