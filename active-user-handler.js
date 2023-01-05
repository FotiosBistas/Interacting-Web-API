const Cart = require("./models/Cart");
const Product = require("./models/Product");
const UserInfo = require("./models/UserInfo");

const activeUsers = new Map(); 

// utilities for current user session 
// idea is to reduce writes to the database 
module.exports = {

    /**
     * Adds new user to the active user list. If user already exists add the current data into 
     * the mongo db instance.  
     * @param {*} username the username to act as an identifier 
     * @param {*} userInfo userInfo class instance to be inserted 
     */
    addNewUser(username, userInfo){
        
        if(!(this.getUser(username))){
            activeUsers.set(username, userInfo); 
            return false; 
        }
        //this anyways removes the old user 
        activeUsers.set(username, userInfo); 
        //user exists add 
        return true; 
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
     * @param {*} user user an object with fields{username,sessionid,password} received from the mongodb instance 
     * @param {*} cart the cart object received from the mongodb instance 
     * @returns {*} the user instance created based of the parameters given 
     */
    createUserFromDatabaseEntry(user, cart){

        if(cart){
            let products = cart.map(product => {
                return new Product(product.id, product.title, product.cost, product.subcategory_id, product.quantity);  
            });
            

            let crt = new Cart(products); 

            let usr = new UserInfo(user.sessionId,user.username,user.password, crt); 
            return usr; 
        }else{
            let usr = new UserInfo(user.sessionId, user.username, user.password, new Cart([])); 
            return usr; 
        }
    },
}