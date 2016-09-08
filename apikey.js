var http = require('http');
var storage = require('node-persist');
var S = require('string');
var PORT = process.env.PORT || 8089;
storage.initSync({ dir: 'storage'});

var server = http.createServer(function (request, response) {
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  response.setHeader('Access-Control-Allow-Credentials', true);

  var requestBody = '';
  request.on('data', function (data) {
    requestBody += data;
  });
  request.on('end', function () {
    handleRequest(request, response, requestBody);
  });
});

function handleRequest(request, response, requestBody) {
  var url = request.url;
  console.log(request.method + ":" + url + ' >>' + requestBody);

  if (request.url == '/apikey'){
    if (request.method == 'POST'){
      var jsonMsg = JSON.parse(requestBody);
      // Store the APIKEY
      if ( jsonMsg.id != null && jsonMsg.apikey != null){
        var newKey = {};
        newKey.apikey = jsonMsg.apikey;
        storage.setItem( jsonMsg.id, newKey);
        response.statusCode = 201;
        response.end( '{ "status" : "key successfully stored"}')
        console.log('Stored apikey for id: ' + jsonMsg.id);
      } 
    } 
  } else {
      if (S(url).startsWith('/apikey/')){
        if (request.method == 'GET'){
          var id = url.split('/')[2];
          console.log('Extracted key from url, id = ' + id);
          var apikey = storage.getItem( id );
          if (apikey != null){
              response.statusCode = 200;
              response.end(JSON.stringify(apikey));
              console.log('Retrieved key for id: ' + id);
          } else {
            response.statusCode = 404;
            response.end('{ "Error" : "Invalid apikey requested!" }');
          }
        } else  {
            response.statusCode = 404;
            response.end('{ "Error" : "Invalid resource requested!" }');
        }
      }
  }
}

server.listen(PORT, function () {
  console.log('Server running at port ' + PORT + ' ...');
});

