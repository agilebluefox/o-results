'use strict()';

const express = require('express');

const router = express.Router();

const Class = require('../models/classes');

// // middleware that is specific to this router
// router.use(function timeLog(req, res, next) {
//   console.log('Time: ', Date.now());
//   next();
// });

// // define the home page route
// router.get('/', (req, res) => {
//     Class.find({}, (error, classes) => {
//         if (error) console.log(error);
//         res.send(classes);
//     });
// });

// // define the about route
// router.get('/about', (req, res) => {
//   res.send('About birds');
// });

const bodyParser = require('body-parser'); //parses information from POST
const methodOverride = require('method-override'); //used to manipulate POST

router.use(bodyParser.urlencoded({ extended: true }));
router.use(methodOverride((req, res) => {
      if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        // look in urlencoded POST bodies and delete it
        const method = req.body._method;
        delete req.body._method;
        return method;
      }
}));

//build the REST operations at the base for classes
//this will be accessible from http://127.0.0.1:3000/classes if the default route for / is left unchanged
router.route('/')
    //GET all classes
    .get((req, res, next) => {
        //retrieve all classes from Mongo
        Class.find({}, (err, classes) => {
              if (err) {
                  return console.error(err);
              } else {
                  // respond to both HTML and JSON. JSON responses require
                  // 'Accept: application/json;' in the Request Header
                  res.format({
                      // HTML response will render the index.pug file in the
                      // views/classes folder. We are also setting 'classes''
                      // to be an accessible variable in our pug view
                    html: () => {
                        res.render('classes/index', {
                              title: 'All my classes',
                              classes
                          });
                    },
                    //JSON response will show all classes in JSON format
                    json: () => {
                        res.json(classes);
                    }
                });
              }     
        });
    })
    // POST a new blob
    .post((req, res) => {
        // Get values from POST request. These can be done through forms or
        // REST calls. These rely on the 'name'' attributes for forms
        const year = req.body.year;
        const semester = req.body.semester;
        const prefix = req.body.prefix;
        const number = req.body.number;
        const name = req.body.name;
        const section = req.body.section;
        //call the create function for our database
        Class.create({
            year,
            semester,
            prefix,
            number,
            name,
            section
        }, (err, cls) => {
              if (err) {
                  res.send('There was a problem adding the information to the database.');
              } else {
                  //Class has been created
                  console.log(`POST creating new class: ${cls}`);
                  res.format({
                      // HTML response will set the location and redirect back
                      // to the home page. You could also create a 'success'
                      // page if that's your thing
                    html: () => {
                        // If it worked, set the header so the address bar
                        // doesn't still say /adduser
                        res.location('classes');
                        // And forward to success page
                        res.redirect('/classes');
                    },
                    // JSON response will show the newly created class
                    json: () => {
                        res.json(cls);
                    }
                });
              }
        });
    });


module.exports = router;
