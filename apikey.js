var express = require('express');
var bodyParser = require('body-parser');
var unirest = require("unirest");
var storage = require('node-persist');
var app = express();
var port = process.env.PORT || 8089;

storage.initSync({ dir: 'storage'});
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
function handlepostkey(req, res){
    // Store the apikey based on the supplied id
    if (req.body.apikey != ''){
        var newKey = {};
        newKey.apikey = req.body.apikey;
        storage.setItem( req.body.id, newKey);
        res.statusCode = 201;
        res.json( '{ status: key successfully stored.}')
        console.log('Stored apikey for id: ' + req.body.id);
    } else {
        console.log('Cannot store key from request: ' + req.body);
        res.statusCode = 404;
        res.json( '{ error: No key supplied}')
    }
}

/* Handler for the retrieval of the APIKey for id as in
   GET /apikey/{id}

   Response will be { "apikey" : "APIKEYVALUE" } + HTTP/200 when found
   errormessage and HTTP/404 otherwise
*/
function handlegetkey(req, res){
    var id = req.params.id;
    var apikey = storage.getItem( id );
    if (apikey != null){
        res.statusCode = 200;
        res.json(apikey);
        console.log('Retrieved key for id: ' + id);
    } else {
        console.log('Cannot retrieve key for id: ' + id);
        res.statusCode = 404;
        res.json('{ error: No key found}');
    }
}

app.use(defaultContentTypeMiddleware);
app.use(bodyParser.json({ type: '*/*' }));
app.get('/apikey/:id', handlegetkey);
app.post('/apikey', handlepostkey);

app.listen(port, function(){
  console.log('Application is running and listening on port ' + port);
});
