class UserInfo{
    
    constructor(session_id, username){
        this.#session_id = session_id; 
        this.#username = username; 
    }

    get session_id(){
        return this.session_id; 
    }

    get username(){
        return this.username; 
    }
}