'use strict()';

const mongoose = require('mongoose');
// Maybe I can use promises instead of callbacks?
mongoose.Promise = require('bluebird');

const mongodb = require('mongodb');
const uri = 'mongodb://localhost:27017/o-results-test';

// Require assertion library
const expect = require('chai').expect;

// Require models
const Class = require('./src/models/class');
const classData = require('./tests/db/test-class.json');

// Setup components to test
describe('Test file is ready', function () {
    it('ready', function () {
        let ar = [];
        expect(ar).to.be.empty;
        console.log('The test file is ready to add some tests!');
    });
});

// Test the class collection
describe('The class collection: ', function () {
    // Make a connection to the database
    before(function (done) {
        
        let addClass = function(data) {
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
            return done();
        };

        mongoose.connect(uri, function (error) {
            if (error) {
                console.log('Connection failed.');
                process.exit(1);
            }
        });

        // Empty the collections in the db
        Class.remove().exec()
        // Load the class collection
        .then(addClass(classData))
        .then(console.log('The class collection has loaded four documents'));
    });

    // After the tests, disconnect from the db
    after(function (done) {
        mongoose.disconnect(console.log('Mongoose disconnected'));
        return done();
    });

    // Check that the documents were loaded
    it('The class collection contains four documents', function (done) {
        //The result should be an array of docs
        let result = Class.find({}, function(error, docs) {
            if (error) console.log(error);
            console.log(docs);
            return docs;
        });
        expect(result.length).to.equal(4); 
        return done();
    });

});