const express = require('express');
const bodyParser = require('body-parser'); //parses information from POST
const logger = require('../libs/logger');

const router = express.Router();

router.use(bodyParser.urlencoded({ extended: true }));

const Student = require('../models/students');

// define the home page route
// build the REST operations at the base for students
// this will be accessible from http://127.0.0.1:3000/students if the default
// route for / is left unchanged
router.route('/')
    //GET all students
    .get((req, res) => {
        //retrieve all students from Mongo
        Student.find({ active: true }, (err, docs) => {
            if (err) {
                logger.error(err);
            } else {
                // respond to both HTML and JSON. JSON responses require
                // 'Accept: application/json;' in the Request Header
                res.format({
                    // HTML response will render the index.pug file in the
                    // views/students folder. We are also setting 'students''
                    // to be an accessible variable in our pug view
                    html: () => {
                        res.render('students/index', {
                            title: 'All my students',
                            docs
                        });
                    },
                    //JSON response will show all students in JSON format
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
        const unityid = req.body.unityid;
        const email = req.body.email;
        const firstname = req.body.firstname;
        const lastname = req.body.lastname;
        const sex = req.body.sex;
        const cls = req.body.class;
        //call the create function for our database
        Student.create({
            active,
            unityid,
            email,
            firstname,
            lastname,
            sex,
            class: cls
        }, (err, doc) => {
            if (err) {
                res.send('There was a problem adding the student to the database.');
                logger.error('The student could not be added to the database');
            } else {
                //student has been created
                logger.info(`POST creating new class: ${doc}`);
                res.format({
                    // HTML response will set the location and redirect back
                    // to the home page. You could also create a 'success'
                    // page if that's your thing
                    html: () => {
                        // If it worked, set the header so the address bar
                        // doesn't still say /adduser
                        res.location('students');
                        // And forward to success page
                        res.redirect('/students');
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
        const unityid = req.body.unityid;
        const email = req.body.email;
        const firstname = req.body.firstname;
        const lastname = req.body.lastname;
        const sex = req.body.sex;
        const cls = req.body.class;
        // Update the document
        Student.findByIdAndUpdate(id, {
            active,
            unityid,
            email,
            firstname,
            lastname,
            sex,
            cls
        }, { new: true }, (error, doc) => {
            if (error) {
                    return res.status(500).json({
                        message: 'Could not update student'
                    });
                }
                return res.status(201).json(doc);
        });
    })
    .delete((req, res) => {
        const id = req.body._id;
        Student.findByIdAndUpdate(id, {
            active: false
        }, { new: true }, (error, doc) => {
            if (error) {
                    return res.status(500).json({
                        message: 'Could not delete the student'
                    });
                }
                return res.status(201).json(doc);
        });
    });

module.exports = router;
