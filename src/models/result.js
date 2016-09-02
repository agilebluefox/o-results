'use strict()';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongooseUniqueValidator = require('mongoose-unique-validator');

let schema = new Schema( {
    // Each set of results is connected to an event that should be 
    // selected when the results file is imported
    event: { type: Schema.Types.ObjectId, ref: 'Event', required: true, unique: true },
    // Each result has a class selected when the results are imported so 
    // the raw file needs to contain only the results from a single class.
    class: { type: Schema.Types.ObjectId, ref: 'Class', required: true, unique: true },
    // A course identifier has to be added to the raw data before importing
    // to distinguish the course for which the data applies.
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    card: { type: Schema.Types.ObjectId, ref: 'Card', required: true },
    // How do I deal with the actual data associated with the result?
    student: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    control_number: { type: String },
    control_dow: { type: String },
    time_punched: { type: Date } 
});

schema.plugin(mongooseUniqueValidator);

module.exports = mongoose.model('Result', schema);