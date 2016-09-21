const express = require('express');
const bodyParser = require('body-parser'); //parses information from POST
const logger = require('../logger');

const router = express.Router();

router.use(bodyParser.urlencoded({ extended: true }));

const Result = require('../models/results');

// define the home page route
// build the REST operations at the base for results
// this will be accessible from http://127.0.0.1:3000/results if the default
// route for / is left unchanged
router.route('/')
    //GET all results
    .get((req, res, next) => {
        //retrieve all results from Mongo
        Result.find({}, (err, results) => {
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
                            results
                        });
                    },
                    //JSON response will show all results in JSON format
                    json: () => {
                        res.json(results);
                    }
                });
            }
        });
    })
    .post((req, res) => {
        // TODO: Validate data in the request
        // Get values from POST request. These can be done through forms or
        // REST calls. These rely on the 'name'' attributes for forms
        const event = req.body.event;
        const course = req.body.course;
        const card = req.body.card;
        const student = req.body.student;
        const cn = req.body.cn;
        const time = req.body.time;
        //call the create function for our database
        Result.create({
            event,
            course,
            card,
            student,
            cn,
            time
        }, (err, result) => {
            if (err) {
                res.send('There was a problem adding the result to the database.');
                logger.error('The result could not be added to the database');
            } else {
                //result has been created
                logger.info(`POST creating new class: ${result}`);
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
                        res.json(result);
                    }
                });
            }
        });
    });


module.exports = router;
