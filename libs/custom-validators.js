'use strict()';

/**
 * The functions in this file provide custom validators for the 
 * node-validator package.
 */

// Validation that confirms a value is among a list of choices
function isIn(options) {
    return {
        validate: validate
    }

    function validate(value, onError) {
        if (value === null || value === undefined) {
            return onError('Required value.');
        }

        if (options.list.indexOf(value) === -1) {
            return onError(options.message || 'The value was not in the list of choices');
        }
        return null;
    }
}

// Validate email addresses using a general regex
function isEmail() {
    return {
        validate: validate
    }

    function validate(value, onError) {
        if (value === null || value === undefined) {
            return onError('Required value.');
        }

        // Basic regex for typical email addresses with limits on size
        let regex = /^[a-z0-9._%+-]{1,50}@[a-z0-9.-]{1,25}\.[a-z]{2,6}$/;

        if (!regex.test(value)) {
            return onError('The email address is not valid.');
        }
        return null;
    }
}

// Validate email addresses using a general regex
function isMongoId() {
    return {
        validate: validate
    }

    function validate(value, onError) {
        if (value === null || value === undefined) {
            return onError('Required value.');
        }

        let regex = /^[0-9a-zA-Z]{24}$/;

        if (!regex.test(value)) {
            return onError('The Mongo Id is not valid.');
        }
        return null;
    }
}

exports.isIn = isIn;
exports.isEmail = isEmail;
exports.isMongoId = isMongoId;