const express = require('express');
const path = require('path');
const { v4: uuidv4 } = require('uuid'); 
const mongoDBinteractions = require('./mongo-db-api/mongo.js'); 
const activeUsers = require('./active-user-handler.js')
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

/**
 * CartRetrievalService retrieves all the products from the specifed user's cart and 
 * send thems as a json object. 
 */
app.get('/CartRetrievalService', async(request,response)=> {
    log("Received cart retrieval service request");
    const {username, sessionId} = request.query; 

    let user_instance = activeUsers.getUser(username);

    if((user_instance.session_id !== sessionId)){
        response.status(401); 
        return; 
    }
    //if user instance not present fall back to database 
    if(user_instance){
        let products = user_instance.cart.products.map(prod => {
            return {
                id: prod.id, 
                title: prod.title, 
                cost: prod.cost, 
                subcategory_id: prod.subcategory_id, 
                quantity: prod.quantity, 
            };
        }); 
        response.status(200).json(products);
        return; 
    }else{  
        try{
            const res = await mongoDBinteractions.getProductsFromCart(dbclient, {username});

            if(res){
                response.status(200).json(res);
                return; 
            }
            throw new Error("Empty cart"); 
        }catch(err){
            log("Error: " + err + " while trying to retrieve products from cart inside the db")
            response.status(500); 
        }

    }
});

/**
 * Cart size service retrieves all cart size of the specified user 
 */
app.get('/CartSizeService', async(request, response) => {
    log("Received cart size service request");
    const {username, sessionId} = request.query; 
    
    let user_instance = activeUsers.getUser(username); 

    if(user_instance.session_id !== sessionId){
        //return not authorized status 
        response.status(401); 
        return; 
    }
    //if instance exists else fall back to database
    if(user_instance){
        response.status(200).json(user_instance.cart.products.length); 
    }else{
        try{
            const res = await mongoDBinteractions.getCartListSize(dbclient, {username,sessionId});
            if(res){
                response.status(200).json(res); 
                return; 
            }
            throw new Error("Empty cart");
        }catch(err){
            log("Error: " + err + " while trying to retrieve cart size from db");
            response.status(500).json(err); 
    }
}
    
});

/**
 * CartItemService add a new item to the user's cart or increases the quantity of the item 
 */
app.post('/CartItemService', async(request, response) => {
    log("Received cart item service request");
    
    const {product_data, username, sessionId} = request.body; 
    
    let user_instance = activeUsers.getUser(username); 

    if(user_instance.session_id !== sessionId.sessionId){
        //return not authorized status 
        response.status(401); 
        return; 
    }
    //if instance exists else fall back to database
    if(user_instance){
        user_instance.cart.addNewProductFromJSON(product_data); 
    }else{
        const res = await mongoDBinteractions.addProductToCart(dbclient, product_data, {username,sessionId});
        if(res){
            response.status(200); 
        }else{
            response.status(500);
        }
    }
});

/**
 * Login service receives a request from the login form of the user
 * and tries to log in the user into the server based on the credentials given. 
 * Assumes each request is a new user connection(no need to check if user is present already***)
 */
app.post('/LoginService',async (request, response) => {

    log("Received login service request");
    const {username, password, re_password} = request.body; 
    log("Received username: " + username + " and password: " + password + " and re-password: " + re_password);
    //*** retrieve user data 
    try{
        const res = await mongoDBinteractions.isUserinDatabase(dbclient, {username, password});
        if(res){
            let successdata = {sessionId: uuidv4()};
    
            // create user instance 
            let new_active_user = activeUsers.createUserFromDatabaseEntry(
                {
                   username: res.username, 
                   password: res.password, 
                   sessionId: successdata.sessionId, 
                }, res.cart
            ); 
            // add user instance to current users 
            activeUsers.addNewUser(new_active_user.username, new_active_user); 
            //send session id back to the user 
            response.status(200).json(successdata); 
        }else{
            //return not authorized status 
            response.status(401); 
        }
    }catch(err){
        log("Error: " + err + " while trying to retrieve user data from database"); 
        response.status(500);
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