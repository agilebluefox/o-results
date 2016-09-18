'use strict()';

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const schema = new Schema({
    year: { type: Number, required: true },
    semester: { type: String, required: true },
    prefix: { type: String, required: true },
    number: { type: String, required: true },
    name: { type: String, required: true },
    section: { type: String, required: true }
});

// Create a unique title property for the class
schema.virtual('title').get(function () {
    const title = `${this.prefix} ${this.number}-${this.section} \
${this.name}, ${this.semester} ${this.year}`;
    return title;
});

module.exports = mongoose.model('Class', schema);
