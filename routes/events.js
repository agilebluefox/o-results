'use strict()';

const express = require('express');
const logger = require('../libs/logger');
const util = require('util');
const bodyParser = require('body-parser');
const validateEventDoc = require('../libs/custom-validators');
const Event = require('../models/events');

const router = express.Router();
router.use(bodyParser.urlencoded({
    extended: true
}));

function checkDuplicateEvent(entry) {
    logger.debug(`Checking for duplicate events: ${util.inspect(entry)}`);
    Event.count({
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
// build the REST operations at the base for events
// this will be accessible from http://127.0.0.1:3000/events if the default
// route for / is left unchanged
router.route('/')
    //GET all events
    .get((req, res) => {
        //retrieve all events from Mongo
        Event.find({
                active: true
            })
            .populate('courses')
            .populate('classes')
            .exec((err, docs) => {
                if (err) {
                    logger.error(err);
                } else {
                    // respond to both HTML and JSON. JSON responses require
                    // 'Accept: application/json;' in the Request Header
                    res.format({
                        // HTML response will render the index.pug file in the
                        // views/events folder. We are also setting 'events''
                        // to be an accessible variable in our pug view
                        // html: () => {
                        //     res.render('events/index', {
                        //         title: 'All my events',
                        //         docs
                        //     });
                        // },
                        //JSON response will show all events in JSON format
                        json: () => {
                            res.json(docs);
                        }
                    });
                }
            });
    })
    .post((req, res) => {
        // Get values from POST request.
        const active = req.body.active || true;
        const location = req.body.location || '';
        const name = req.body.name || '';
        const date = req.body.date || '';
        const courses = req.body.courses || [];
        const classes = req.body.classes || [];

        // Store the data in the request
        let required = {
            location: location,
            name: name,
            date: date
        };

        let optional = {
            active: active,
            courses: courses,
            classes: classes
        }

        // Validate the input and add the errors property
        let entry = validateEventDoc(required, optional);

        // Make sure the new document is not a duplicate of a current
        // document in the collection
        let duplicate = checkDuplicateEvent(entry);

        if (entry.hasOwnProperty('errors') && entry.errors.length > 0) {
            logger.debug(`The entry has errors: ${util.inspect(entry)}`);
            return res.status(400).send('There have been validation errors: ' + util.inspect(entry.errors));
        } else if (duplicate) {
            logger.debug(`A duplicate event exists`);
            return res.status(400).send('This event already exists: ' + res.json(entry));
        } else {
            //call the create function for our database
            Event.create({
                active,
                location,
                name,
                date,
                courses,
                classes
            }, (err, doc) => {

                if (err) {
                    res.send('There was a problem adding the information to the database.');
                } else {
                    //event has been created
                    logger.info(`POST creating new class: ${doc}`);
                    res.format({
                        // HTML response will set the location and redirect back
                        // to the home page. You could also create a 'success'
                        // page if that's your thing
                        // html: () => {
                        //     // If it worked, set the header so the address bar
                        //     // doesn't still say /adduser
                        //     res.location('events');
                        //     // And forward to success page
                        //     res.redirect('/events');
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
            // Prevent null and undefined values
            const id = value._id || '';
            const active = value.active || true;
            const location = value.location || '';
            const name = value.name || '';
            const date = value.date || '';
            const courses = value.courses || [];
            const classes = value.classes || [];

            // Store the data in the request
            let required = {
                id: id,
                location: location,
                name: name,
                date: date
            };

            let optional = {
                active: active,
                courses: courses,
                classes: classes
            }

            // Validate the input and add the errors property
            let entry = validateEventDoc(required, optional);

            // Make sure the new document is not a duplicate of a current
            // document in the collection
            let duplicate = checkDuplicateEvent(entry);

            if (entry.hasOwnProperty('errors') && entry.errors.length > 0) {
                logger.debug(`The entry has errors: ${util.inspect(entry)}`);
                return res.status(400).send('There have been validation errors: ' + util.inspect(entry.errors));
            } else if (duplicate) {
                logger.debug(`A duplicate event exists`);
                return res.status(400).send('This event already exists: ' + res.json(entry));
            } else {

                // Make changes to the modified properties and send the object
                Event.findByIdAndUpdate(id, {
                    active,
                    location,
                    name,
                    date,
                    courses,
                    classes
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
        Event.findByIdAndUpdate(id, {
            active: false
        }, {
            new: true
        }, (error, doc) => {
            if (error) {
                return res.status(500).json({
                    message: 'Could not delete the event'
                });
            }
            return res.status(201).json(doc);
        });
    });

module.exports = router;