'use strict()';

const setup = require('./setup-tests');
// Require assertion library
const expect = require('chai').expect;

// Load the mongoose library
const mongoose = require('mongoose');

const EventEmitter = require('events');

// Require models
const Card = require('../src/models/card');
const Result = require('../src/models/result');
const Course = require('../src/models/course');
const Event = require('../src/models/event');
const Student = require('../src/models/student');
const data = require('./data/test-result.json');

function addResults(data, event, courses, students, cards, done) {
    let myEmitter = new EventEmitter();
    myEmitter.on('resultDone', () => {
      if (count === data.length) {
            Result.collection.insert(data, function(error, entry) {
                if (error) console.log(error);
                return done();
            });
        }
    });

    let count = 0;
    let numResult = 0;
    let course;
    data.forEach(function (result) {
        let student;
        let card;
        Student.findOne({ "unityid": result.unityid }, function (error, entry) {
            if (error) console.log(error);
            student = entry;
            Card.findOne({ "number": result.card }, function (error, entry) {
                if (error) console.log(error);
                card = entry;
                result.card = card;
                result.student = student;
                if (student.unityid === 'daconner' || student.unityid === 'jdoe') {
                    result.course = courses[0].id;
                } else {
                    result.course = courses[1].id;
                }

                result.event = event;
                count += 1;
                myEmitter.emit('resultDone');
            });

        });
        
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