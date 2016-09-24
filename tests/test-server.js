'use strict()';

// Get db connection
const mongoose = require('../bin/db');
const server = require('../bin/server');
const chai = require('chai');
const chaiHttp = require('chai-http');

chai.use(chaiHttp);
const app = server.app;


// Require assertion library
const expect = require('chai').expect;

// After the tests, disconnect from the db
after((done) => {
    mongoose.disconnect();
    return done();
});

module.exports = expect;
