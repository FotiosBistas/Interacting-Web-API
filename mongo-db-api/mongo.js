const { MongoClient, ServerApiVersion } = require('mongodb'); 

const uri = "mongodb+srv://Fotis:BF29EXoYjVirEvqB@auebmongodb.fnvhyhf.mongodb.net/?retryWrites=true&w=majority";

function log(text){
    var time = new Date();
    console.log("[" + time.toLocaleTimeString() + "] " + text);
}

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
     * Adds the user specified to the database. 
     * @param {*} client he connection established with the mongodb cluster. 
     * @param {*} user the user that is to be inserted to the database. 
     */
    addUserToDatabase: async function(client, user){
        const newdoc = await client.db("UserInfo").collection("Users").insertOne(user); 
        log("New document created with id: " + newdoc.insertedId);
    },

    /**
     * Finds if user is in the database with a registered password. 
     * @param {*} client the connection established with the mongodb cluster. 
     * @param {*} user the user that is to be found. {username, password}
     */
    isUserinDatabase: async function(client, user){
        let found = null; 
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
        if(!found){
            return false; 
        }
        return found; 
    },

    removeUserFromDatabase: async function(client){

    },

    listDatabases: async function(client){
        const databasesList = await client.db().admin().listDatabases(); 
        databasesList.databases.forEach(db => {
            log(`Listing database with name:- ${db.name}`);
        });
    },

    getCartListSize: async function(client, user){
        const fuser = await this.isUserinDatabase(client, user); 
        const collection  = client.db("UserInfo").collection("Users");
        const cursor = collection.aggregate(
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
        const results = await cursor.toArray();
        if(results.length > 0){
            return results[0].cartSize; 
        }
        return false;
    },

    getProductsFromCart: async function(client, user){
        const fuser = await this.isUserinDatabase(client, user);
        const collection = client.db("UserInfo").collection("Users");
        const res = await collection.findOne({"username": fuser.username}, { "cart": 1, "_id": 0 } )
        if(res){
            return res.cart; 
        }
        return false; 
    },

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
            return;
        } 

        log("Update failed");
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
            return;
        } 
        return true; 
    }

    
}   