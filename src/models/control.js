'use strict()';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongooseUniqueValidator = require('mongoose-unique-validator');

let schema = new Schema( {
    number: { type: String, required: true, unique: true }
});

schema.plugin(mongooseUniqueValidator);

module.exports = mongoose.model('Control', schema);