class Product{
    #id; 
    #title; 
    #cost; 
    #subcategory_id;
    #quantity; 

    constructor(id, title, cost, subcategory_id, quantity){
        this.#id = id; 
        this.#title = title; 
        this.#cost = cost; 
        this.#subcategory_id = subcategory_id;
        if(!quantity){
            this.#quantity = 1;
        }else{
            this.#quantity = quantity; 
        }
         
        
    }

    /**
     * Returns the product id 
     */
    get id(){
        return this.#id; 
    }

    get title(){
        return this.#title; 
    }
    
    get cost(){
        return this.#cost; 
    }

    get quantity(){
        return this.#quantity; 
    }
    
    get subcategory_id(){
        return this.#subcategory_id; 
    }

    /**
     * Adds 1 to the quantity of the specific product 
     */
    addQuantity(){
        //if quantity exists add one 
        if(this.#quantity){
            this.#quantity++; 
            return; 
        }
        this.#quantity = 1; 
    }
}

module.exports = Product;