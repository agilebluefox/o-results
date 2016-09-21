const express = require('express');
const bodyParser = require('body-parser'); //parses information from POST
const logger = require('../logger');

const router = express.Router();

router.use(bodyParser.urlencoded({ extended: true }));

const Student = require('../models/students');

// define the home page route
// build the REST operations at the base for students
// this will be accessible from http://127.0.0.1:3000/students if the default
// route for / is left unchanged
router.route('/')
    //GET all students
    .get((req, res, next) => {
        //retrieve all students from Mongo
        Student.find({}, (err, students) => {
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
                            students
                        });
                    },
                    //JSON response will show all students in JSON format
                    json: () => {
                        res.json(students);
                    }
                });
            }
        });
    })
    .post((req, res) => {
        // TODO: Validate data in the request
        // Get values from POST request. These can be done through forms or
        // REST calls. These rely on the 'name'' attributes for forms
        const unityid = req.body.unityid;
        const email = req.body.email;
        const firstname = req.body.firstname;
        const lastname = req.body.lastname;
        const sex = req.body.sex;
        const cls = req.body.class;
        //call the create function for our database
        Student.create({
            unityid,
            email,
            firstname,
            lastname,
            sex,
            class: cls
        }, (err, student) => {
            if (err) {
                res.send('There was a problem adding the student to the database.');
                logger.error('The student could not be added to the database');
            } else {
                //student has been created
                logger.info(`POST creating new class: ${student}`);
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
                        res.json(student);
                    }
                });
            }
        });
    });

module.exports = router;
