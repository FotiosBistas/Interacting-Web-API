class Product{
    #product_id; 
    #title; 
    #cost; 
    #subcategory;
    #quantity; 
    constructor(product_id, title, cost, subcategory, quantity){
        this.#product_id = product_id; 
        this.#title = title; 
        this.#cost = cost; 
        this.#subcategory = subcategory; 
        this.#quantity = quantity; 
    }

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

    addQuantity(){
        this.quantity++; 
    }
}

module.exports = Product;