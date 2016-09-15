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

function addResults(data, event, courses, students, cards, done) {

    let count = 0;
    let student, card, course;

    // Loop over the results in the mock data file
    data.forEach(function (result) {

        // Get a student from the array
        student = students.find(function (student) {
            return student.unityid === result.unityid;
        });

        // Assign a course based on the unityid
        console.log(student);

        if (student.unityid === 'daconner' || student.unityid === 'jdoe') {
            course = courses[0];
        } else {
            course = courses[1];
        }

        card = cards.find(function (card) {
            return card.number === result.card;
        });

        Result.create({
            "event": event.id,
            "course": course.id,
            "card": card.number,
            "student": student.id,
            "cn": result.cn,
            "time": result.time
        });

        count += 1;
        if (count === data.length) {
            return done();
        }


    });

}

describe('Result collection: ', function (done) {
    // Clear the collection before running the tests
    before('Empty the result collection', function (done) {
        Result.remove().exec();
        return done();
    });

    let event, courses, students, cards;

    before('Get the Event', function (done) {
        Event.findOne({ name: "Umstead Park Event", date: "2016-02-27" }, function (error, entry) {
            if (error) console.log(error);
            event = entry;
            return done();
        });
    });

    before('Get the Courses used in the event', function (done) {
        Course.find({ location: "Umstead Park" }, function (error, entries) {
            if (error) console.log(error);
            courses = entries;
            return done();
        });
    });

    before('Get the students in the event', function (done) {
        Student.find({}, function (error, entries) {
            if (error) console.log(error);
            students = entries;
            return done();
        });
    });

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