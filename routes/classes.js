'use strict()';

const express = require('express');

const router = express.Router();

const mongoose = require('mongoose'); //mongo connection
const bodyParser = require('body-parser'); //parses information from POST
const methodOverride = require('method-override'); //used to manipulate POST

module.exports = router;
