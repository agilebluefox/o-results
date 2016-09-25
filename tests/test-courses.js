'use strict()';

const expect = require('./test-server');
const logger = require('../libs/logger');

// Require models
const Course = require('../models/courses');
const data = require('./data/test-courses.json');
const createCodename = require('../libs/codename');

function addCourses(done) {
    let count = 0;
    data.forEach((course) => {
        const codename = createCodename(course.name, course.mapdate);

        Course.create({
            location: course.location,
            mapdate: course.mapdate,
            name: course.name,
            codename,
            type: course.type,
            inorder: course.inorder,
            controls: course.controls
        }, (error, entry) => {
            if (error) logger.error(error);
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
        Course.find({ active: true }, (error, courses) => {
            if (error) logger.error(error);
            expect(courses.length).to.equal(3);
            return done();
        });
    });

    // Confirm the control number is stored as a string
    it('Stores the control number as a string', (done) => {
        Course.findOne({}, (error, course) => {
            if (error) logger.error(error);
            const control = course.controls[3];
            expect(control.number).to.be.a('string');
            return done();
        });
    });

    // Confirm the codename is unique
    it('Stores a unique codename for the course', (done) => {
        Course.distinct('codename', (error, courses) => {
            if (error) logger.error(error);
            expect(courses.length).to.equal(3);
            return done();
        });
    });

    // Confirm the point values are stored for each control
    it('Stores the point value of the control', (done) => {
        Course.findOne({ type: 'score' }, (error, course) => {
            if (error) logger.error(error);
            const control = course.controls[3];
            expect(control.points).to.equal(47);
            return done();
        });
    });

    // Confirm the type matches the correct number
    it('Stores the correct type for a control', (done) => {
        Course.findOne({}, (error, course) => {
            if (error) logger.error(error);
            const control = course.controls[1];
            expect(control.type).to.equal('start');
            return done();
        });
    });

    // The in_order boolean is set 
    it('Indicates the course completion order', (done) => {
        Course.findOne({}, (error, course) => {
            if (error) logger.error(error);
            expect(course.inorder).to.not.be.undefined;
            return done();
        });
    });
});
