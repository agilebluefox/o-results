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
function addStudent(data, class_id, done) {
    let count = 0;
    data.forEach(function(student) {
        Student.create({
            "unityid": student.unityid,
            "email": student.email,
            "firstname": student.firstname,
            "lastname": student.lastname,
            "sex": student.sex,
            "class": [class_id]
        }, function(error, student) {
            if (error) console.log(error);
            // Use conditional to make sure all the documents are
            // stored before the done function is returned.
            // This prevents running additional tests until the
            // collection is loaded completely.
            count += 1;
            if (count === data.length ) return done();
        });
    });
}

describe('Student collection: ', function() {
    // Clear the collection before running the tests
    before('Empty the student collection', function(done) {     
        Student.remove().exec();
        Student.find({}, function(error, students) {
            if (error) console.log(error);
        });
        return done();       
    });

    // Insert the test data into the student collection
    before('Load the student collection', function(done) {        
        // Get a class to add to the students
        Class.findOne({ section: '096' }, function(error, class_id) {
            if (error) console.log(error);
            // add the students in the test data to the collection
            // Pass the done callback to prevent other tests from
            // running until the collection is completely loaded.
            addStudent(data, class_id, done);
        });     
    });

    // Confirm the number of students in the collection
    it('Contains five documents', function(done) {
        Student.find({}, function(error, students) {
            if (error) console.log(error);
            expect(students.length).to.equal(5);
            return done();
        });
    });

    // Confirm a student can be found using the unityid
    it('Retrieves students by unityid', function(done) {
        Student.findOne( {unityid: "rwalker"}, function(error, student) {
            if (error) console.log(error);
            expect(student.lastname).to.equal('Walker');
            return done();
        });
    });

    // Confirm a student can be found using the email property
    it('Locates a student by email address', function(done) {
        Student.findOne({ email: 'msmith@ncsu.edu'}, function(error, student) {
            if (error) console.log(error);
            expect(student.unityid).to.equal('msmith');
            return done();
        });
    });

    // Confirm the sex of the student is a number
    it('Stores the sex of the student as a number', function(done) {
        Student.findOne({}, function(error, student) {
            if (error) console.log(error);
            expect(student.sex).to.be.a('number');
            return done();
        });
    });

    // The class is stored for a student
    it('Retrieves the class property for a student', function(done) {
        Student.findOne({ email: 'jdoe@ncsu.edu'}, function(error, student) {
            if (error) console.log(error);
            expect(student.class).to.have.lengthOf(1);
            return done();
        });
    });
});