'use strict()';

const expect = require('./setup-tests');

// Require models
const Card = require('../models/card');
const Result = require('../models/result');
const Course = require('../models/course');
const Event = require('../models/event');
const Student = require('../models/student');
const data = require('./data/test-result.json');

// Store the result in the model with the required object ids
function addResults(event, courses, students, cards, done) {
    // Set a counter to control when done is returned
    let count = 0;

    // Loop over the results in the mock data file
    data.forEach((result) => {
        // Get a student id from the array based on the unityid field in the result
        const student = students.find((entry) => {
            return entry.unityid === result.unityid;
        });

        // Assign a course based on the unityid since I know which course
        // is assigned to the unityid in the result data
        let course;
        if (student.unityid === 'daconner' || student.unityid === 'jdoe') {
            course = courses[0];
        } else {
            course = courses[1];
        }

        // Get the card id from the array based on the number in the result
        
        const card = cards.find((entry) => {
            return entry.number === result.card;
        });

        // Use the data from the result and the document ids of the student,
        // event, and course to create the result document and insert it in the db
        Result.create({
            event: event.id,
            course: course.id,
            card: card.number,
            student: student.id,
            cn: result.cn,
            time: result.time
        });

        // Increment the count to compare the number of completed documents
        // with the number of results in the data file.
        count += 1;

        // When the number of documents inserted is equal to the number of results
        // let mocha know it can start running the tests. 
        if (count === data.length) {
            return done();
        }
   });
}

// Start tests for the Result model
describe('Result collection: ', () => {
    // Clear the collection before running the tests
    before('Empty the result collection', (done) => {
        Result.remove().exec();
        return done();
    });

    // Variables for persistent data
    let event;
    let courses;
    let students;
    let cards;

    // Get an event document
    before('Get the Event', (done) => {
        Event.findOne({ name: 'Umstead Park Event', date: '2016-02-27' }, (error, entry) => {
            if (error) console.log(error);
            event = entry;
            return done();
        });
    });

    // Get an array of the courses at the selected event
    before('Get the Courses used in the event', (done) => {
        Course.find({ location: 'Umstead Park' }, (error, entries) => {
            if (error) console.log(error);
            courses = entries;
            return done();
        });
    });

    // Get an array of student documents
    before('Get the students in the event', (done) => {
        Student.find({}, (error, entries) => {
            if (error) console.log(error);
            students = entries;
            return done();
        });
    });

    // Get an array of card documents
    before('Get the card numbers', (done) => {
        Card.find({}, (error, entries) => {
            if (error) console.log(error);
            cards = entries;
            return done();
        });
    });

    // Add the test data to the collection
    before('Load the result collection', (done) => {
        addResults(event, courses, students, cards, done);
    });

    // Confirm the number of documents is correct
    it('Contains 42 documents', (done) => {
        Result.find({}, (error, results) => {
            if (error) console.log(error);
            expect(results.length).to.equal(42);
            return done();
        });
    });
});
