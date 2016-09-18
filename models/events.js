'use strict()';

const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const mongooseUniqueValidator = require('mongoose-unique-validator');

const schema = new Schema({
    location: { type: String, required: true },
    name: { type: String, required: true },
    date: { type: Date, required: true },
    // An event can have more than one course
    courses: [{ type: Schema.Types.ObjectId, ref: 'Course' }],
    // more than one class can participate in an event
    classes: [{ type: Schema.Types.ObjectId, ref: 'Class' }]
});

schema.plugin(mongooseUniqueValidator);

module.exports = mongoose.model('Event', schema);
