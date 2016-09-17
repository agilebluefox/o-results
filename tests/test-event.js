'use strict()';

const setup = require('./setup-tests');
// Require assertion library
const expect = require('chai').expect;

// Load the mongoose library
const mongoose = require('mongoose');

// Require models
const Class = require('../src/models/class');
const Course = require('../src/models/course');
const Event = require('../src/models/event');
const data = require('./data/test-event.json');

// Function to insert an event into the Event collection
// It should add a randomly selected class and course
function addEvent(data, done) {

    data.forEach(function (event) {
        Event.create({
            location: event.location,
            name: event.name,
            date: event.date,
            courses: courses,
            classes: classes
        });
    });
    return done();
}

// Set variables to hold the course and class objectIds
let courses = null;
let classes = null;

describe('Event collection: ', function (done) {
    // Clear the collection before running the tests
    before('Empty the event collection', function (done) {
        Event.remove().exec();
        return done();
    });

    before('Get the class and course arrays', function (done) {
        Class.find({ section: "196" }, function (error, entry) {
            if (error) console.log(error);
            classes = entry;
            Course.find({ location: 'Umstead Park' }, function (error, entry) {
                if (error) console.log(error);
                courses = entry;
                return done();
            });
        });
    });

    // Insert the test data into the collection
    before('Load the event collection', function (done) {
        addEvent(data, done);
    });

    it('Has eight documents', function (done) {
        Event.find({}, function (error, events) {
            if (error) console.log(error);
            expect(events.length).to.equal(8);
            return done();
        });
    });
});