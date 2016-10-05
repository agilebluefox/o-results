'use strict()';

const logger = require('./logger');
const validator = require('validator');

// Confirm the property is not empty
function isEmpty(param, name) {
    let err = {};
    if (validator.isEmpty(param)) {
        err[name] = {
            "property": name,
            "value": param,
            "message": `The ${name} cannot be empty.`
        }
        return err;
    } else {
        return false;
    }
}

// Confirm the property is a Mongo id
function isNotMongoId(param, name) {
    let err = {};
    if (!validator.isMongoId(param)) {
        err[name] = {
            "property": name,
            "value": param,
            "message": `The ${name} must be a mongo id.`
        }
        return err;
    } else {
        return false;
    }
}

// Confirm the property is an email address
function isNotEmail(param, name) {
    let err = {};
    if (!validator.isEmail(param)) {
        err[name] = {
            "property": name,
            "value": param,
            "message": `The ${name} must be an email address.`
        }
        return err;
    } else {
        return false;
    }
}

// Ensure the property is a Boolean
function isNotBoolean(param, name) {
    let err = {};
    if (!validator.isBoolean(param)) {
        err[name] = {
            "property": name,
            "value": param,
            "message": `The ${name} property must be a boolean.`
        }
        return err;
    } else {
        return false;
    }
}

// Ensure the property is contains only ascii characters
function isNotAscii(param, name) {
    let err = {};
    if (!validator.isAscii(param)) {
        err[name] = {
            "property": name,
            "value": param,
            "message": `The ${name} property contains non-ascii characters.`
        }
        return err;
    } else {
        return false;
    }
}

// Ensure the property is an array
function isNotArray(param, name) {
    let err = {};
    if (!Array.isArray(param)) {
        err[name] = {
            "property": name,
            "value": param,
            "message": `The ${name} property is not an array.`
        }
        return err;
    } else {
        return false;
    }
}

// Check the property has a given length
function isNotLength(param, name, options) {
    let err = {};
    if (!validator.isLength(param, options)) {
        err[name] = {
            "property": name,
            "value": param,
            "message": `The ${name} property must have a length between ${options.min} and ${options.max}.`
        }
        return err;
    } else {
        return false;
    }
}

// Ensure the property is an Integer in the required range
function isNotInt(param, name, options) {
    let err = {};
    if (!validator.isInt(param, options)) {
        err[name] = {
            "property": name,
            "value": param
        }
        logger.debug(options);
        if (options.min || options.max) {
            err[name].message = `The ${name} property must be an integer between ${options.min} and ${options.max}.`;
        } else {
            err[name].message = `The ${name} property must be an integer.`;
        }
        return err;
    } else {
        return false;
    }
}

// Ensure the property is one of the allowed values
function isNotInArray(param, name, options) {
    let err = {};
    if (!validator.isIn(param, options)) {
        err[name] = {
            "property": name,
            "value": param,
            "message": `The ${name} property is not in the array of possible values.`
        }
        return err;
    } else {
        return false;
    }
}

// Check property is a date value
function isNotDate(param, name) {
    let err = {};
    if (!validator.isDate(param)) {
        err[name] = {
            "property": name,
            "value": param,
            "message": `The ${name} property must be a date.`
        }
        return err;
    } else {
        return false;
    }
}

// function to validate the data for a class document
function validateClassDoc(required, optional) {
    // An array to store all the errors
    let errors = [];

    // Iterate through the document properties and validate
    for (let prop in required) {
        // Store the property value in a variable
        let value = required[prop];
        // If the value is undefined, null or not a string...
        if (value !== 'undefined' && typeof value !== 'string') {
            value = value + '';
        }
        // Convert the string to lowercase letters to prevent 
        // validation problems
        value = value.toLowerCase();
        logger.debug(`The value, ${prop} has a value of ${value}`);
        // Start by checking that each property exists
        let empty = isEmpty(value, prop);
        // If a property does not exist, add the error object
        // to the error array.
        if (empty) {
            errors.push(empty);
        }

        // Check the id property for validation errors
        if (prop === 'id') {
            let err = isNotMongoId(value, prop);
            if (err) {
                errors.push(err);
            }
        }

        // Check the year property for validation errors
        if (prop === 'year') {
            let options = {
                min: 2000,
                max: 2100
            };
            let err = isNotInt(value, prop, options);
            if (err) {
                errors.push(err);
            }
        }

        // Check the semester property for validation errors
        if (prop === 'semester') {
            let options = [
                'fall',
                'spring',
                'summer 1',
                'summer 2'
            ];
            let err = isNotInArray(value, prop, options);
            if (err) {
                errors.push(err);
            }
        }

        // Check the prefix property for validation errors
        if (prop === 'prefix') {
            let options = [
                'heso'
            ];
            let err = isNotInArray(value, prop, options);
            if (err) {
                errors.push(err);
            }
        }

        // Check the number property for validation errors
        if (prop === 'number') {
            let options = [
                '253'
            ];
            let err = isNotInArray(value, prop, options);
            if (err) {
                errors.push(err);
            }
        }

        // Check the name property for validation errors
        if (prop === 'name') {
            let options = [
                'orienteering'
            ];
            let err = isNotInArray(value, prop, options);
            if (err) {
                errors.push(err);
            }
        }

        // Check the section property for validation errors
        if (prop === 'section') {
            let options = {
                min: 0,
                max: 999
            };
            let err = isNotInt(value, prop, options);
            if (err) {
                errors.push(err);
            }
        }

    }

     if (optional) {
        for (let prop in optional) {

            let value = optional[prop];

            // Check the active property for validation errors
            if (prop === 'active') {
                let err = isNotBoolean(value, prop);
                if (err) {
                    errors.push(err);
                }
            }
        }
    }

    // combine the properties of the required and optional objects
    let doc = Object.assign({}, required, optional);
    doc.errors = {};
    doc.errors = errors;
    return doc;
}

// function to validate the data for a card document
function validateCardDoc(required, optional) {
    // An array to store all the errors
    let errors = [];

    // Iterate through the document properties and validate
    for (let prop in required) {
        // Store the property value in a variable
        let value = required[prop];
        // If the value is undefined, null or not a string...
        if (value !== 'undefined' && typeof value !== 'string') {
            value = value + '';
        }
        // Convert the string to lowercase letters to prevent 
        // validation problems
        value = value.toLowerCase();
        logger.debug(`The value, ${prop} has a value of ${value}`);
        // Start by checking that each property exists
        let empty = isEmpty(value, prop);
        // If a property does not exist, add the error object
        // to the error array.
        if (empty) {
            errors.push(empty);
        }

        // Check the id property for validation errors
        if (prop === 'id') {
            let err = isNotMongoId(value, prop);
            if (err) {
                errors.push(err);
            }
        }

        // Check the number property for validation errors
        if (prop === 'number') {
            let options = {
                min: 2042891,
                max: 2049265
            };
            let err = isNotInt(value, prop, options);
            if (err) {
                errors.push(err);
            }
        }
    }

    if (optional) {
        for (let prop in optional) {

            let value = optional[prop];

            // Check the active property for validation errors
            if (prop === 'active') {
                let err = isNotBoolean(value, prop);
                if (err) {
                    errors.push(err);
                }
            }
        }
    }

    // combine the properties of the required and optional objects
    let doc = Object.assign({}, required, optional);
    doc.errors = {};
    doc.errors = errors;
    return doc;
}

// function to validate the data for a control document
function validateControlDoc(required, optional) {
    // An array to store all the errors
    let errors = [];

    // Iterate through the document properties and validate
    for (let prop in required) {
        // Store the property value in a variable
        let value = required[prop];
        // If the value is undefined, null or not a string...
        if (value !== 'undefined' && typeof value !== 'string') {
            value = value + '';
        }
        // Convert the string to lowercase letters to prevent 
        // validation problems
        value = value.toLowerCase();
        logger.debug(`The value, ${prop} has a value of ${value}`);
        // Start by checking that each property exists
        let empty = isEmpty(value, prop);
        // If a property does not exist, add the error object
        // to the error array.
        if (empty) {
            errors.push(empty);
        }

        // Check the id property for validation errors
        if (prop === 'id') {
            let err = isNotMongoId(value, prop);
            if (err) {
                errors.push(err);
            }
        }

        // Check the number property for validation errors
        if (prop === 'number') {
            let options = {
                min: 81,
                max: 100
            };
            let err = isNotInt(value, prop, options);
            if (err) {
                errors.push(err);
            }
        }

        // Check the type property for validation errors
        if (prop === 'type') {
            let options = [
                'start',
                'station',
                'clear',
                'finish',
                'control'
            ];
            let err = isNotInArray(value, prop, options);
            if (err) {
                errors.push(err);
            }
        }

        // Check the points property for validation errors
        if (prop === 'points') {
            let options = {
                min: 0
            };
            let err = isNotInt(value, prop, options);
            if (err) {
                errors.push(err);
            }
        }
    }

     if (optional) {
        for (let prop in optional) {

            let value = optional[prop];

            // Check the active property for validation errors
            if (prop === 'active') {
                let err = isNotBoolean(value, prop);
                if (err) {
                    errors.push(err);
                }
            }
        }
    }

    // combine the properties of the required and optional objects
    let doc = Object.assign({}, required, optional);
    doc.errors = {};
    doc.errors = errors;
    return doc;
}

// function to validate the data for a control document
function validateCourseDoc(required, optional) {
    // An array to store all the errors
    let errors = [];

    // Iterate through the document properties and validate
    for (let prop in required) {
        // Store the property value in a variable
        let value = required[prop];
        // If the value is undefined, null or not a string...
        if (value !== 'undefined' && typeof value !== 'string') {
            value = value + '';
        }
        // Convert the string to lowercase letters to prevent 
        // validation problems
        value = value.toLowerCase();
        logger.debug(`The value, ${prop} has a value of ${value}`);
        // Start by checking that each property exists
        let empty = isEmpty(value, prop);
        // If a property does not exist, add the error object
        // to the error array.
        if (empty) {
            errors.push(empty);
        }

        // Check the id property for validation errors
        if (prop === 'id') {
            let err = isNotMongoId(value, prop);
            if (err) {
                errors.push(err);
            }
        }

        // Check the active property for validation errors
        if (prop === 'active' || 'inorder') {
            let err = isNotBoolean(value, prop);
            if (err) {
                errors.push(err);
            }
        }

        if (prop === 'mapdate') {
            let err = isNotDate(value, prop);
            if (err) {
                errors.push(err);
            }
        }

        if (prop === 'location' || 'codename' || 'name') {
            let err = isNotAscii(value, prop);
            if (err) {
                errors.push(err);
            }
        }

        // Check the type property for validation errors
        if (prop === 'type') {
            let options = [
                'score',
                'regular'
            ];
            let err = isNotInArray(value, prop, options);
            if (err) {
                errors.push(err);
            }
        }

        // Check the points property for validation errors
        if (prop === 'points') {
            let options = {
                min: 0
            };
            let err = isNotInt(value, prop, options);
            if (err) {
                errors.push(err);
            }
        }
    }

    if (optional) {
        for (let prop in optional) {
            let value = optional[prop];
            // Validate the controls property if present
            if (prop === 'controls') {
                let err = isNotArray(value, prop);
                if (err) {
                    errors.push(err);
                }
            }
        }
    }

    // combine the properties of the required and optional objects
    let doc = Object.assign({}, required, optional);
    doc.errors = {};
    doc.errors = errors;
    return doc;
}

// function to validate the data for a control document
function validateEventDoc(required, optional) {
    // An array to store all the errors
    let errors = [];

    // Iterate through the document properties and validate
    for (let prop in required) {
        // Store the property value in a variable
        let value = required[prop];
        // If the value is undefined, null or not a string...
        if (value !== 'undefined' && typeof value !== 'string') {
            value = value + '';
        }
        // Convert the string to lowercase letters to prevent 
        // validation problems
        value = value.toLowerCase();
        logger.debug(`The value, ${prop} has a value of ${value}`);
        // Start by checking that each property exists
        let empty = isEmpty(value, prop);
        // If a property does not exist, add the error object
        // to the error array.
        if (empty) {
            errors.push(empty);
        }

        // Check the id property for validation errors
        if (prop === 'id') {
            let err = isNotMongoId(value, prop);
            if (err) {
                errors.push(err);
            }
        }

        if (prop === 'date') {
            let err = isNotDate(value, prop);
            if (err) {
                errors.push(err);
            }
        }

        if (prop === 'name') {
            let err = isNotAscii(value, prop);
            if (err) {
                errors.push(err);
            }
        }

    }

    if (optional) {
        for (let prop in optional) {

            let value = optional[prop];

            // Check the active property for validation errors
            if (prop === 'active') {
                let err = isNotBoolean(value, prop);
                if (err) {
                    errors.push(err);
                }
            }

            // Validate the courses property if present
            if (prop === 'courses') {
                let err = isNotMongoId(value, prop);
                if (err) {
                    errors.push(err);
                }
            }

            // Validate the classes property if present
            if (prop === 'classes') {
                let err = isNotMongoId(value, prop);
                if (err) {
                    errors.push(err);
                }
            }
        }
    }

    // combine the properties of the required and optional objects
    let doc = Object.assign({}, required, optional);
    doc.errors = {};
    doc.errors = errors;
    return doc;
}

// function to validate the data for a control document
function validateStudentDoc(required, optional) {
    // An array to store all the errors
    let errors = [];

    // Iterate through the document properties and validate
    for (let prop in required) {
        // Store the property value in a variable
        let value = required[prop];
        // If the value is undefined, null or not a string...
        if (value !== 'undefined' && typeof value !== 'string') {
            value = value + '';
        }
        // Convert the string to lowercase letters to prevent 
        // validation problems
        value = value.toLowerCase();
        logger.debug(`The value, ${prop} has a value of ${value}`);
        // Start by checking that each property exists
        let empty = isEmpty(value, prop);
        // If a property does not exist, add the error object
        // to the error array.
        if (empty) {
            errors.push(empty);
        }

        // Check the id property for validation errors
        if (prop === 'id') {
            let err = isNotMongoId(value, prop);
            if (err) {
                errors.push(err);
            }
        }

        if (prop === 'unityid') {
            let options = {
                min: 8,
                max: 8
            };
            let err = isNotLength(value, prop, options);
            if (err) {
                errors.push(err);
            }
        }

        if (prop === 'email') {
            let err = isNotEmail(value, prop);
            if (err) {
                errors.push(err);
            }
        }

        if (prop === 'firstname') {
            let err = isNotAscii(value, prop);
            if (err) {
                errors.push(err);
            }
        }

        if (prop === 'lastname') {
            let err = isNotAscii(value, prop);
            if (err) {
                errors.push(err);
            }
        }

        if (prop === 'sex') {
            let options = {
                min: 0,
                max: 1
            };
            let err = isNotInt(value, prop, options);
            if (err) {
                errors.push(err);
            }
        }

        if (prop === 'cls') {
            let err = isNotMongoId(value, prop);
            if (err) {
                errors.push(err);
            }
        }

    }

    if (optional) {
        for (let prop in optional) {

            let value = optional[prop];

            // Check the active property for validation errors
            if (prop === 'active') {
                let err = isNotBoolean(value, prop);
                if (err) {
                    errors.push(err);
                }
            }
        }
    }

    // combine the properties of the required and optional objects
    let doc = Object.assign({}, required, optional);
    doc.errors = {};
    doc.errors = errors;
    return doc;
}

module.exports = validateClassDoc;
module.exports = validateCardDoc;
module.exports = validateControlDoc;
module.exports = validateCourseDoc;
module.exports = validateEventDoc;
// module.exports = validateResultDoc;
module.exports = validateStudentDoc;