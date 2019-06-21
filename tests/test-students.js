'use strict';

const expect = require('./test-server');
const logger = require('../libs/logger');

// Require models
const Student = require('../models/students');
const data = require('./data/test-students.json');

// Function to insert a student into the Student collection
function addStudent(done) {
    let count = 0;
    data.forEach((student) => {
        Student.create({
            unityid: student.unityid,
            email: student.email,
            firstname: student.firstname,
            lastname: student.lastname
        }, (error, entry) => {
            if (error) logger.error(error);
            // Use conditional to make sure all the documents are
            // stored before the done function is returned.
            // This prevents running additional tests until the
            // collection is loaded completely.
            if (entry) count += 1;
            if (count === data.length) return done();
        });
    });
}

describe('Student collection: ', () => {
    // Clear the collection before running the tests
    before('Empty the student collection', (done) => {
        Student.remove().exec();
        return done();
    });

    // Insert the test data into the student collection
    before('Load the student collection', (done) => {
        // add the students
        addStudent(done);
    });

    // Confirm the number of students in the collection
    it('Contains five documents', (done) => {
        Student.find({
            active: true
        }, (error, students) => {
            if (error) logger.error(error);
            expect(students.length).to.equal(5);
            return done();
        });
    });

    // Confirm a student can be found using the unityid
    it('Retrieves students by unityid', (done) => {
        Student.findOne({
            unityid: 'rwalker'
        }, (error, student) => {
            if (error) logger.error(error);
            expect(student.lastname).to.equal('Walker');
            return done();
        });
    });

    // Confirm a student can be found using the email property
    it('Locates a student by email address', (done) => {
        Student.findOne({
            email: 'msmith@ncsu.edu'
        }, (error, student) => {
            if (error) logger.error(error);
            expect(student.unityid).to.equal('msmith');
            return done();
        });
    });
});