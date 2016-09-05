'use strict()';

const setup = require('./setup-tests');
// Require assertion library
const expect = require('chai').expect;

// Load the mongoose library
const mongoose = require('mongoose');

// Require models
const Class = require('../src/models/class');
const Student = require('../src/models/student');
const data = require('./data/test-student.json');

// Function to insert a student into the Student collection
function addStudent(data) {
    data.forEach(function(student) {
        Student.create({
            "unityid": student.unityid,
            "email": student.email,
            "firstname": student.firstname,
            "lastname": student.lastname,
            "sex": student.sex,
            "class": student.class
        }, function(error, student) {
            if (error) console.log(error);
        });
    });
    return;
}

describe('Student collection: ', function() {
    // Clear the collection before running the tests
    before(function(done) {
        Student.remove().exec();
        // Get a class to add to the students
        // add the students in the test data to the collection
        addStudent(data);
        return done();
    });

    // Confirm the number of students in the collection
    it('Contains five documents', function(done) {
        Student.find({}, function(error, students) {
            if (error) console.log(error);
            console.log(students.length);
            expect(students.length).to.equal(5);
        });
        return done();
    });

    // Confirm a student can be found using the unityid
    it('Retrieves students by unityid', function(done) {
        Student.findOne( {unityid: "rwalker"}, function(error, student) {
            if (error) console.log(error);
            expect(student.lastname).to.equal('Walker');
        });
        return done();
    });

    // Confirm a student can be found using the email property

    // Confirm the sex of the student is a number

    // Confirm students can be filtered by class
});