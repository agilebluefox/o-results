'use strict()';

const expect = require('./setup-tests');

// Require models
const Class = require('../models/classes');
const Course = require('../models/courses');
const Event = require('../models/events');
const data = require('./data/test-events.json');

// Function to insert an event into the Event collection
// It should add a randomly selected class and course
function addEvent(done) {
    data.forEach((event) => {
        Event.create({
            location: event.location,
            name: event.name,
            date: event.date,
            courses,
            classes
        });
    });
    return done();
}

// Set variables to hold the course and class objectIds
let courses = null;
let classes = null;

describe('Event collection: ', () => {
    // Clear the collection before running the tests
    before('Empty the event collection', (done) => {
        Event.remove().exec();
        return done();
    });

    before('Get the class and course arrays', (done) => {
        Class.find({ section: '196' }, (error, entry) => {
            if (error) console.log(error);
            classes = entry;
            Course.find({ location: 'Umstead Park' }, (err, cls) => {
                if (err) console.log(err);
                courses = cls;
                return done();
            });
        });
    });

    // Insert the test data into the collection
    before('Load the event collection', (done) => {
        addEvent(done);
    });

    it('Has eight documents', (done) => {
        Event.find({}, (error, events) => {
            if (error) console.log(error);
            expect(events.length).to.equal(8);
            return done();
        });
    });
});
