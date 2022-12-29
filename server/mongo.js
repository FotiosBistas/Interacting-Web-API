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
     * @param {*} user the user that is to be found. 
     */
    isUserinDatabase: async function(client, user){
        const found = await client.db("UserInfo").collection("Users").findOne({
            username: user.username, 
            password: user.password, 
        }); 
        if(!found){
            return false; 
        }
        return true; 
    },

    removeUserFromDatabase: async function(client){

    },

    listDatabases: async function(client){
        const databasesList = await client.db().admin().listDatabases(); 
        databasesList.databases.forEach(db => {
            log(`Listing database with name:- ${db.name}`);
        });
    }
}   