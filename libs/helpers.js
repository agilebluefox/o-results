'use strict()';

const logger = require('./logger');

/**
 * Check for duplicate documents in a Mongo DB collection
 * @param {object} entry - The document being compared.
 * @param {object} test - The document properties included in the check.
 * @param {object} model - The name of the collection.
 * @returns {object} - A promise object containing true if duplicates exist.
 */
function checkForDuplicateDocs(entry, test, model) {
    return new Promise((resolve, reject) => {
        logger.info(`Checking for duplicate documents in the collection`);
        model.count(test, (err, count) => {
            logger.info(`The number of duplicate documents in the collection is: ${count}`);
            if (err) reject(err);
            resolve(count > 0);
        });
    });
}

exports.checkForDuplicateDocs = checkForDuplicateDocs;