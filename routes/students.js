'use strict()';

const express = require('express');
const util = require('util');
const bodyParser = require('body-parser'); //parses information from POST
const nodeValidator = require('node-validator'); // Provides standard validation functions
const customValidator = require('../libs/custom-validators'); // additional validators 
const logger = require('../libs/logger'); // Provides logging functions
const myLibs = require('../libs/helpers'); // Common functions for app
const Student = require('../models/students'); // Mongoose model

const router = express.Router();
router.use(bodyParser.urlencoded({
    extended: true
}));

// Get student using either the mongo or unity id
router.get('/:id', (req, res) => {
    logger.debug(`In the Student '/:id' ... GET Method`);
    let id = req.params.id;
    if (id.match(/.{23}/)) {
        // Get student by mongo id
        logger.debug(`The mongo id is: ${id}`);
        Student.findById(id, (err, student) => {
            if (err) {
                return res.status(500).json({
                    message: 'An error occurred retrieving the document'
                });
            }
            return res.status(200).json({
                message: 'The student was successfully retrieved',
                data: student
            });
        });
        // Get the student by unityid
    } else if (id.match(/.{1,8}/)) {
        logger.debug(`The unity id is: ${id}`);
        Student.findOne({
            unityid: id
        }, (err, student) => {
            if (err) {
                return res.status(500).json({
                    message: 'An error occurred retrieving the document'
                });
            }
            return res.status(200).json({
                message: 'The student was successfully retrieved',
                data: student
            });
        });
    } else {
        return res.status(500).json({
            message: 'An error occurred retrieving the document'
        });
    }
});

//GET all students
router.get('/', (req, res) => {
    logger.debug(`In the Student '/' ... GET Method`);
    //retrieve all students from Mongo
    Student.find({
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

router.post('/', (req, res) => {
    logger.debug(`In the Student route '/'... POST Method`);
    // Get values from POST request and assign to variables
    const active = req.body.active || true;
    const unityid = req.body.unityid;
    const email = req.body.email;
    const firstname = req.body.firstname;
    const lastname = req.body.lastname;

    // The data needed for the new document
    let doc = {
        active: active,
        unityid: unityid,
        email: email,
        firstname: firstname,
        lastname: lastname
    };

    // Validation rules for the student document
    const checkStudent = nodeValidator.isObject()
        .withOptional('active', nodeValidator.isBoolean())
        .withRequired('unityid', nodeValidator.isString({
            regex: /^[a-z][a-z0-9]{1,7}$/
        }))
        .withRequired('email', customValidator.isEmail())
        .withRequired('firstname', nodeValidator.isString())
        .withRequired('lastname', nodeValidator.isString());

    // Validate the input for the new document
    new Promise((resolve, reject) => {
            nodeValidator.run(checkStudent, doc, (errorCount, errors) => {
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
                    email: doc.email
                }, Student)
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
                        Student.create({
                            active,
                            unityid: unityid.toLowerCase(),
                            email: email.toLowerCase(),
                            firstname,
                            lastname
                        }, (err, doc) => {
                            if (err) {
                                res.send('There was a problem adding the student to the database.');
                                logger.error('The student could not be added to the database');
                            } else {
                                // Student has been created
                                logger.info(`POST creating new student: ${doc}`);
                                res.format({
                                    // JSON response will show the newly created document
                                    json: () => {
                                        res.json({
                                            message: 'The student was added to the database',
                                            data: doc
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
        });
});

router.put('/', (req, res) => {
    logger.debug(`In the Student route '/' ... PUT Method`);
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
        const unityid = entry.unityid;
        const email = entry.email;
        const firstname = entry.firstname;
        const lastname = entry.lastname;

        let doc = {
            id: id,
            active: active,
            unityid: unityid,
            email: email,
            firstname: firstname,
            lastname: lastname
        };

        // Validation rules for the student document
        const checkStudent = nodeValidator.isObject()
            .withRequired('id', customValidator.isMongoId())
            .withOptional('active', nodeValidator.isBoolean())
            .withRequired('unityid', nodeValidator.isString({
                regex: /^[a-z][a-z0-9]{1,7}$/
            }))
            .withRequired('email', customValidator.isEmail())
            .withRequired('firstname', nodeValidator.isString())
            .withRequired('lastname', nodeValidator.isString());

        // Validate the input for the new document
        new Promise((resolve, reject) => {
                nodeValidator.run(checkStudent, doc, (errorCount, errors) => {
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
                    email: doc.email.toLowerCase(),
                    unityid: doc.unityid.toLowerCase(),
                    firstname: doc.firstname,
                    lastname: doc.lastname
                }, Student).then((entry) => {
                    if (entry) {
                        logger.info(`DUPLICATE - A duplicate student was found`);
                        doc.errors = [{
                            message: "An identical student already exists in the collection."
                        }];
                        logger.debug(`FAILED - The entry failed to update: ${util.inspect(doc)}`);
                        failed.push(doc);
                        checkIfDone();
                    } else {
                        // Update the student
                        Student.findByIdAndUpdate(id, {
                            active,
                            unityid,
                            email,
                            firstname,
                            lastname
                        }, {
                            new: true
                        }, (error, doc) => {
                            // If an error occurs while attempting the update 
                            // add the student to the fail array
                            if (error) {
                                logger.error(error);
                                logger.info(`FAILED - The student was not updated.`);
                                logger.debug(`FAILED - The student failed to update: ${util.inspect(doc)}`);
                                failed.push(doc);
                                checkIfDone();
                            }
                            // Add the updated student to the success array
                            logger.info(`UPDATED - The student was updated.`);
                            logger.debug(`UPDATED - The student was updated: ${util.inspect(doc)}`);
                            passed.push(doc);
                            checkIfDone();
                        });
                    }
                });
            })
            // If the initial promise is rejected, add the document to the failed array
            .catch((doc) => {
                logger.debug(`FAILED - The student failed to update: ${util.inspect(doc)}`);
                failed.push(doc);
                checkIfDone();
            })
    });
});

router.delete('/', (req, res) => {
    logger.debug(`In the Student route '/'... DELETE method`);
    const id = req.body.id;
    logger.debug(`The id of the student to remove is: ${id}`);
    Student.findByIdAndRemove(id, (error, doc) => {
        if (error) {
            return res.status(500).json({
                message: 'Could not remove the student from the database',
                data: doc
            });
        }
        return res.status(201).json({
            message: 'The student was removed from the database',
            data: doc
        });
    });
});

module.exports = router;