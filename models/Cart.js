class Cart{
    #products;
    constructor(products){
        this.#products = products; 
    }

    get products(){
        return this.products; 
    }   

    /**
     * Gets a  list of products and adds them into the cart 
     * @param {*} Products a list of products to be inserted into the cart list array 
     */
    addProducts(Products){
        Products.forEach(product => {
            if(!product instanceof Product){
                throw new Error("Product must be an instance of product class");
            }
            this.addNewProduct(product); 
        });
    } 

    addNewProductFromJSON(id, title, cost, subcategory_id, quantity){
        let new_product = Product(); 
    }

    /**
     * Adds a new product to the product list of the cart 
     * @param {*} product the product to be inserted 
     */
    addNewProduct(product){
        if(!product instanceof Product){
            throw new Error("Product must be an instance of product class");
        }
        
        //find the product based on id 
        let exists = this.products.find((prd) => {
            if(prd.product_id() === product.product_id()){
                return Product; 
            }
        });

        //if it exists add 1 to the quantity 
        if(exists){
            exists.addQuantity(); 
        }else{
            this.products.push(Product);
        } 
    }
}

module.exports = Cart; 