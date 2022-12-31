
const activeUsers = new Map(); 


module.exports = {

    addNewUser(username, sessionId){
        activeUsers.set(username, sessionId); 
    },

    getUser(username){
        return activeUsers.get(username);
    }
}