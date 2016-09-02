'use strict()';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongooseUniqueValidator = require('mongoose-unique-validator');

let schema = new Schema( {
    // More than one class can participate in an event
    location: { type: String, required: true },
    name: { type: String, required: true },
    type: { type: String, required: true },
    in_order: { type: Boolean, required: true },
    // How do I best store the control and it's point value?
    controls: [ {  
        number: {type: String, required: true}, 
        points: {type: Number, default: 0} 
     } ]
});

schema.plugin(mongooseUniqueValidator);

module.exports = mongoose.model('Event', schema);