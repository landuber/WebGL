var express = require('express');
var apiproxy = require('./service/apiproxy');
var http = require('http');
var path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'build')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// route to api
apiproxy.route(app);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});