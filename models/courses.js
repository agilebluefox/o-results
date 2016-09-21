'use strict()';

const mongoose = require('mongoose');

const Schema = mongoose.Schema;
// Require the mongoose validator to enforce the unique requirement.
const mongooseUniqueValidator = require('mongoose-unique-validator');

const schema = new Schema({
    active: { type: Boolean, default: true },
    location: { type: String, required: true },
    name: { type: String, required: true },
    // Add the course design date
    mapdate: { type: String, required: true },
    // Add a property to include in the raw data file to create a connection
    // to the course
    codename: { type: String, required: true, unique: true },
    type: { type: String, required: true },
    inorder: { type: Boolean, required: true },
    controls: [
        {
            number: { type: String, required: true },
            type: { type: String, required: true },
            points: { type: Number }
        }
    ]
});

// Register the validator using the plugin method
schema.plugin(mongooseUniqueValidator);

module.exports = mongoose.model('Course', schema);
