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
                var temp = cheerio.load(row),
                    matsi = {}, solut;
                if (temp.html().indexOf(tiimi) !== -1) {
                    solut = temp('td');
                    matsi.date = temp(solut[0]).text();
                    matsi.home = temp(solut[2]).text();
                    matsi.away = temp(solut[4]).text();
                    matsi.score = temp(solut[5]).text();
                    matsit.push(matsi);
                }
            });

            statsiElem.find('tr').each(function(index, row) {
                var temp = cheerio.load(row),
                    statsi = {}, solut;
                if (temp.html().indexOf(tiimi) !== -1) {
                    solut = temp('td');
                    statsi.name = temp(solut[1]).text();
                    statsi.goals = temp(solut[3]).text();
                    statsi.assists = temp(solut[4]).text();
                    statsit.push(statsi);
                }
            });

            json.games = matsit;
            json.stats = statsit;

            res.json(json).end();
        }
    });

});

app.listen('3000');

console.log('Magic happens on port 3000');

exports = module.exports = app;
