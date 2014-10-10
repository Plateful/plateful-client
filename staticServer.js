var http = require('http');
var ecstatic = require('ecstatic');

var staticRoot = 'www';
var port = process.env.PORT || 4400;

http.createServer(ecstatic({root: staticRoot})).listen(port);
console.log("HTTP server listening on\n  => http://localhost:" + port + "/\nCTRL + C to shutdown");
