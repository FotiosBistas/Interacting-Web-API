const Cart = require("./models/Cart");
const Product = require("./models/Product");
const UserInfo = require("./models/UserInfo");
const mongoDBinteractions = require('./mongo-db-api/mongo.js'); 

const activeUsers = new Map(); 

function log(text){
    var time = new Date();
    console.log("[" + time.toLocaleTimeString() + "] " + text);
}

// utilities for current user session 
// idea is to reduce writes to the database 
module.exports = {

    /**
     * Adds new user to the active user list. If user already exists add the current data into 
     * the mongo db instance.  
     * @param {*} username the username to act as an identifier 
     * @param {*} userInfo userInfo class instance to be inserted 
     */
    async addNewUserInfo(username, userInfo, dbclient){
        //if user exists already add their cart to the database 
        if(!(this.getUser(username))){
            activeUsers.set(username, userInfo); 
            return false; 
        }
        log("Adding new items of user: " + username + " items: " + JSON.stringify(userInfo.cart.createJSONArray()));
        await mongoDBinteractions.processUserInfoandAddToDatabase(dbclient, this.getUser(username)); 
        //this anyways removes the old user 
        activeUsers.set(username, userInfo); 
        //user exists add 
        return true; 
    },

    /**
     * Adds multiple user info in the database 
     * @param {*} dbclient the database connection established
     */
    async addMultipleUserInfo(dbclient){
        for(const [key,value] of activeUsers.entries()){
            log("Adding new items of user: " + key + " items: " + JSON.stringify(value.cart.createJSONArray()));
            await mongoDBinteractions.processUserInfoandAddToDatabase(dbclient, value);
        }
    },

    /**
     * Adds new user to the list of active users 
     * @param {*} username the username of the user 
     * @param {*} user_object the user object {username, password, sessionId, _id}
     */
    addNewUser(username, user_object){
        //this anyways removes the old user 
        activeUsers.set(username, user_object); 
    },

    /**
     * 
     * @param {*} username 
     * @returns a userinfo class instance for the username specified 
     */
    getUser(username){
        return activeUsers.get(username);
    },

    /**
     * Creates a user from the database entry received (res). 
     * @param {*} user user an object with fields{username,sessionid,password,_id} received from the mongodb instance 
     * @param {*} cart the cart object received from the mongodb instance 
     * @returns {*} the user instance created based of the parameters given 
     */
    createUserFromDatabaseEntry(user, cart){

        if(cart){
            let products = cart.map(product => {
                return new Product(product.id, product.title, product.cost, product.subcategory_id, product.quantity);  
            });
            

            let crt = new Cart(products); 

            let usr = new UserInfo(user.sessionId,user._id,user.username,user.password, crt); 
            return usr; 
        }else{
            let usr = new UserInfo(user.sessionId, user._id,user.username, user.password, new Cart([])); 
            return usr; 
        }
    },
}