'use strict()';

const express = require('express');
const bodyParser = require('body-parser'); //parses information from POST
const logger = require('../logger');

const router = express.Router();

router.use(bodyParser.urlencoded({ extended: true }));

const Card = require('../models/cards');

// define the home page route
// build the REST operations at the base for cards
// this will be accessible from http://127.0.0.1:3000/cards if the default
// route for / is left unchanged
router.route('/')
    //GET all cards
    .get((req, res, next) => {
        //retrieve all cards from Mongo
        Card.find({}, (err, cards) => {
            if (err) {
                logger.error(err);
            } else {
                // respond to both HTML and JSON. JSON responses require
                // 'Accept: application/json;' in the Request Header
                res.format({
                    // HTML response will render the index.pug file in the
                    // views/cards folder. We are also setting 'cards''
                    // to be an accessible variable in our pug view
                    html: () => {
                        res.render('cards/index', {
                            title: 'All my cards',
                            cards
                        });
                    },
                    //JSON response will show all cards in JSON format
                    json: () => {
                        res.json(cards);
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
        //call the create function for our database
        Card.create({
            number
        }, (err, card) => {
            if (err) {
                res.send('There was a problem adding the card to the database.');
                logger.error('The card could not be added to the database');
            } else {
                //Card has been created
                logger.info(`POST creating new class: ${card}`);
                res.format({
                    // HTML response will set the location and redirect back
                    // to the home page. You could also create a 'success'
                    // page if that's your thing
                    html: () => {
                        // If it worked, set the header so the address bar
                        // doesn't still say /adduser
                        res.location('cards');
                        // And forward to success page
                        res.redirect('/cards');
                    },
                    // JSON response will show the newly created class
                    json: () => {
                        res.json(card);
                    }
                });
            }
        });
    });

module.exports = router;
