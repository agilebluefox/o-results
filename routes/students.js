'use strict()';

const express = require('express');
const util = require('util');
const bodyParser = require('body-parser'); //parses information from POST
const validateStudentDoc = require('../libs/custom-validators');
const logger = require('../libs/logger');
const Student = require('../models/students');

const router = express.Router();
router.use(bodyParser.urlencoded({
    extended: true
}));

function checkDuplicateStudent(entry) {
    logger.debug(`Checking for duplicate students: ${util.inspect(entry)}`);
    Student.count({
        location: entry.location,
        name: entry.name,
        date: entry.date
    }, (err, count) => {
        logger.debug(`The number of duplicate events is: ${count}`);
        if (count > 0) {
            return true;
        }
    })
}

// define the home page route
// build the REST operations at the base for students
// this will be accessible from http://127.0.0.1:3000/students if the default
// route for / is left unchanged
router.route('/')
    //GET all students
    .get((req, res) => {
        //retrieve all students from Mongo
        Student.find({
                active: true
            })
            .populate('class')
            .exec((err, docs) => {
                if (err) {
                    logger.error(err);
                } else {
                    // respond to both HTML and JSON. JSON responses require
                    // 'Accept: application/json;' in the Request Header
                    res.format({
                        // HTML response will render the index.pug file in the
                        // views/students folder. We are also setting 'students''
                        // to be an accessible variable in our pug view
                        html: () => {
                            res.render('students/index', {
                                title: 'All my students',
                                docs
                            });
                        },
                        //JSON response will show all students in JSON format
                        json: () => {
                            res.json(docs);
                        }
                    });
                }
            });
    })
    .post((req, res) => {
        // Get values from POST request. These can be done through forms or
        // REST calls. These rely on the 'name'' attributes for forms
        const active = req.body.active || true;
        const unityid = req.body.unityid || '';
        const email = req.body.email || '';
        const firstname = req.body.firstname || '';
        const lastname = req.body.lastname || '';
        const sex = req.body.sex || '';
        const cls = req.body.class || [];

        let required = {
            unityid: unityid,
            email: email,
            firstname: firstname,
            lastname: lastname,
            sex: sex,
            class: cls
        };

        let optional = {
            active: active
        }

        // Validate the input and add the errors property
        let entry = validateStudentDoc(required, optional);

        // Make sure the new document is not a duplicate of a current
        // document in the collection
        let duplicate = checkDuplicateStudent(entry);

        if (entry.hasOwnProperty('errors') && entry.errors.length > 0) {
            logger.debug(`The entry has errors: ${util.inspect(entry)}`);
            return res.status(400).send('There have been validation errors: ' + util.inspect(entry.errors));
        } else if (duplicate) {
            logger.debug(`A duplicate student exists`);
            return res.status(400).send('This student already exists: ' + res.json(entry));
        } else {

            //call the create function for our database
            Student.create({
                active,
                unityid,
                email,
                firstname,
                lastname,
                sex,
                class: cls
            }, (err, doc) => {
                if (err) {
                    res.send('There was a problem adding the student to the database.');
                    logger.error('The student could not be added to the database');
                } else {
                    //student has been created
                    logger.info(`POST creating new class: ${doc}`);
                    res.format({
                        // HTML response will set the location and redirect back
                        // to the home page. You could also create a 'success'
                        // page if that's your thing
                        // html: () => {
                        //     // If it worked, set the header so the address bar
                        //     // doesn't still say /adduser
                        //     res.location('students');
                        //     // And forward to success page
                        //     res.redirect('/students');
                        // },
                        // JSON response will show the newly created class
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
        req.body.forEach((value) => {
            // Prevent null and undefned values
            const id = value._id || '';
            const active = value.active || true;
            const unityid = value.unityid || '';
            const email = value.email || '';
            const firstname = value.firstname || '';
            const lastname = value.lastname || '';
            const sex = value.sex || '';
            const cls = value.class || [];

            let required = {
                unityid: unityid,
                email: email,
                firstname: firstname,
                lastname: lastname,
                sex: sex,
                class: cls
            };

            let optional = {
                active: active
            }

            // Validate the input and add the errors property
            let entry = validateStudentDoc(required, optional);

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

                // Update the document
                Student.findByIdAndUpdate(id, {
                    active,
                    unityid,
                    email,
                    firstname,
                    lastname,
                    sex,
                    class: cls
                }, {
                    new: true
                }, (error, doc) => {
                    if (error) {
                        logger.error(error);
                        failed.push(doc);
                        if (updated.length + failed.length === length) {
                            let all = {
                                success: updated,
                                fail: failed,
                                errors: failed.length > 0
                            };
                            return res.status(201).json(all);
                        }
                    }
                    updated.push(doc);
                    if (updated.length + failed.length === length) {
                        let all = {
                            success: updated,
                            fail: failed,
                            errors: failed.length > 0
                        };
                        return res.status(201).json(all);
                    }
                });
            }
        });
    })
    .delete((req, res) => {
        const id = req.body._id;
        Student.findByIdAndUpdate(id, {
            active: false
        }, {
            new: true
        }, (error, doc) => {
            if (error) {
                return res.status(500).json({
                    message: 'Could not delete the student'
                });
            }
            return res.status(201).json(doc);
        });
    });

module.exports = router;