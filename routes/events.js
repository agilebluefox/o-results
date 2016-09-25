const express = require('express');
const bodyParser = require('body-parser'); //parses information from POST
const logger = require('../libs/logger');

const router = express.Router();

router.use(bodyParser.urlencoded({ extended: true }));

const Event = require('../models/events');

// define the home page route
// build the REST operations at the base for events
// this will be accessible from http://127.0.0.1:3000/events if the default
// route for / is left unchanged
router.route('/')
    //GET all events
    .get((req, res) => {
        //retrieve all events from Mongo
        Event.find({ active: true }, (err, docs) => {
            if (err) {
                logger.error(err);
            } else {
                // respond to both HTML and JSON. JSON responses require
                // 'Accept: application/json;' in the Request Header
                res.format({
                    // HTML response will render the index.pug file in the
                    // views/events folder. We are also setting 'events''
                    // to be an accessible variable in our pug view
                    html: () => {
                        res.render('events/index', {
                            title: 'All my events',
                            docs
                        });
                    },
                    //JSON response will show all events in JSON format
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
        const location = req.body.location;
        const name = req.body.name;
        const date = req.body.date;
        const courses = req.body.courses;
        const classes = req.body.classes;
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
                    html: () => {
                        // If it worked, set the header so the address bar
                        // doesn't still say /adduser
                        res.location('events');
                        // And forward to success page
                        res.redirect('/events');
                    },
                    // JSON response will show the newly created class
                    json: () => {
                        res.json(doc);
                    }
                });
            }
        });
    })
    .delete((req, res) => {
        const id = req.body._id;
        Event.findByIdAndUpdate(id, {
            active: false
        }, { new: true }, (error, doc) => {
            if (error) {
                    return res.status(500).json({
                        message: 'Could not delete the event'
                    });
                }
                return res.status(201).json(doc);
        });
    });

module.exports = router;
