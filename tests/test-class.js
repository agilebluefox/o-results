'use strict()';

const setup = require('./setup-tests');
// Require assertion library
const expect = require('chai').expect;

// Load the mongoose library
const mongoose = require('mongoose');

// Require models
const Class = require('../src/models/class');
const data = require('./data/test-class.json');

function addClass(data) {
    data.forEach(function(entry) {
        Class.create({
            year: entry.year,
            semester: entry.semester,
            prefix: entry.prefix,
            number: entry.number,
            name: entry.name,
            section: entry.section
        }, function(error, entry) {
            if (error) console.log(error);
        });
    });
    return;
}

// Test the class collection
describe('The class collection: ', function () {
    before(function(done){
        // Empty the collection
        Class.remove().exec();
        // Load the collections in the db
        addClass(data);
        return done();
    });
   
    // Check that the documents were loaded
    it('contains four documents', function (done) {

        //The result should be an array of docs
        Class.find({}, function (error, docs) {
            if (error) console.log(error);
            expect(docs.length).to.equal(4);
            return done();
        });
    });

    it('returns a unique and descriptive title for each class', function(done) {
        Class.findOne({}, function(error, doc) {
            if (error) return console.log(error);
            // Check the mongoose virtual title property
            expect(doc.title).to.match(/HESO 253-[0-9]{3} Orienteering, (Fall|Spring) 20[0-9]{2}/);
            return done();
        });
    });
});