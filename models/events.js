'use strict()';

const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const mongooseUniqueValidator = require('mongoose-unique-validator');

const schema = new Schema({
    active: { type: Boolean, default: true },
    location: { type: String, required: true },
    name: { type: String, required: true },
    date: { type: Date, required: true },
    students: [{ type: Schema.Types.ObjectId, ref: 'Student' }]
});

schema.plugin(mongooseUniqueValidator);

module.exports = mongoose.model('Event', schema);
