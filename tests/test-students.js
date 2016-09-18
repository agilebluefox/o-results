'use strict()';

const expect = require('./setup-tests');

// Require models
const Class = require('../models/classes');
const Student = require('../models/students');
const data = require('./data/test-students.json');

// Function to insert a student into the Student collection
function addStudent(classId, done) {
    let count = 0;
    data.forEach((student) => {
        Student.create({
            unityid: student.unityid,
            email: student.email,
            firstname: student.firstname,
            lastname: student.lastname,
            sex: student.sex,
            class: [classId]
        }, (error, entry) => {
            if (error) console.log(error);
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
        // Get a class to add to the students
        Class.findOne({ section: '096' }, (error, classId) => {
            if (error) console.log(error);
            // add the students in the test data to the collection
            // Pass the done callback to prevent other tests from
            // running until the collection is completely loaded.
            addStudent(classId, done);
        });     
    });

    // Confirm the number of students in the collection
    it('Contains five documents', (done) => {
        Student.find({}, (error, students) => {
            if (error) console.log(error);
            expect(students.length).to.equal(5);
            return done();
        });
    });

    // Confirm a student can be found using the unityid
    it('Retrieves students by unityid', (done) => {
        Student.findOne({ unityid: 'rwalker' }, (error, student) => {
            if (error) console.log(error);
            expect(student.lastname).to.equal('Walker');
            return done();
        });
    });

    // Confirm a student can be found using the email property
    it('Locates a student by email address', (done) => {
        Student.findOne({ email: 'msmith@ncsu.edu' }, (error, student) => {
            if (error) console.log(error);
            expect(student.unityid).to.equal('msmith');
            return done();
        });
    });

    // Confirm the sex of the student is a number
    it('Stores the sex of the student as a number', (done) => {
        Student.findOne({}, (error, student) => {
            if (error) console.log(error);
            expect(student.sex).to.be.a('number');
            return done();
        });
    });

    // The class is stored for a student
    it('Retrieves the class property for a student', (done) => {
        Student.findOne({ email: 'jdoe@ncsu.edu' }, (error, student) => {
            if (error) console.log(error);
            expect(student.class).to.have.lengthOf(1);
            return done();
        });
    });    
});
