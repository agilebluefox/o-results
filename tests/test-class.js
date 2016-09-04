'use strict()';

const setup = require('./setup-tests');
// Require assertion library
const expect = require('chai').expect;

// Load the mongoose library
const mongoose = require('mongoose');
// Maybe I can use promises instead of callbacks?
mongoose.Promise = require('bluebird');

// Require models
const Class = require('../src/models/class');
const classData = require('./data/test-class.json');

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

// Test the class collection
describe('The class collection: ', function () {
    before(function(){
        // Empty the collection
        Class.remove().exec()
        // Load the collections in the db
        .then(addClass(classData));
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