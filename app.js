var express = require('express');
var fs      = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var http    = require('http');
var NodeCache = require('node-cache');

var app     = express();
var cache   = new NodeCache({
                stdTTL: 3600, // 1 hour
                checkperiod: 900 // 15 mins
            });

app.set('port', process.env.PORT || 3000);
app.set("jsonp callback", true);

app.get('/statsit', function(req, res) {

    var baseUrl = "http://eatalvi14.loiske.net/lohkotilanne.php?",
        lohko = req.query.lohko,
        tiimi = req.query.tiimi,
        cacheKey = lohko + tiimi;


    if (!(lohko && tiimi)) {
        res.status(404).end(http.STATUS_CODES[404]);
        return;
    }

    cache.get(cacheKey, function(err, val) {

        if (err) {

            console.log(err);
            res.status(404).end(http.STATUS_CODES[404]);
            return;

        } else if (val.hasOwnProperty(cacheKey)) {

            res.jsonp(JSON.stringify(val[cacheKey])).end();
            return;

        } else {

            request(baseUrl + 'lohko=' + lohko, function(err, response, html) {
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

                    cache.set(cacheKey, json, function(err, success) {
                        if (!err && success) {
                            res.jsonp(JSON.stringify(json)).end();
                        }
                    });
                }
            });
        }
    });
});

app.get('/tilanne', function(req, res) {

    var baseUrl = "http://eatalvi14.loiske.net/lohkotilanne.php?",
        lohko = req.query.lohko,
        cacheKey = lohko + '_tilanne';


    if (!(lohko)) {
        res.status(404).end(http.STATUS_CODES[404]);
        return;
    }

    cache.get(cacheKey, function(err, val) {

        if (err) {

            console.log(err);
            res.status(404).end(http.STATUS_CODES[404]);
            return;

        } else if (val.hasOwnProperty(cacheKey)) {

            res.jsonp(JSON.stringify(val[cacheKey])).end();
            return;

        } else {

            request(baseUrl + 'lohko=' + lohko, function(err, response, html) {
                if (!err) {

                    var $ = cheerio.load(html);
                    var $table = $('table', '#keski').first();
                    var $tablehtml = $('<table><thead></thead><tbody></tbody></table>');

                    $tablehtml.find('thead').html($table.find('tr:nth-child(2)'));
                    $tablehtml.find('tbody').html($table.find('tr:nth-child(n+3)'));

                    var json = {
                        html: $tablehtml.html()
                    };
    
                    cache.set(cacheKey, json, function(err, success) {
                        if (!err && success) {
                            res.jsonp(JSON.stringify(json)).end();
                        }
                    });
                }
            });
        }
    });
});

app.get('/flush', function(req, res) {
    cache.flushAll();
    res.send('Success!');
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
