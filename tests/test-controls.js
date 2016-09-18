'use strict()';

const expect = require('./setup-tests');

// Require models
const Control = require('../models/controls');
const data = require('./data/test-controls.json');

// Insert test data to Control collection
function addControls(done) {
    Control.create(data, (error, controls) => {
        if (error || !controls) console.log(error);
        return done();
    });
}

describe('Control collection: ', () => {
    // Runs before all tests in this block
    before('Empty the student collection', (done) => {
        Control.remove().exec();
        return done();
    });

    before('Load the student collection', (done) => {
        addControls(done);
    });

    // Confirm all the documents are loaded into the collection
    it('Contains 21 documents', (done) => {
        Control.find({}, (error, docs) => {
            if (error) console.log(error);
            expect(docs.length).to.equal(21);
            return done();
        });
    });

    // Confirm the type of the control number - string
    it('Stores the control number as a string', (done) => {
        Control.findOne({}, (error, doc) => {
            if (error) console.log(error);
            expect(doc.number).to.be.a('string');
            return done();
        });
    });

    // Confirm the type contains values for the special controls
    it('Stores the type of control', (done) => {
        Control.findOne({ number: '1' }, (error, doc) => {
            if (error) console.log(error);
            expect(doc.type).to.equal('station');
            return done();
        });
    });
});
