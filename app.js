var express = require('express');
var bodyParser = require('body-parser');
var unirest = require("unirest");
var storage = require('node-persist');
var app = express();

var args = process.argv.slice(2);
// for local tests you can set and export the environment variable
if (!args[0]) {
  // If the port is not passed in, then will check for APIKEY_LISTEN_PORT env variable
  if (!process.env.APIKEY_LISTEN_PORT) {
    //Cannot resolve the port, so raising the exception
    console.log('Usage: node app.js <port>');
    return;
  } else {
    //Port was not passed in, but env variable is set, so taking that.
    args[0] = process.env.APIKEY_LISTEN_PORT;
  }
}

var port = args[0];
storage.initSync({ dir: 'storage'});
app.use(defaultContentTypeMiddleware);
app.use(bodyParser.json({ type: '*/*' }));
/* Accepting any type and assuming it is application/json, otherwise the caller
 *    is forced to pass the content-type specifically.
 *    */
function defaultContentTypeMiddleware (req, res, next) {
  req.headers['content-type'] = req.headers['content-type'] || 'application/json';
  next();
}

/* Handler for the storage of a new apikey for the specified id:
   Sample payload:
   { "id"     : "MeMyselfAndI"
   , "apikey" : "OpenSesame"
   }
 */
app.post('/apikey', function (req, res){
    // Store the apikey based on the supplied id
    if (req.body.apikey != ''){
        var newKey = {};
        newKey.apikey = req.body.apikey;
        storage.setItem( req.body.id, newKey);
        res.statusCode = 201;
        res.json( '{ status: key successfully stored.}')
    } else {
        console.log('Cannot store key from request: ' + req.body);
        res.statusCode = 404;
        res.json( '{ error: No key supplied}')
    }
});

/* Handler for the retrieval of the APIKey for id as in
   GET /apikey/{id}

   Response will be { "apikey" : "APIKEYVALUE" } + HTTP/200 when found
   errormessage and HTTP/404 otherwise
*/
app.get('/apikey/:id', function(req, res){
    var id = req.params.id;
    var apikey = storage.getItem( id );
    if (apikey != null){
        res.statusCode = 200;
        res.json(apikey);
    } else {
        console.log('Cannot retrieve key for id: ' + id);
        res.statusCode = 404;
        res.json('{ error: No key found}');
    }
});
app.listen(port);
console.log('APIKey microservice listening on port ' + port);
