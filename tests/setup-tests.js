'use strict()';

const mongoose = require('mongoose');
// Maybe I can use promises instead of callbacks?
mongoose.Promise = require('bluebird');

const mongodb = require('mongodb');
const uri = 'mongodb://localhost:27017/o-results-test';

if (mongoose.connection.readyState === 0) {
    mongoose.connect(uri, function (error) {
        if (error) {
            console.log('Connection failed.');
            process.exit(1);
        }
    });
}

// After the tests, disconnect from the db
after(function (done) {
    mongoose.disconnect();
    return done();
});
