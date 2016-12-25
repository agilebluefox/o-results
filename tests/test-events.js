'use strict()';

const expect = require('./test-server');
const logger = require('../libs/logger');

// Require models
const Event = require('../models/events');
const data = require('./data/test-events.json');

// Function to insert an event into the Event collection
// It should add a randomly selected class and course
function addEvent(done) {
    data.forEach((event) => {
        Event.create({
            location: event.location,
            name: event.name,
            date: event.date
        });
    });
    return done();
}

describe('Event collection: ', () => {
    // Clear the collection before running the tests
    before('Empty the event collection', (done) => {
        Event.remove().exec();
        return done();
    });

    // Insert the test data into the collection
    before('Load the event collection', (done) => {
        addEvent(done);
    });

    it('Has eight documents', (done) => {
        Event.find({ active: true }, (error, events) => {
            if (error) logger.error(error);
            expect(events.length).to.equal(8);
            return done();
        });
    });
});
