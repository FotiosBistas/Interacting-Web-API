const express = require('express');
const path = require('path');
const { v4: uuidv4 } = require('uuid'); 
const mongoDBinteractions = require('./mongo-db-api/mongo.js'); 
const app = express();
const port = 8080;

let ___dirname = "../public"



function log(text){
    var time = new Date();
    console.log("[" + time.toLocaleTimeString() + "] " + text);
}
// connect to the mongodb cluster
var dbclient = null; 


app.listen(port, async () => {
    log(`App listening on port ${port}`);
    dbclient = await mongoDBinteractions.connect(); 
});


app.use(express.static('public'));

// parse url-encoded content from body
app.use(express.urlencoded({ extended: false }));

// parse application/json content from body
app.use(express.json()) ;

app.post('/CartItemService', async(request, response) => {
    log("Received cart item service request");
    
    const {product_data, username, sessionId} = request.body; 
    
});

app.post('/LoginService',async (request, response) => {

    log("Received login service request");
    const {username, password, re_password} = request.body; 
    log("Received username: " + username + " and password: " + password + " and re-password: " + re_password);
    //TODO call mongoDB 
    const res = await mongoDBinteractions.isUserinDatabase(dbclient, {username, password});
    if(res){
        let successdata = {sessionId: uuidv4()};
        response.status(200).json(successdata); 
    }else{
        //return not authorized status 
        response.status(401); 
    }
}); 

app.get('/', (req, res) => {

    
    var options = {
        root: path.join(___dirname, 'public'), 
    }

    res.sendFile('index.html', options, function(err){
        log(err)
    })

})