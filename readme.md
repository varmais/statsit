Statsit
=======

This application is used to fetch team and player data from Esport Arena website. Application scrapes the website based on the given parameters and returns easily readable JSONP-data.

Usage
-----

Currently available parameters are 'lohko' and 'tiimi'

Example:

    http://statsit.herokuapp.com/statsit?lohko=256&tiimi=Melonheads

TTL for caches are 1 hour.
