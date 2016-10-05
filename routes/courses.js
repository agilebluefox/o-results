'use strict()';

const express = require('express');
const bodyParser = require('body-parser'); //parses information from POST
const util = require('util');
const validateCourseDoc = require('../libs/custom-validators');
const logger = require('../libs/logger');
const createCodename = require('../libs/codename');
const Course = require('../models/courses');

const router = express.Router();
router.use(bodyParser.urlencoded({
    extended: true
}));

function checkDuplicateCourse(entry) {
    logger.debug(`Checking for duplicate courses: ${util.inspect(entry)}`);
    Course.count({
        location: entry.location,
        mapdate: entry.mapdate,
        name: entry.name,
        type: entry.type,
        inorder: entry.inorder,
        controls: entry.controls
    }, (err, count) => {
        logger.debug(`The number of duplicate courses is: ${count}`);
        if (count > 0) {
            return true;
        }
    })
}

// define the home page route
// build the REST operations at the base for courses
// this will be accessible from http://127.0.0.1:3000/courses if the default
// route for / is left unchanged
router.route('/')
    //GET all courses
    .get((req, res) => {
        //retrieve all courses from Mongo
        Course.find({
            active: true
        }, (err, courses) => {
            if (err) {
                logger.error(err);
            } else {
                // respond to both HTML and JSON. JSON responses require
                // 'Accept: application/json;' in the Request Header
                res.format({
                    // HTML response will render the index.pug file in the
                    // views/courses folder. We are also setting 'courses''
                    // to be an accessible variable in our pug view
                    // html: () => {
                    //     res.render('courses/index', {
                    //         title: 'All my courses',
                    //         courses
                    //     });
                    // },
                    //JSON response will show all courses in JSON format
                    json: () => {
                        res.json(courses);
                    }
                });
            }
        });
    })
    .post((req, res) => {
        // Get values from POST request. These can be done through forms or
        // REST calls. These rely on the 'name'' attributes for forms
        const active = req.body.active || true;
        const location = req.body.location || '';
        const name = req.body.name || '';
        const mapdate = req.body.mapdate || '';
        const codename = createCodename(name, mapdate) || '';
        const type = req.body.type || '';
        const inorder = req.body.inorder || 'true';
        const controls = req.body.controls || [];

        let required = {
            location: location,
            name: name,
            mapdate: mapdate,
            codename: codename,
            type: type,
            inorder: inorder
        };

        let optional = {
            active: active,
            controls: controls
        }

        // Validate the input and add the errors property
        let entry = validateCourseDoc(required, optional);

        // Make sure the new document is not a duplicate of a current
        // document in the collection
        let duplicate = checkDuplicateCourse(entry);

        if (entry.hasOwnProperty('errors') && entry.errors.length > 0) {
            logger.debug(`The entry has errors: ${util.inspect(entry)}`);
            return res.status(400).send('There have been validation errors: ' + util.inspect(entry.errors));
        } else if (duplicate) {
            logger.debug(`A duplicate course exists`);
            return res.status(400).send('This course already exists: ' + res.json(entry));
        } else {
            //call the create function for our database
            Course.create({
                location,
                mapdate,
                name,
                codename,
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
                        // HTML response will set the location and redirect back
                        // to the home page. You could also create a 'success'
                        // page if that's your thing
                        html: () => {
                            // If it worked, set the header so the address bar
                            // doesn't still say /adduser
                            res.location('courses');
                            // And forward to success page
                            res.redirect('/courses');
                        },
                        // JSON response will show the newly created class
                        json: () => {
                            res.json(course);
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

            // Prevent null or undefined properties
            const id = value._id || '';
            const active = value.active || true;
            const location = value.location || '';
            const name = value.name || '';
            const mapdate = value.mapdate || '';
            const codename = createCodename(name, mapdate) || '';
            const type = value.type || '';
            const inorder = value.inorder || true;
            const controls = value.controls || [];

            // Build the object
            let required = {
                id: id,
                location: location,
                name: name,
                mapdate: mapdate,
                codename: codename,
                type: type,
                inorder: inorder
            };

            let optional = {
                active: active,
                controls: controls
            }

            // Validate the input and add the errors property
            let entry = validateCourseDoc(required, optional);

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

                // Make changes to the property and send the entire object
                Course.findByIdAndUpdate(id, {
                    active,
                    location,
                    mapdate,
                    name,
                    codename,
                    type,
                    inorder,
                    controls
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