var request = require('request');
var crypto = require('crypto');
var url = require('url');
var http = require('http');

var $URL = "http://cloud.earthmine.com/service",
  $KEY = "qzuhqdib7ugtvlvxymjfn26a",
  $SECRET = "jyH8f9wIQ5";


exports.route = function(app) {


  app.post('/api', function(req, res) {

    var timestamp = Math.round(new Date().getTime() / 1000);
    var sig = crypto.createHash('md5').update($KEY + $SECRET + timestamp)
      .digest('hex');

    console.log('request body', req.body);

    var options = {
      method: "POST",
      url: $URL,
      qs: {
        'sig': sig,
        'timestamp': timestamp,
        'key': $KEY
      },
      json: req.body,
      headers: {
        'x-earthmine-auth-id': $KEY
      }
    };

    request(options, function(error, response, body) {
      if (!error && response.statusCode == 200) {
        console.log('response body:', body);
        res.json(body);
      }
    });

  });

  app.get('/asset/:id', function(req, res) {
    request({
      method: "GET",
      url: $URL,
      qs: {
        'request': req.params.id
      }
    }).pipe(res);
  });
};