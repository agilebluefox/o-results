'use strict()';

const setup = require('./setup-tests');
// Require assertion library
const expect = require('chai').expect;

// Load the mongoose library
const mongoose = require('mongoose');

// Require models
const Course = require('../src/models/course');
const data = require('./data/test-course.json');

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

function addCourses(data, done) {
    let count = 0;
    data.forEach(function(course) {
        let codename = "";
        let initials = "";
        let date, year, month, day = 0;
        let name = course.name.toLowerCase().split(' ');
        name.forEach(function(word) {
            initials += word.substr(0,1);
        });
        // Create a date object from the UTC formatted string
        date = new Date (course.mapdate);
        // Extract the year, month, and day
        year = date.getFullYear();
        month = date.getMonth() + 1;
        day = date.getDate();
        // generate random number to add to end
        let min = 1000;
        let max = 10000;
        let random = getRandomInt(min, max);
        // Use the intials, date components, and random number
        // to create a "unique" codename in case I need it later
        codename = initials + year + month + day + "-" + random;
        Course.create({
            "location": course.location,
            "mapdate": course.mapdate,
            "name": course.name,
            "codename": codename,
            "type": course.type,
            "inorder": course.inorder,
            "controls": course.controls
        }, function(error, course) {
            if (error) console.log(error);
            count += 1;
            if (count === data.length) return done();
        });
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
     before('Load the course collection', function(done) {
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

    // Confirm the codename is unique
    it('Stores a unique codename for the course', function(done) {
        Course.find().distinct('codename', function(error, courses) {
            if (error) console.log(error);
            expect(courses.length).to.equal(3);
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
            expect(course.inorder).to.not.be.undefined;
            return done();
        });
    });
});