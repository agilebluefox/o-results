const express = require('express');
const bodyParser = require('body-parser'); //parses information from POST
const logger = require('../logger');

const router = express.Router();

router.use(bodyParser.urlencoded({ extended: true }));

const Control = require('../models/controls');

// define the home page route
// build the REST operations at the base for controls
// this will be accessible from http://127.0.0.1:3000/controls if the default
// route for / is left unchanged
router.route('/')
    //GET all controls
    .get((req, res, next) => {
        //retrieve all controls from Mongo
        Control.find({}, (err, controls) => {
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
                            controls
                        });
                    },
                    //JSON response will show all controls in JSON format
                    json: () => {
                        res.json(controls);
                    }
                });
            }
        });
    })
    .post((req, res) => {
        // TODO: Validate data in the request
        // Get values from POST request. These can be done through forms or
        // REST calls. These rely on the 'name'' attributes for forms
        const number = req.body.number;
        const type = req.body.type;
        const points = req.body.points;
        //call the create function for our database
        Control.create({
            number,
            type,
            points
        }, (err, control) => {
            if (err) {
                res.send('There was a problem adding the control to the database.');
                logger.error('The control could not be added to the database');
            } else {
                //control has been created
                logger.info(`POST creating new class: ${control}`);
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
                        res.json(control);
                    }
                });
            }
        });
    });

module.exports = router;
