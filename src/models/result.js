'use strict()';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongooseUniqueValidator = require('mongoose-unique-validator');

let schema = new Schema( {
    // Each set of results is connected to an event that should be 
    // selected when the results file is imported
    event: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
    // A course identifier has to be added to the raw data before importing
    // to distinguish the course for which the data applies or a method of 
    // informing the app of the course parameters is needed. The app could
    // determine the course on it's own by analyzing the data. 
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    card: { type: Number, required: true },
    student: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    cn: { type: String },
    time: { type: Date } 
});

schema.plugin(mongooseUniqueValidator);

module.exports = mongoose.model('Result', schema);