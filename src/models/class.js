'use strict()';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let schema = new Schema( {
    year: { type: Number, required: true },
    semester: { type: String, required: true },
    prefix: { type: String, required: true },
    number: { type: String, required: true },
    name: { type: String, required: true },
    section: { type: String, required: true },
    events: [ { type: Schema.Types.ObjectId, ref: 'Event' } ]
});

module.exports = mongoose.model('Class', schema);