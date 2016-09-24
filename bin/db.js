'use strict()';

const uri = 'mongodb://localhost:27017/o-results-test';
const mongoose = require('mongoose');
const logger = require('../libs/logger');

mongoose.Promise = require('bluebird');

if (mongoose.connection.readyState === 0) {
    mongoose.connect(uri, (error) => {
        if (error) {
            logger.error('Connection failed.');
            process.exit(1);
        }
    });
}

module.exports = mongoose;
