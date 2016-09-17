'use strict()';

const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

// Require assertion library
const expect = require('chai').expect;

const uri = 'mongodb://localhost:27017/o-results-test';

if (mongoose.connection.readyState === 0) {
    mongoose.connect(uri, (error) => {
        if (error) {
            console.log('Connection failed.');
            process.exit(1);
        }
    });
}

// require my tests


// After the tests, disconnect from the db
after((done) => {
    mongoose.disconnect();
    return done();
});

module.exports = expect;
