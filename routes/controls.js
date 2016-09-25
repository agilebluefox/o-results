const express = require('express');
const bodyParser = require('body-parser'); //parses information from POST
const logger = require('../libs/logger');

const router = express.Router();

router.use(bodyParser.urlencoded({ extended: true }));

const Control = require('../models/controls');

// define the home page route
// build the REST operations at the base for controls
// this will be accessible from http://127.0.0.1:3000/controls if the default
// route for / is left unchanged
router.route('/')
    //GET all controls
    .get((req, res) => {
        //retrieve all controls from Mongo
        Control.find({ active: true }, (err, docs) => {
            if (err) {
                logger.error(err);
            } else {
                // respond to both HTML and JSON. JSON responses require
                // 'Accept: application/json;' in the Request Header
                res.format({
                    // HTML response will render the index.pug file in the
                    // views/controls folder. We are also setting 'controls''
                    // to be an accessible variable in our pug view
                    html: () => {
                        res.render('controls/index', {
                            title: 'All my controls',
                            docs
                        });
                    },
                    //JSON response will show all controls in JSON format
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
        const number = req.body.number;
        const type = req.body.type;
        const points = req.body.points;
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
                    html: () => {
                        // If it worked, set the header so the address bar
                        // doesn't still say /adduser
                        res.location('controls');
                        // And forward to success page
                        res.redirect('/controls');
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
        const number = req.body.number;
        const type = req.body.type;
        const points = req.body.points;
        // Update the document
        Control.findByIdAndUpdate(id, {
            active,
            number,
            type,
            points
        }, { new: true }, (error, doc) => {
            if (error) {
                    return res.status(500).json({
                        message: 'Could not update control'
                    });
                }
                return res.status(201).json(doc);
        });
    })
    .delete((req, res) => {
        const id = req.body._id;
        Control.findByIdAndUpdate(id, {
            active: false
        }, { new: true }, (error, doc) => {
            if (error) {
                    return res.status(500).json({
                        message: 'Could not delete the control'
                    });
                }
                return res.status(201).json(doc);
        });
    });

module.exports = router;
