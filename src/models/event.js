'use strict()';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongooseUniqueValidator = require('mongoose-unique-validator');

let schema = new Schema( {
    // The event Id can be created using a pattern based on the name and 
    // date when the event is added to the database.
    location: { type: String, required: true },
    name: { type: String, required: true },
    date: { type: Date, required: true },
    // An event can have more than one course
    courses: [{type: Schema.Types.ObjectId, ref: 'Course', required: true}]
});

schema.plugin(mongooseUniqueValidator);

module.exports = mongoose.model('Event', schema);