'use strict()';

const setup = require('./setup-tests');
// Require assertion library
const expect = require('chai').expect;

// Load the mongoose library
const mongoose = require('mongoose');

// Require models
const Card = require('../src/models/card');
const data = require('./data/test-card.json');

// Insert test data to Card collection
function addCards(data) {
    data.forEach(function(card) {
        Card.create({
            number: card.number
        }, function(error, card) {
            if (error) console.log(error);
        });
    });
    return;
}

describe('Card collection: ', function() {
    before(function(done) {
        Card.remove().exec();
        addCards(data);
        return done();
    });

    it('contains four documents', function(done) {
        Card.find({}, function(error, docs) {
            if(error) console.log(error);
            expect(docs.length).to.equal(4);
            return done();
        });
    });

    it('stores the card number as a string', function(done) {
        Card.findOne({}, function(error, doc) {
            if (error) console.log(error);
            expect(doc.number).to.be.a('string');
            return done();
        });
    });

    it('stores a seven-digit value as the card number', function (done) {
        Card.findOne({}, function(error, doc) {
            if (error) console.log(error);
            expect(doc.number).to.match(/[0-9]{7}/);
            return done();
        });
    });
});