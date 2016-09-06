'use strict()';

const setup = require('./setup-tests');
// Require assertion library
const expect = require('chai').expect;

// Load the mongoose library
const mongoose = require('mongoose');

// Require models
const Course = require('../src/models/course');
const data = require('./data/test-course.json');

function addCourses(data, done) {
    Course.create(data, function(error, courses) {
        if (error) console.log(error);
        return done();
    });
}

describe('Course collection: ', function(done) {
    // Run before all tests in this block

    // Empty the course collecttion
    before('Empty the course collection', function(done) {
        Course.remove().exec();
        return done();
    });

    // Add the test data to the collection
     before('Load the student collection', function(done) {
        addCourses(data, done);
    });

    // Confirm the number of documents is correct
    it('Contains three documents', function(done) {
        Course.find({}, function(error, courses) {
            if (error) console.log(error);
            expect(courses.length).to.equal(3);
            return done();
        });
    });

    // Confirm the control number is stored as a string
    it('Stores the control number as a string', function (done) {
        Course.findOne({}, function(error, course) {
            if (error) console.log(error);
            let control = course.controls[3];
            expect(control.number).to.be.a('string');
            return done();
        });
    });

    // Confirm the point values are stored for each control
    it('Stores the point value of the control', function(done) {
        Course.findOne({ type: 'score' }, function(error, course) {
            if (error) console.log(error);
            let control = course.controls[3];
            expect(control.points).to.equal(47);
            return done();
        });
    });

    // Confirm the type matches the correct number
    it('Stores the correct type for a control', function(done) {
        Course.findOne({ }, function(error, course) {
            if (error) console.log(error);
            let control = course.controls[1];
            expect(control.type).to.equal('start');
            return done();
        });
    });

    // The in_order boolean is set 
    it('Indicates the course completion order', function(done) {
        Course.findOne({}, function(error, course) {
            if (error) console.log(error);
            expect(course.in_order).to.not.be.undefined;
            return done();
        });
    });
});