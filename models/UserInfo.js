const Cart = require("./Cart");

class UserInfo{
    #session_id;
    #username;
    #password; 
    #cart; 

    constructor(session_id, username, password,cart){
        if(!(cart instanceof Cart)){
            throw new Error("Not instance of cart"); 
        }
        this.#session_id = session_id; 
        this.#username = username; 
        this.#password = password; 
        this.#cart = cart; 
    }

    get session_id(){
        return this.#session_id; 
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