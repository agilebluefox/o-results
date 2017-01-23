'use strict()';

const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const mongooseUniqueValidator = require('mongoose-unique-validator');

const schema = new Schema({
    active: { type: Boolean, default: true },
    location: { type: String, required: true },
    name: { type: String, required: true },
    date: { type: String, required: true },
    students: [{ type: Schema.Types.ObjectId, ref: 'Student' }],
    results: [{ type: Schema.Types.ObjectId, ref: 'Result' }]
});

schema.plugin(mongooseUniqueValidator);

module.exports = mongoose.model('Event', schema);
