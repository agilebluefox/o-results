'use strict()';

const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const mongooseUniqueValidator = require('mongoose-unique-validator');

const schema = new Schema({
    active: { type: Boolean, default: true },
    // Each set of results is connected to an event, course, and student
    event: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    card: { type: String, required: true },
    student: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    cn: { type: String, required: true },
    time: { type: Date, required: true }
});

schema.plugin(mongooseUniqueValidator);

module.exports = mongoose.model('Result', schema);
