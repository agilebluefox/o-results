'use strict()';

const expect = require('./test-server');
const logger = require('../libs/logger');

// Require models
const Card = require('../models/cards');
const data = require('./data/test-cards.json');

// Insert test data to Card collection
function addCards(done) {
    data.forEach((card) => {
        Card.create({
            number: card.number
        }, (error, entry) => {
            if (error || !entry) logger.error(error);
        });
    });
    return done();
}

describe('Card collection: ', () => {
    before((done) => {
        Card.remove().exec();
        addCards(done);
    });

    it('contains four documents', (done) => {
        Card.find({ active: true }, (error, docs) => {
            if (error) logger.error(error);
            expect(docs.length).to.equal(4);
            return done();
        });
    });

    it('stores the card number as a string', (done) => {
        Card.findOne({}, (error, doc) => {
            if (error) logger.error(error);
            expect(doc.number).to.be.a('string');
            return done();
        });
    });

    it('stores a seven-digit value as the card number', (done) => {
        Card.findOne({}, (error, doc) => {
            if (error) logger.error(error);
            expect(doc.number).to.match(/[0-9]{7}/);
            return done();
        });
    });
});
