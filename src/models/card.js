'use strict()';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongooseUniqueValidator = require('mongoose-unique-validator');

let schema = new Schema( {
    // card number
    number: { type: String, required: true }
});

schema.plugin(mongooseUniqueValidator);

module.exports = mongoose.model('Card', schema);