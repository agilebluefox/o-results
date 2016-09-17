'use strict()';

const expect = require('./setup-tests');

// Require models
const Course = require('../models/course');
const data = require('./data/test-course.json');

function getRandomInt(min, max) {
  Math.ceil(min);
  Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

function addCourses(done) {
    let count = 0;
    data.forEach((course) => {
        let codename = '';
        const name = course.name.toLowerCase().split(' ');

        name.forEach((word) => {
            codename += word.substr(0, 1);
        });

        // Create a date object from the UTC formatted string
        const date = new Date(course.mapdate);

        // Extract the year, month, and day
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();

        // generate random number to add to end
        const min = 1000;
        const max = 10000;
        const random = getRandomInt(min, max);

        // Use the intials, date components, and random number
        // to create a "unique" codename in case I need it later
        codename += `${year}${month}${day}-${random}`;

        Course.create({
            location: course.location,
            mapdate: course.mapdate,
            name: course.name,
            codename,
            type: course.type,
            inorder: course.inorder,
            controls: course.controls
        }, (error, entry) => {
            if (error) console.log(error);
            if (entry) count += 1;
            if (count === data.length) return done();
        });
    });
}

describe('Course collection: ', () => {
    // Run before all tests in this block

    // Empty the course collecttion
    before('Empty the course collection', (done) => {
        Course.remove().exec();
        return done();
    });

    // Add the test data to the collection
     before('Load the course collection', (done) => {
        addCourses(done);
    });

    // Confirm the number of documents is correct
    it('Contains three documents', (done) => {
        Course.find({}, (error, courses) => {
            if (error) console.log(error);
            expect(courses.length).to.equal(3);
            return done();
        });
    });

    // Confirm the control number is stored as a string
    it('Stores the control number as a string', (done) => {
        Course.findOne({}, (error, course) => {
            if (error) console.log(error);
            const control = course.controls[3];
            expect(control.number).to.be.a('string');
            return done();
        });
    });

    // Confirm the codename is unique
    it('Stores a unique codename for the course', (done) => {
        Course.distinct('codename', (error, courses) => {
            if (error) console.log(error);
            expect(courses.length).to.equal(3);
            return done();
        });
    });

    // Confirm the point values are stored for each control
    it('Stores the point value of the control', (done) => {
        Course.findOne({ type: 'score' }, (error, course) => {
            if (error) console.log(error);
            const control = course.controls[3];
            expect(control.points).to.equal(47);
            return done();
        });
    });

    // Confirm the type matches the correct number
    it('Stores the correct type for a control', (done) => {
        Course.findOne({}, (error, course) => {
            if (error) console.log(error);
            const control = course.controls[1];
            expect(control.type).to.equal('start');
            return done();
        });
    });

    // The in_order boolean is set 
    it('Indicates the course completion order', (done) => {
        Course.findOne({}, (error, course) => {
            if (error) console.log(error);
            expect(course.inorder).to.not.be.undefined;
            return done();
        });
    });
});
