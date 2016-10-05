'use strict()';

const express = require('express');
const util = require('util');
const bodyParser = require('body-parser'); //parses information from POST
const validateControlDoc = require('../libs/custom-validators');
const logger = require('../libs/logger');
const Control = require('../models/controls');

const router = express.Router();
router.use(bodyParser.urlencoded({
    extended: true
}));

function checkDuplicateControl(entry) {
    logger.debug(`Checking for duplicate controls: ${util.inspect(entry)}`);
    Control.count({
        number: entry.number,
    }, (err, count) => {
        logger.debug(`The number of duplicate controls is: ${count}`);
        if (count > 0) {
            return true;
        }
    })
}

// define the home page route
// build the REST operations at the base for controls
// this will be accessible from http://127.0.0.1:3000/controls if the default
// route for / is left unchanged
router.route('/')
    //GET all controls
    .get((req, res) => {
        //retrieve all controls from Mongo
        Control.find({
            active: true
        }, (err, docs) => {
            if (err) {
                logger.error(err);
            } else {
                // respond to both HTML and JSON. JSON responses require
                // 'Accept: application/json;' in the Request Header
                res.format({
                    // HTML response will render the index.pug file in the
                    // views/controls folder. We are also setting 'controls''
                    // to be an accessible variable in our pug view
                    // html: () => {
                    //     res.render('controls/index', {
                    //         title: 'All my controls',
                    //         docs
                    //     });
                    // },
                    //JSON response will show all controls in JSON format
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
        const number = req.body.number || '';
        const type = req.body.type || '';
        const points = req.body.points || '';

        // Store the data in the request
        let required = {
            number: number,
            type: type,
            points: points
        }

        let optional = {
            active: active
        }

        // Validate the input and add the errors property
        let entry = validateControlDoc(required, optional);
        logger.info(entry);

        // Make sure the new document is not a duplicate of a current
        // document in the collection
        let duplicate = checkDuplicateControl(entry);

        if (entry.hasOwnProperty('errors') && entry.errors.length > 0) {
            logger.debug(`The entry has errors: ${util.inspect(entry)}`);
            return res.status(400).send('There have been validation errors: ' + util.inspect(entry.errors));
        } else if (duplicate) {
            logger.debug(`A duplicate control exists`);
            return res.status(400).send('This control already exists: ' + res.json(entry));
        } else {
            //call the create function for our database
            Control.create({
                active,
                number,
                type,
                points
            }, (err, doc) => {
                if (err) {
                    res.send('There was a problem adding the control to the database.');
                    logger.error('The control could not be added to the database');
                } else {
                    //control has been created
                    logger.info(`POST creating new class: ${doc}`);
                    res.format({
                        // HTML response will set the location and redirect back
                        // to the home page. You could also create a 'success'
                        // page if that's your thing
                        // html: () => {
                        //     // If it worked, set the header so the address bar
                        //     // doesn't still say /adduser
                        //     res.location('controls');
                        //     // And forward to success page
                        //     res.redirect('/controls');
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
        req.body.forEach((entry) => {
            logger.debug(entry);

            // Prevent null or undefined properties 
            const id = entry._id || '';
            const active = entry.active || 'true';
            const number = entry.number || '';
            const type = entry.type || '';
            const points = entry.points || '';

            // Store the data in the request
            let required = {
                number: number,
                type: type,
                points: points
            }

            let optional = {
                active: active
            }


            // Validate data in the request
            entry = validateControlDoc(required, optional);
            logger.info(entry);

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
                Control.findByIdAndUpdate(id, {
                    active,
                    number,
                    type,
                    points
                }, {
                    new: true
                }, (error, doc) => {
                    // If an error occurs while attempting the update 
                    // add the document to the fail array
                    if (error) {
                        logger.error(error);
                        failed.push(doc);
                        // When all of the documents have been evaluated
                        // respond with an object containing the list
                        // of failures and successes
                        if (updated.length + failed.length === length) {
                            let all = {
                                success: updated,
                                fail: failed
                            };
                            return res.status(201).json(all);
                        }
                    }
                    // Add the updated document to the success array
                    updated.push(doc);
                    // When all of the documents have been evaluated
                    // respond with an object containing the list
                    // of failures and successes
                    if (updated.length + failed.length === length) {
                        let all = {
                            success: updated,
                            fail: failed
                        };
                        return res.status(201).json(all);
                    }
                });
            }
        });
    })
    .delete((req, res) => {
        const id = req.body._id;
        Control.findByIdAndUpdate(id, {
            active: false
        }, {
            new: true
        }, (error, doc) => {
            if (error) {
                return res.status(500).json({
                    message: 'Could not delete the control'
                });
            }
            return res.status(201).json(doc);
        });
    });

module.exports = router;