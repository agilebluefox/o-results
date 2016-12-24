'use strict()';

const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const mongooseUniqueValidator = require('mongoose-unique-validator');

const schema = new Schema({
    active: { type: Boolean, default: true },
    // Unity Id of the student
    unityid: { type: String, required: true, unique: true },
    // The email address is the unityId@ncsu.edu
    email: { type: String, required: true, lowercase: true, unique: true, match: /.+@ncsu.edu/ },
    firstname: { type: String, required: true },
    lastname: { type: String, required: true }
});

schema.plugin(mongooseUniqueValidator);

module.exports = mongoose.model('Student', schema);
