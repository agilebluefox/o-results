'use strict()';

const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const mongooseUniqueValidator = require('mongoose-unique-validator');

const schema = new Schema({
    student: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    cardNo: { type: String, default: '' },
    status: { type: Number, min: 0, max: 4, default: 0 },
    course: { type: String, default: '' }
});

schema.plugin(mongooseUniqueValidator);

module.exports = mongoose.model('Result', schema);
