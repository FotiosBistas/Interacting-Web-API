const Cart = require("./Cart.js");

class UserInfo{
    #sessionId;
    #_id
    #username;
    #password; 
    #cart; 

    constructor(sessionId, _id,username, password,cart){
        if(!(cart instanceof Cart)){
            throw new Error("Not instance of cart"); 
        }
        this.#sessionId = sessionId; 
        this.#_id = _id; 
        this.#username = username; 
        this.#password = password; 
        this.#cart = cart; 
    }

    get sessionId(){
        return this.#sessionId; 
    }

    get _id(){
        return this.#_id; 
    }

    get cart(){
        return this.#cart; 
    }

    get password(){
        return this.#password; 
    }

    get username(){
        return this.#username; 
    }
}


module.exports = UserInfo;