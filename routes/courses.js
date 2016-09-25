const express = require('express');
const bodyParser = require('body-parser'); //parses information from POST
const logger = require('../libs/logger');
const createCodename = require('../libs/codename');

const router = express.Router();

router.use(bodyParser.urlencoded({ extended: true }));

const Course = require('../models/courses');

// define the home page route
// build the REST operations at the base for courses
// this will be accessible from http://127.0.0.1:3000/courses if the default
// route for / is left unchanged
router.route('/')
    //GET all courses
    .get((req, res) => {
        //retrieve all courses from Mongo
        Course.find({ active: true }, (err, courses) => {
            if (err) {
                logger.error(err);
            } else {
                // respond to both HTML and JSON. JSON responses require
                // 'Accept: application/json;' in the Request Header
                res.format({
                    // HTML response will render the index.pug file in the
                    // views/courses folder. We are also setting 'courses''
                    // to be an accessible variable in our pug view
                    html: () => {
                        res.render('courses/index', {
                            title: 'All my courses',
                            courses
                        });
                    },
                    //JSON response will show all courses in JSON format
                    json: () => {
                        res.json(courses);
                    }
                });
            }
        });
    })
    .post((req, res) => {
        // TODO: Validate data in the request
        // Get values from POST request. These can be done through forms or
        // REST calls. These rely on the 'name'' attributes for forms
        const location = req.body.location;
        const name = req.body.name;
        const mapdate = req.body.mapdate;
        const codename = createCodename(name, mapdate);
        const type = req.body.type;
        const inorder = req.body.inorder;
        const controls = req.body.controls;
        //call the create function for our database
        Course.create({
            location,
            mapdate,
            name,
            codename,
            type,
            inorder,
            controls
        }, (err, course) => {
            if (err) {
                res.send('There was a problem adding the course to the database.');
                logger.error('The course could not be added to the database');
            } else {
                //course has been created
                logger.info(`POST creating new class: ${course}`);
                res.format({
                    // HTML response will set the location and redirect back
                    // to the home page. You could also create a 'success'
                    // page if that's your thing
                    html: () => {
                        // If it worked, set the header so the address bar
                        // doesn't still say /adduser
                        res.location('courses');
                        // And forward to success page
                        res.redirect('/courses');
                    },
                    // JSON response will show the newly created class
                    json: () => {
                        res.json(course);
                    }
                });
            }
        });
    })
    .put((req, res) => {
        const id = req.body.id;
        const active = req.body.active;
        const location = req.body.location;
        const name = req.body.name;
        const mapdate = req.body.mapdate;
        const codename = createCodename(name, mapdate);
        const type = req.body.type;
        const inorder = req.body.inorder;
        const controls = req.body.controls;
        // Make changes to the property and send the entire object
        Course.findByIdAndUpdate(id, {
            active,
            location,
            mapdate,
            name,
            codename,
            type,
            inorder,
            controls
        }, { new: true }, (error, doc) => {
            if (error) {
                    return res.status(500).json({
                        message: 'Could not update course'
                    });
                }
                return res.status(201).json(doc);
        });
    });

module.exports = router;
