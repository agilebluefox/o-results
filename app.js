'use strict()';

const express = require('express');
const path = require('path');
// const favicon = require('serve-favicon');
// const expressWinston = require('express-winston');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const db = require('./models/db'); // eslint-disable-line

// Prepare routes
const routes = require('./routes/index');
const users = require('./routes/users');
const classes = require('./routes/classes');
const cards = require('./routes/cards');
const controls = require('./routes/controls');
const courses = require('./routes/courses');
const events = require('./routes/events');
const results = require('./routes/results');
const students = require('./routes/students');

// Load the app
const app = express();

const logger = require('./logger');

logger.info('Hello world');
logger.warn('Warning message');
logger.debug('Debugging info');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Setup logging
// Place the express-winston logger before the router.
// app.use(expressWinston.logger({
//   transports: [
//     new winston.transports.Console({
//       json: true,
//       colorize: true
//     })
//   ]
// }));

// // Place the express-winston errorLogger after the router.
// app.use(expressWinston.errorLogger({
//   transports: [
//     new winston.transports.Console({
//       json: true,
//       colorize: true
//     })
//   ]
// }));

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);
app.use('/classes', classes);
app.use('/cards', cards);
app.use('/controls', controls);
app.use('/courses', courses);
app.use('/events', events);
app.use('/results', results);
app.use('/students', students);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use((err, req, res, next) => { // eslint-disable-line
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use((err, req, res, next) => { // eslint-disable-line
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;
