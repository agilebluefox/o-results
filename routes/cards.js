'use strict()';

const express = require('express');
const util = require('util');
const bodyParser = require('body-parser'); //parses information from POST
const validateCardDoc = require('../libs/custom-validators');
const logger = require('../libs/logger');
const Card = require('../models/cards');

const router = express.Router();
router.use(bodyParser.urlencoded({
    extended: true
}));

function checkDuplicateCard(entry) {
    logger.debug(`Checking for duplicate cards: ${util.inspect(entry)}`);
    Card.count({
        number: entry.number,
    }, (err, count) => {
        logger.debug(`The number of duplicate cards is: ${count}`);
        if (count > 0) {
            return true;
        }
    })
}

// define the home page route
// build the REST operations at the base for cards
// this will be accessible from http://127.0.0.1:3000/cards if the default
// route for / is left unchanged
router.route('/')
    //GET all cards
    .get((req, res) => {
        //retrieve all cards from Mongo
        Card.find({
            active: true
        }, (err, docs) => {
            if (err) {
                logger.error(err);
            } else {
                // respond to both HTML and JSON. JSON responses require
                // 'Accept: application/json;' in the Request Header
                res.format({
                    // HTML response will render the index.pug file in the
                    // views/cards folder. We are also setting 'cards''
                    // to be an accessible variable in our pug view
                    // html: () => {
                    //     res.render('cards/index', {
                    //         title: 'All my cards',
                    //         docs
                    //     });
                    // },
                    //JSON response will show all cards in JSON format
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

        // Validate data in the request
        let required = {
            number: number
        };

        let optional = {
            active: active

        };
        logger.info(entry);

        // Validate the input and add the errors property
        let entry = validateCardDoc(required, optional);

        // Make sure the new document is not a duplicate of a current
        // document in the collection
        let duplicate = checkDuplicateCard(entry);

        if (entry.hasOwnProperty('errors') && entry.errors.length > 0) {
            logger.debug(`The entry has errors: ${util.inspect(entry)}`);
            return res.status(400).send('There have been validation errors: ' + util.inspect(entry.errors));
        } else if (duplicate) {
            logger.debug(`A duplicate card exists`);
            return res.status(400).send('This card already exists: ' + res.json(entry));
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
                        // HTML response will set the location and redirect back
                        // to the home page. You could also create a 'success'
                        // page if that's your thing
                        // html: () => {
                        //     // If it worked, set the header so the address bar
                        //     // doesn't still say /adduser
                        //     res.location('cards');
                        //     // And forward to success page
                        //     res.redirect('/cards');
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
            // Prevent null or undefined properties 
            const id = req.body._id || '';
            const active = req.body.active || true;
            const number = req.body.number || '';

            entry = {
                id: id,
                active: active,
                number: number
            };

            // Validate data in the request
            entry = validateCardDoc(entry);
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