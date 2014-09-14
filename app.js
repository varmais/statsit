var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var http = require('http');
var app     = express();

app.get('/statsit', function(req, res){

    var baseUrl = "http://eatalvi14.loiske.net/lohkotilanne.php?lohko=",
        lohko = req.query.lohko,
        tiimi = req.query.tiimi;

    if (!(lohko && tiimi)) {
        res.status(404).end(http.STATUS_CODES[404]);
        return;
    }

    request(baseUrl + lohko, function(err, response, html) {
        if (!err) {

            var $ = cheerio.load(html),
            matsit = [], statsit = [], json = {};

            var matsiElem = $('#toggleText');
            var statsiElem = $('#togglePP');

            matsiElem.find('tr').each(function(index, row) {
                var temp = cheerio.load(row);
                if (temp.html().indexOf(tiimi) !== -1) {
                    matsit.push(temp.html());
                }
            });

            statsiElem.find('tr').each(function(index, row) {
                var temp = cheerio.load(row);
                if (temp.html().indexOf(tiimi) !== -1) {
                    statsit.push(temp.html());
                }
            });

            json.matsit = matsit;
            json.statsit = statsit;

            res.json(json).end();
        }
    });

});

app.listen('8081');

console.log('Magic happens on port 8081');

exports = module.exports = app;
