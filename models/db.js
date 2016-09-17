'use strict()';

const uri = 'mongodb://localhost:27017/o-results-test'; 
const mongoose = require('mongoose');

mongoose.Promise = require('bluebird');

if (mongoose.connection.readyState === 0) {
    mongoose.connect(uri, (error) => {
        if (error) {
            console.log('Connection failed.');
            process.exit(1);
        }
    });
}

module.exports = mongoose;
