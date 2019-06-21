'use strict()';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongooseUniqueValidator = require('mongoose-unique-validator');

const resultSchema = new Schema({
    student: { type: Schema.Types.ObjectId, ref: 'Student', required: true, unique: true },
    cardNo: { type: String, default: '' },
    status: { type: Number, min: 0, max: 3, default: 0 },
    course: { type: String, default: '' }
});

const eventSchema = new Schema({
    active: { type: Boolean, default: true },
    location: { type: String, required: true },
    name: { type: String, required: true },
    date: { type: String, required: true },
    results: [resultSchema]
});

eventSchema.plugin(mongooseUniqueValidator);

module.exports = mongoose.model('Event', eventSchema);
