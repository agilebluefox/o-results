'use strict()';

// Get db connection
const mongoose = require('../models/db');

// Require assertion library
const expect = require('chai').expect;

// After the tests, disconnect from the db
after((done) => {
    mongoose.disconnect();
    return done();
});

module.exports = expect;
