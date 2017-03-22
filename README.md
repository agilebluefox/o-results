# O-Results NodeJS Server

Imports orienteering results from the O-Results App, stores the data, and renders reports for grading, analysis, and assessment

## Technical Skills

Express, Gulp, Mocha and Chai, MongoDB, Mongoose, Node, Node-Validator, Winston

## Breakdown

This project is the backend portion of the O-Results App which tracks students participating on various courses at an orienteering event. The RESTful API is setup using the Express JS library providing routes for each of the data models mirrored as collections in the MongoDB NoSQL database. The database models are built using Mongoose and provide server-side validation rules in combination with the node-validator library using both default and custom-designed validators. The project includes test data which can be added to the test database by running a Gulp task that targets the test functions built with Mocha and Chai. Finally, the Winston logging library provides a sophisticated logging system that can easily be configured to provide runtime messages that are based upon the logging level requested. These messages are useful in monitoring the server operations for debugging purposes in development and informational purposes when the Node JS server is running in production mode.