'use strict()';

// Require assertion library
const expect = require('chai').expect;

// Require models

// Setup components to test
describe('Test file is ready', function() {
    it('ready', function(){
        let ar = [];
        expect(ar).to.be.empty;
        console.log('The test file is ready to add some tests!');
    });
});