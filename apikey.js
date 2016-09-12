var express = require('express');
var bodyParser = require('body-parser');
var storage = require('node-persist');
var app = express();
var PORT = process.env.PORT || 80 ;

app.listen(PORT, function(){
  console.log('Application is running and listening on port ' + PORT);
});

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
    var response = {};
    // Store the apikey based on the supplied id
    if (req.body.apikey != ''){
        var newKey = {};
        newKey.apikey = req.body.apikey;
        storage.setItem( req.body.id, newKey);
        res.statusCode = 201;
        response.status = 'key successfully stored'
        res.json( response );
        console.log('Stored apikey for id: ' + req.body.id);
    } else {
        console.log('Cannot store key from request: ' + req.body);
        response.error = 'No key supplied';
        res.statusCode = 404;
        res.json( response );
    }
}

/* Handler for the retrieval of the APIKey for id as in
   GET /apikey/{id}

   Response will be { "apikey" : "APIKEYVALUE" } + HTTP/200 when found
   errormessage and HTTP/404 otherwise
*/
function handlegetkey(req, res){
    var id = req.params.id;
    var obj = storage.getItem( id );
    var response = {};
    if (obj != null){
        response.apikey = obj.apikey;
        res.statusCode = 200;
        res.json(response);
        console.log('Retrieved key for id: ' + id);
    } else {
        response.error = 'No key found';
        res.statusCode = 404;
        res.json( response );
        console.log('Cannot retrieve key for id: ' + id);
    }
}
function handledeletekey(req,res){
    var id = req.params.id;
    storage.removeItemSync(id);
    res.statusCode = 200;
    var response = {};
    response.status = 'APIKey was removed from storage';
    res.json( response);
    console.log('Removal operation completed');
}
app.use(defaultContentTypeMiddleware);
app.use(bodyParser.json({ type: '*/*' }));
app.get('/apikey/:id', handlegetkey);
app.delete('/apikey/:id', handledeletekey);
app.post('/apikey', handlepostkey);
