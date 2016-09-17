'use strict()';

const setup = require('./setup-tests');
// Require assertion library
const expect = require('chai').expect;

// Load the mongoose library
const mongoose = require('mongoose');

// Require models
const Control = require('../src/models/control');
const data = require('./data/test-control.json');

// Insert test data to Control collection
function addControls (data, done) {
    Control.create(data, function (error, controls) {
        if (error) console.log(error);
        return done();
    });
}

describe('Control collection: ', function() {
    // Runs before all tests in this block
    before('Empty the student collection', function(done) {
        Control.remove().exec();
        return done();
    });

    before('Load the student collection', function(done) {
        addControls(data, done);
    });

    // Confirm all the documents are loaded into the collection
    it('Contains 21 documents', function(done) {
        Control.find({}, function(error, docs) {
            if (error) console.log(error);
            expect(docs.length).to.equal(21);
            return done();
        });
    });

    // Confirm the type of the control number - string
    it('Stores the control number as a string', function(done) {
        Control.findOne({}, function(error, doc) {
            if (error) console.log(error);
            expect(doc.number).to.be.a('string');
            return done();
        });
    });

    // Confirm the type contains values for the special controls
    it('Stores the type of control', function (done) {
        Control.findOne({ number: '1' }, function(error, doc) {
            if (error) console.log(error);
            expect(doc.type).to.equal('station');
            return done();
        });
    });
});