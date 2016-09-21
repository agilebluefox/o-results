'use strict()';

const expect = require('./setup-tests');

// Require models
const Class = require('../models/classes');
const data = require('./data/test-classes.json');

function addClass(done) {
    Class.create(data, (error, classes) => {
        if (error || !classes) console.log(error);
        return done();
    });
}

// Test the class collection
describe('The class collection: ', () => {
    before((done) => {
        // Empty the collection
        Class.remove().exec();
        // Load the collections in the db
        addClass(done);
    });
   
    // Check that the documents were loaded
    it('Contains four documents', (done) => {
        //The result should be an array of docs
        Class.find({ active: true }, (error, docs) => {
            if (error) console.log(error);
            expect(docs.length).to.equal(4);
            return done();
        });
    });

    it('Returns a unique and descriptive title for each class', (done) => {
        Class.findOne({}, (error, doc) => {
            if (error || !doc) return console.log(error);
            // Check the mongoose virtual title property
            expect(doc.title).to.match(/HESO 253-[0-9]{3} Orienteering, (Fall|Spring) 20[0-9]{2}/);
            return done();
        });
    });
});
