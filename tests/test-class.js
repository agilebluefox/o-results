'use strict()';

const setup = require('./tests/setup-tests');
// Require assertion library
const expect = require('chai').expect;

// Load the mongoose library
const mongoose = require('mongoose');
// Maybe I can use promises instead of callbacks?
mongoose.Promise = require('bluebird');

// Require models
const Class = require('./src/models/class');
const classData = require('./tests/data/test-class.json');

let addClass = function (data) {
    for (let i = 0; i < data.length; i++) {
        let entry = new Class({
            year: data[i].year,
            semester: data[i].semester,
            prefix: data[i].prefix,
            number: data[i].number,
            name: data[i].name,
            section: data[i].section
        });
    entry.save();
    }
    return;
};

// Setup components to test
describe('Test file is ready: ', function () {
    it('ready', function () {
        let ar = [];
        expect(ar).to.be.empty;
    });
});

// Test the class collection
describe('The class collection: ', function () {
    before(function(){
        // Empty the collection
        Class.remove().exec()
        // Load the collections in the db
        .then(addClass(classData));
    });
   
    // Check that the documents were loaded
    it('The class collection contains four documents', function (done) {

        //The result should be an array of docs
        Class.find({}, function (error, docs) {
            if (error) console.log(error);
            expect(docs.length).to.equal(4);
            return done();
        });
    });
});