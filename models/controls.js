'use strict()';

const mongoose = require('mongoose');

const Schema = mongoose.Schema;
// Add the mongoose validator to make sure the unique requirement is enforced.
const mongooseUniqueValidator = require('mongoose-unique-validator');

const schema = new Schema({
    active: { type: Boolean, default: true },
    number: { type: String, required: true, unique: true },
    type: { type: String, required: true },
    points: { type: Number, default: 0 }
});

// Use the plugin method to register the validator
schema.plugin(mongooseUniqueValidator);

module.exports = mongoose.model('Control', schema);
