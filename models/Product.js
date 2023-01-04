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
        this.#quantity = quantity; 
    }

    /**
     * Returns the product id 
     */
    get product_id(){
        return this.product_id; 
    }

    get title(){
        return this.title; 
    }
    
    get cost(){
        return this.cost; 
    }
    
    get subcategory(){
        return this.subcategory; 
    }

    /**
     * Adds 1 to the quantity of the specific product 
     */
    addQuantity(){
        this.quantity++; 
    }
}

module.exports = Product;