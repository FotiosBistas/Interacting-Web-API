const { MongoClient, ServerApiVersion } = require('mongodb'); 

const uri = "mongodb+srv://Fotis:BF29EXoYjVirEvqB@auebmongodb.fnvhyhf.mongodb.net/?retryWrites=true&w=majority";

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
     * @param {*} user the user in the form of {username,password}
     * @throws {*} throws the error caught from the aggregation function. 
     * @returns 
     */
    getCartListSize: async function(client, user){
        const fuser = await this.isUserinDatabase(client, user); 
        const collection  = client.db("UserInfo").collection("Users");
        let cursor = null; 
        try{
            cursor = collection.aggregate(
                [
                    {
                        $match: {username: fuser.username}
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
     * @param {*} user the user in the form of {username,password}
     * @throws  throws the error caught from the query function. 
     * @returns the cart if it is found else false 
     */
    getProductsFromCart: async function(client, user){
        try{
            const fuser = await this.isUserinDatabase(client, user);
            const collection = client.db("UserInfo").collection("Users");
            const res = await collection.findOne({"username": fuser.username}, { "cart": 1, "_id": 0 } )
            if(res){
                return res.cart; 
            }
            return false; 
        }catch(err){
            throw new Error(err); 
        }
    },

    processUserInfoandAddToDatabase: async function(userInfo){

    },

    /**
     * 
     * @param {*} client the database connection we have established 
     * @param {*} product a product class instance 
     * @param {*} user user in the form of {username,password}
     * @returns 
     */
    addProductToCart: async function(client, product, user){
        const fuser = await this.isUserinDatabase(client, user);
        const collection = client.db("UserInfo").collection("Users");
        //if product exists increase quantity 
        const newdoc = await collection.updateOne(
            { _id: fuser._id, "cart.id": product.id },
            { $inc: { "cart.$.quantity": 1 } }
        );

        if (newdoc.modifiedCount > 0) {
            log("Increased quantity of product: " + product.title + " successfully");
            return true;
        } 

        log("Did not increase quantity");
        //if product doesn't exist add to cart 
        const other = await collection.updateOne(
            { _id: fuser._id},
            {
                $push: {
                    cart: {
                        id: product.id,
                        title: product.title,
                        cost: product.cost,
                        subcategory_id: product.subcategory_id,
                        quantity: 1
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