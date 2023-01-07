const { MongoClient, ServerApiVersion } = require('mongodb'); 

const uri = "mongodb+srv://Fotis:BF29EXoYjVirEvqB@auebmongodb.fnvhyhf.mongodb.net/?retryWrites=true&w=majority";
//hi
function log(text){
    var time = new Date();
    console.log("[" + time.toLocaleTimeString() + "] " + text);
}

// all mongodb interactions are encapsulated here 
module.exports = {


    /**
     * Connects the server to the database cluster. 
     * @returns the client connection to the cluster
     * @throws the error caught by trying to connect to the database
     */
    connect: async function(){
        try{
            return await new MongoClient(uri).connect(); 
        }catch(err){
            throw new Error("Error: " + err + " while connecting to database"); 
        }
    },

    /**
     * Adds the user specified to the database. (not used)
     * @param {*} client he connection established with the mongodb cluster. 
     * @param {*} user the user that is to be inserted to the database. 
     */
    addUserToDatabase: async function(client, user){
        const newdoc = await client.db("UserInfo").collection("Users").insertOne(user); 
        log("New document created with id: " + newdoc.insertedId);
    },

    /**
     * Finds if user is in the database with a registered password. (we assume usernames are unique) 
     * @param {*} client the connection established with the mongodb cluster. 
     * @param {*} user the user that is to be found. {username, password}
     * @throws {*} throws error caught from the database interaction. 
     * @returns {*} returns the user if found else it returns false. 
     */
    isUserinDatabase: async function(client, user){
        let found = null; 
        try{
            if(!('password' in user)){
                found = await client.db("UserInfo").collection("Users").findOne({
                    username: user.username, 
                }); 
            }else{
                found = await client.db("UserInfo").collection("Users").findOne({
                    username: user.username, 
                    password: user.password, 
                }); 
            }
        }catch(err){
            throw new Error(err); 
        }

        if(!found){
            return false; 
        }
        return found; 
    },

    listDatabases: async function(client){
        const databasesList = await client.db().admin().listDatabases(); 
        databasesList.databases.forEach(db => {
            log(`Listing database with name:- ${db.name}`);
        });
    },

    /**
     * Retrieve the cart list size of the user from the mongodatabase. 
     * @param {*} client the database connection we have established 
     * @param {*} user the user in the form of {username,password, sessionId,_id, cart(boolean value)}
     * @throws {*} throws the error caught from the aggregation function. 
     * @returns 
     */
    getDatabaseCartListSize: async function(client, user){
        /* const fuser = await this.isUserinDatabase(client, user);  */
        // Check if the `cart` field exists in the user's document
        if(!user.cart){
            return 0; 
        }
        let cursor = null; 
        try{
            const collection  = client.db("UserInfo").collection("Users");
            
            cursor = collection.aggregate(
                [
                    {
                        $match: {_id: user._id}
                    },
                    {
                        $project: {
                            cartSize: { $size: "$cart" }
                        }
                    }
                ]
            );
        }catch(err){
            throw new Error(err); 
        }
        const results = await cursor.toArray();
        if(results.length > 0){
            return results[0].cartSize; 
        }
        return 0;
    },

    /**
     * Retrieves all the products from the user's cart inside the database. 
     * @param {*} client  the database connection we have established  
     * @param {*} user the user in the form of {username,password, sessionId,_id, cart(boolean value)}
     * @throws  throws the error caught from the query function. 
     * @returns the cart if it is found else false 
     */
    getProductsFromDatabaseCart: async function(client, user){
        if(!user.cart){
            return "No products exists in the cart"
        }
        try{
            /* const fuser = await this.isUserinDatabase(client, user); */
            const collection = await client.db("UserInfo").collection("Users");
            const res = await collection.findOne({"_id": user._id}, { "cart": 1, "_id": 0 } )
            if(res.cart){
                return res.cart; 
            }
            return false; 
        }catch(err){
            throw new Error(err); 
        }
    },

    /**
     * Takes a user info class instance and adds into the database. 
     * @param {*} client the database connection we have established 
     * @param {*} userInfo a user info class instance 
     * @returns True if the products are successfully added else returns false 
     */
    processUserInfoandAddToDatabase: async function(client, userInfo){
        try{
            let products = userInfo.cart.createJSONArray();
            let user = {
                username: userInfo.username, 
                password: userInfo.password, 
                sessionId: userInfo.sessionId, 
                _id: userInfo._id, 
            };
            for(const product of products){
                log("Adding product: " + JSON.stringify(product) + " to database");
                let op = await this.addProductObjectDatabaseToCart(client,product, user);  
                if(op){
                    log("Success adding or updating product: " + JSON.stringify(product) + " to database");
                }else{
                    log("Failed adding or updating product: " + JSON.stringify(product) + " to database");
                }   
            }
        }catch(err){
            log("Error: " + err + " while adding user info to database"); 
        }
        
    },

    /**
     * Adds product to user's cart inside the database. If the product exists it increases the quantity. 
     * If the product doesn't exist it just inserts it into the cart 
     * @param {*} client the database connection we have established 
     * @param {*} product a product object {id,title,cost,subcategory_id}
     * @param {*} user user in the form of {username,password, sessionId,_id, cart(boolean value)}
     * @returns true if any of the two operations were successful else returns false 
     */
    addProductObjectDatabaseToCart: async function(client, product, user){
        const collection = client.db("UserInfo").collection("Users");
        //if product exists increase quantity 
        let quantity = 1; 
        let newdoc = null; 
        if('quantity' in product){
            quantity = product.quantity;
            //if quantity is present meaning the class cart instance is running
            //all the addition operations are running locally so you must $set 
            newdoc = await collection.updateOne(
                { _id: user._id, "cart.id": product.id },
                { $set: { "cart.$.quantity": quantity } }
            ); 
        }else{
            //if quantity is not present meaning the class cart instance is not running
            //all the addition operations are not running locally so you must $inc 
            newdoc = await collection.updateOne(
                { _id: user._id, "cart.id": product.id },
                { $inc: { "cart.$.quantity": quantity } }
            ); 
        }
        

        if (newdoc && (newdoc.modifiedCount > 0 || newdoc.matchedCount > 0)) {
            log("Increased quantity of product: " + product.title + " successfully");
            return true;
        } 

        log("Did not increase quantity");
        //if product doesn't exist add to cart 
        const other = await collection.updateOne(
            { _id: user._id},
            {
                $push: {
                    cart: {
                        id: product.id,
                        title: product.title,
                        cost: product.cost,
                        subcategory_id: product.subcategory_id,
                        quantity: quantity
                    }
                },
            },
        );
        if (other.modifiedCount > 0) {
            log("Added new product to users cart: " + product.title + " successfully");
            return true;
        } 
        return false; 
    }

    
}   