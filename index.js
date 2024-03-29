const express = require('express');
const path = require('path');
const { v4: uuidv4 } = require('uuid'); 
const mongoDBinteractions = require('./mongo-db-api/mongo.js'); 
const activeUsers = require('./active-user-handler.js')
const app = express();
const port = 8080;

let ___dirname = "../public"

//When this is enabled the server works as if there was no mongodb and after 
//the server shutdowns on the SAME user (with username) reconnects everything in the cart
//is inserted into the database 
//if this is not enabled everything sent from teh user is automatically inserted 
//into the database
let batchWrites = false; 

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
    log("Received username: " + username + " session id: " + sessionId); 

    let user_instance = activeUsers.getUser(username);

    if((!user_instance || user_instance.sessionId !== sessionId)){
        log("User instance was null or local session id was different that the one received"); 
        response.status(401).json("User instance was null or local session id was different that the one received"); 
        return; 
    }
    
    if(batchWrites){
        log("Sending products of user's cart to user");
        response.status(200).json(user_instance.cart.createJSONArray()); 
        log("Sent the products");
        return; 
    }else{  
        try{
            log("Sending products of user's cart to user");
            const res = await mongoDBinteractions.getProductsFromDatabaseCart(dbclient, user_instance);
            log("Sent the products");
            if(res){
                response.status(200).json(res);
                return; 
            }
            throw new Error("Empty cart"); 
        }catch(err){
            log("Error: " + err + " while trying to retrieve products from cart inside the db")
            response.status(500).json(err); 
        }

    }
});

/**
 * Cart size service retrieves all cart size of the specified user 
 */
app.get('/CartSizeService', async(request, response) => {
    log("Received cart size service request");
    const {username, sessionId} = request.query; 
    log("Received username: " + username + " session id: " + sessionId); 

    let user_instance = activeUsers.getUser(username); 

    if(!user_instance || user_instance.sessionId !== sessionId){
        //return not authorized status 
        log("User instance was null or local session id was different that the one received"); 

        response.status(401).json("User instance was null or local session id was different that the one received");
        return; 
    }
    if(batchWrites){
        log("Sending user instance cart->products length");
        response.status(200).json(user_instance.cart.products.length); 
        log("Sent cart product length to user");
    }else{
        try{
            log("Sending user instance cart->products length");
            const res = await mongoDBinteractions.getDatabaseCartListSize(dbclient, user_instance);
            log("Sent cart product length to user");
            if(res){
                response.status(200).json(res); 
            }else if(res == 0){
                response.status(200).json(res); 
            }
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
    
    log("Received username: " + username + " session id: " + sessionId); 
    let user_instance = activeUsers.getUser(username); 
    
    if(!user_instance || user_instance.sessionId !== sessionId){
        //return not authorized status
        log("User instance was null or local session id was different that the one received"); 
        response.status(401).json("User instance was null or local session id was different that the one received"); 
        return; 
    }

    if(batchWrites){
        log("Adding new product into cart from json data");
        user_instance.cart.addNewProductFromJSON(product_data); 
        response.status(200).json("Added product"); 
        log("Added new product to cart instance");
    }else{
        try{
            log("Adding new product into cart from json data");
            //set true because user has a cart now 
            user_instance.cart = true; 
            const res = await mongoDBinteractions.addProductObjectDatabaseToCart(dbclient, product_data, user_instance);
            log("Added new product to cart");
            if(res){
                response.status(200).json("Added product"); 
                return; 
            }
            throw new Error("Failed to add or update collection"); 
        }catch(err){
            log("Error: " + err + " while trying to add or update collection");
            response.status(500).json(err); 
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
            //if cart exists add boolean value to it 
            let cart = false; 
            if(res.cart){
                cart = true; 
            }
            if(!batchWrites){
                log("Adding new user to simple map"); 
                activeUsers.addNewUser(username, {
                    _id: res._id, 
                    username: res.username, 
                    password: res.password, 
                    cart: cart, 
                    sessionId: successdata.sessionId, 
                }); 
            }else{
                // create user instance 
                let new_active_user = activeUsers.createUserFromDatabaseEntry(
                    {
                    username: res.username, 
                    password: res.password, 
                    _id: res._id, 
                    sessionId: successdata.sessionId, 
                    }, res.cart
                ); 
                // add user instance to current users 
                log("Adding new user to complex map"); 
                activeUsers.addNewUserInfo(new_active_user.username, new_active_user, dbclient); 
                //send session id back to the user 
            }
            response.status(200).json(successdata); 
            log("Added new user successfully");
        }else{
            //return not authorized status 
            response.status(401).json("User was not found in database"); 
        }
    }catch(err){
        log("Error: " + err + " while trying to retrieve user data from database"); 
        response.status(500).json(err);
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
    if(batchWrites){
        await activeUsers.addMultipleUserInfo(dbclient); 
    }
    if(dbclient){
        log('Shutting down database client');
        dbclient.close();
    }
    server.close(() => {
      log('Server shut down gracefully');
      process.exit(0);
    });
});