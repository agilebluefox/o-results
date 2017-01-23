'use strict()';

const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const mongooseUniqueValidator = require('mongoose-unique-validator');

const schema = new Schema({
    eventId: [{ type: Schema.Types.ObjectId, ref: 'Event'}],
    studentId: [{ type: Schema.Types.ObjectId, ref: 'Student' }],
    cardNo: { type: String },
    status: { type: String },
    course: { type: String },
});

schema.plugin(mongooseUniqueValidator);

module.exports = mongoose.model('Result', schema);
