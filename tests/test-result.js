'use strict()';

const setup = require('./setup-tests');
// Require assertion library
const expect = require('chai').expect;

// Load the mongoose library
const mongoose = require('mongoose');

// Require models
const Card = require('../src/models/card');
const Result = require('../src/models/result');
const Course = require('../src/models/course');
const Event = require('../src/models/event');
const Student = require('../src/models/student');
const data = require('./data/test-result.json');

// Store the result in the model with the required object ids
function addResults(data, event, courses, students, cards, done) {
    
    // Set a counter to control when done is returned
    let count = 0;

    // Variables for persistent data
    let student, card, course;

    // Loop over the results in the mock data file
    data.forEach(function (result) {

        // Get a student id from the array based on the unityid field in the result
        student = students.find(function (student) {
            return student.unityid === result.unityid;
        });

        // Assign a course based on the unityid since I know which course
        // is assigned to the unityid in the result data
        if (student.unityid === 'daconner' || student.unityid === 'jdoe') {
            course = courses[0];
        } else {
            course = courses[1];
        }

        // Get the card id from the array based on the number in the result
        card = cards.find(function (card) {
            return card.number === result.card;
        });

        // Use the data from the result and the document ids of the student,
        // event, and course to create the result document and insert it in the db
        Result.create({
            "event": event.id,
            "course": course.id,
            "card": card.number,
            "student": student.id,
            "cn": result.cn,
            "time": result.time
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
describe('Result collection: ', function (done) {
    // Clear the collection before running the tests
    before('Empty the result collection', function (done) {
        Result.remove().exec();
        return done();
    });

    // Variables for persistent data
    let event, courses, students, cards;

    // Get an event document
    before('Get the Event', function (done) {
        Event.findOne({ name: "Umstead Park Event", date: "2016-02-27" }, function (error, entry) {
            if (error) console.log(error);
            event = entry;
            return done();
        });
    });

    // Get an array of the courses at the selected event
    before('Get the Courses used in the event', function (done) {
        Course.find({ location: "Umstead Park" }, function (error, entries) {
            if (error) console.log(error);
            courses = entries;
            return done();
        });
    });

    // Get an array of student documents
    before('Get the students in the event', function (done) {
        Student.find({}, function (error, entries) {
            if (error) console.log(error);
            students = entries;
            return done();
        });
    });

    // Get an array of card documents
    before('Get the card numbers', function (done) {
        Card.find({}, function (error, entries) {
            if (error) console.log(error);
            cards = entries;
            return done();
        });
    });

    // Add the test data to the collection
    before('Load the result collection', function (done) {
        addResults(data, event, courses, students, cards, done);
    });

    // Confirm the number of documents is correct
    it('Contains 42 documents', function (done) {
        Result.find({}, function (error, results) {
            if (error) console.log(error);
            expect(results.length).to.equal(42);
            return done();
        });
    });

});