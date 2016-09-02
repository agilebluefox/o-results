'use strict()';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// Require the mongoose validator to enforce the unique requirement.
const mongooseUniqueValidator = require('mongoose-unique-validator');

let schema = new Schema( {
    location: { type: String, required: true },
    name: { type: String, required: true },
    type: { type: String, required: true },
    in_order: { type: Boolean, required: true },
    controls: [ 
        { 
            number: { type: String, required: true, unique: true },
            type: { type: String, required: true, unique: true },
            points: { type: Number }
        }
     ]
});


// Register the validator using the plugin method
schema.plugin(mongooseUniqueValidator);

module.exports = mongoose.model('Course', schema);