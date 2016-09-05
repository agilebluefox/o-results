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
function addControls (data) {
    data.forEach(function(control) {
        Control.create({
            number: control.number,
            type: control.type,
            points: control.points
        }, function(error, control) {
            if (error) console.log(error);
        });
    });
    return;
}

describe('Control collection: ', function() {
    // Runs before all tests in this block
    before(function(done) {
        Control.remove().exec();
        addControls(data);
        return done();
    });

    // Confirm all the documents are loaded into the collection
    it('contains 21 documents', function(done) {
        Control.find({}, function(error, docs) {
            if (error) console.log(error);
            console.log(docs);
            expect(docs.length).to.equal(21);
            return done();
        });
    });

    // Confirm the type of the control number - string
    it('stores the control number as a string', function(done) {
        Control.findOne({}, function(error, doc) {
            if (error) console.log(error);
            expect(doc.number).to.be.a('string');
            return done();
        });
    });

    // Confirm the point values are stored as a number
    it('stores the control points as a number', function(done) {
        Control.findOne({}, function(error, doc) {
            if (error) console.log(error);
            expect(doc.points).to.be.a('number');
            return done();
        });
    });

    // Confirm the type contains values for the special controls
    it('stores the type of control', function (done) {
        Control.findOne({ number: '1' }, function(error, doc) {
            if (error) console.log(error);
            expect(doc.type).to.equal('station');
            return done();
        });
    });
});