'use strict()';

const mongoose = require('mongoose');
// Maybe I can use promises instead of callbacks?
mongoose.Promise = require('bluebird');

const mongodb = require('mongodb');
const uri = 'mongodb://localhost:27017/o-results-test';

// Make a connection to the database
beforeEach(function (done) {

    if (mongoose.connection.readyState === 0) {
        mongoose.connect(uri, function (error) {
            if (error) {
                console.log('Connection failed.');
                process.exit(1);
            }
        });
    }
    done();
});

// After the tests, disconnect from the db
afterEach(function (done) {
    mongoose.disconnect();
    return done();
});
