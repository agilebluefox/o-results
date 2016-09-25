const express = require('express');
const bodyParser = require('body-parser'); //parses information from POST
const logger = require('../libs/logger');

const router = express.Router();

router.use(bodyParser.urlencoded({ extended: true }));

const Result = require('../models/results');

// define the home page route
// build the REST operations at the base for results
// this will be accessible from http://127.0.0.1:3000/results if the default
// route for / is left unchanged
router.route('/')
    //GET all results
    .get((req, res) => {
        //retrieve all results from Mongo
        Result.find({ active: true }, (err, docs) => {
            if (err) {
                logger.error(err);
            } else {
                // respond to both HTML and JSON. JSON responses require
                // 'Accept: application/json;' in the Request Header
                res.format({
                    // HTML response will render the index.pug file in the
                    // views/results folder. We are also setting 'results''
                    // to be an accessible variable in our pug view
                    html: () => {
                        res.render('results/index', {
                            title: 'All my results',
                            docs
                        });
                    },
                    //JSON response will show all results in JSON format
                    json: () => {
                        res.json(docs);
                    }
                });
            }
        });
    })
    .post((req, res) => {
        // TODO: Validate data in the request
        // Get values from POST request. These can be done through forms or
        // REST calls. These rely on the 'name'' attributes for forms
        const active = req.body.active;
        const event = req.body.event;
        const course = req.body.course;
        const card = req.body.card;
        const student = req.body.student;
        const cn = req.body.cn;
        const time = req.body.time;
        //call the create function for our database
        Result.create({
            active,
            event,
            course,
            card,
            student,
            cn,
            time
        }, (err, doc) => {
            if (err) {
                res.send('There was a problem adding the result to the database.');
                logger.error('The result could not be added to the database');
            } else {
                //result has been created
                logger.info(`POST creating new class: ${doc}`);
                res.format({
                    // HTML response will set the location and redirect back
                    // to the home page. You could also create a 'success'
                    // page if that's your thing
                    html: () => {
                        // If it worked, set the header so the address bar
                        // doesn't still say /adduser
                        res.location('results');
                        // And forward to success page
                        res.redirect('/results');
                    },
                    // JSON response will show the newly created class
                    json: () => {
                        res.json(doc);
                    }
                });
            }
        });
    })
    .put((req, res) => {
        const id = req.body._id;
        const active = req.body.active;
        const event = req.body.event;
        const course = req.body.course;
        const card = req.body.card;
        const student = req.body.student;
        const cn = req.body.cn;
        const time = req.body.time;
        // Update the document
        Result.findByIdAndUpdate(id, {
            active,
            event,
            course,
            card,
            student,
            cn,
            time
        }, { new: true }, (error, doc) => {
            if (error) {
                    return res.status(500).json({
                        message: 'Could not update results'
                    });
                }
                return res.status(201).json(doc);
        });
    })
    .delete((req, res) => {
        const id = req.body._id;
        Result.findByIdAndUpdate(id, {
            active: false
        }, { new: true }, (error, doc) => {
            if (error) {
                    return res.status(500).json({
                        message: 'Could not delete the result'
                    });
                }
                return res.status(201).json(doc);
        });
    });

module.exports = router;
