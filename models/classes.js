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
// schema.virtual('title').get(() =>
//     `${this.prefix} ${this.number}-${this.section} \
// ${this.name}, ${this.semester} ${this.year}`
// );
schema.virtual('title').get(function () {
    return `${this.prefix} ${this.number}-${this.section} \
${this.name}, ${this.semester} ${this.year}`;
});

module.exports = mongoose.model('Class', schema);
