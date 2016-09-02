'use strict()';

const mongoose = require('mongoose');
const mongodb = require('mongodb');

let uri = 'mongodb://localhost:27017/test';
mongodb.MongoClient.connect(uri, function(error, db) {
    if (error) {
        console.log(error);
        process.exit(1);
    }

    let doc = {
        title: 'Jaws',
        year: 1975,
        director: 'Steven Spielberg',
        rating: 'PG',
        ratings: {
            critics: 80,
            audience: 97
        },
        screenplay: ['Peter Benchley', 'Carl Gotlieb']
    };

    db.collection('movies').insert(doc, function(error, result) {
        if (error) {
            console.log(error);
            process.exit(1);
        }

        let query = { year: 1975, screenplay: 'Peter Benchley' };
        db.collection('movies').find(query).toArray(function(error, docs) {
            if (error) {
                console.log(error);
                process.exit(1);
            }
            console.log('Found docs:');
            docs.forEach(function(doc) {
                console.log(JSON.stringify(doc));
            });
            process.exit(0);
        });
    });
});