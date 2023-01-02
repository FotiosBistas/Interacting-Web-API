const express = require('express');
const path = require('path');
const { v4: uuidv4 } = require('uuid'); 
const mongoDBinteractions = require('./mongo-db-api/mongo.js'); 
const activeUsers = require('./active-user-handler.js')
const Product = require('./models/Product.js');
const { response } = require('express');
const app = express();
const port = 8080;

let ___dirname = "../public"


function log(text){
    var time = new Date();
    console.log("[" + time.toLocaleTimeString() + "] " + text);
}
// connect to the mongodb cluster
var dbclient = null; 


const server = app.listen(port, async () => {
    log(`App listening on port ${port}`);
    dbclient = await mongoDBinteractions.connect(); 
    log('Successfully connected to mongo db database');
});


app.use(express.static('public'));

// parse url-encoded content from body
app.use(express.urlencoded({ extended: false }));

// parse application/json content from body
app.use(express.json()) ;

app.get('/CartRetrievalService', async(request,response)=> {
    log("Received cart retrieval service request");
    const {username, sessionId} = request.query; 

    if(!(activeUsers.getUser(username) === sessionId)){
        response.status(401); 
        return; 
    }

    const res = await mongoDBinteractions.getProductsFromCart(dbclient, {username});

    if(res){
        response.status(200).json(res);
        return; 
    }

    response.status(500); 
});

app.get('/CartSizeService', async(request, response) => {
    log("Received cart size service request");
    const {username, sessionId} = request.query; 
    
    if(!(activeUsers.getUser(username) === sessionId)){
        //return not authorized status 
        response.status(401); 
        return; 
    }

    const res = await mongoDBinteractions.getCartListSize(dbclient, {username,sessionId});
    if(res){
        response.status(200).json(res); 
        return; 
    }
    response.status(500); 
});

app.post('/CartItemService', async(request, response) => {
    log("Received cart item service request");
    
    const {product_data, username, sessionId} = request.body; 

    if(!(activeUsers.getUser(username) === sessionId)){
        //return not authorized status 
        response.status(401); 
        return; 
    }
    const res = await mongoDBinteractions.addProductToCart(dbclient, product_data, {username,sessionId});
    if(res){
        response.status(200); 
    }else{
        response.status(500);
    }
});

app.post('/LoginService',async (request, response) => {

    log("Received login service request");
    const {username, password, re_password} = request.body; 
    log("Received username: " + username + " and password: " + password + " and re-password: " + re_password);
    //TODO call mongoDB 
    const res = await mongoDBinteractions.isUserinDatabase(dbclient, {username, password});
    if(res){
        let successdata = {sessionId: uuidv4()};
        activeUsers.addNewUser(username, successdata.sessionId);
        response.status(200).json(successdata); 
    }else{
        //return not authorized status 
        response.status(401); 
    }
}); 

app.get('/', (req, res) => {

    log("Received get request for index.html");
    var options = {
        root: path.join(___dirname, 'public'), 
    }

    res.sendFile('index.html', options, function(err){
        log(err)
    })

})


process.on('SIGINT',async () => {
    log('Received SIGINT signal, shutting down server...');
    if(dbclient){
        log('Shutting down database client');
        dbclient.close();
    }
    server.close(() => {
      log('Server shut down gracefully');
      process.exit(0);
    });
  });