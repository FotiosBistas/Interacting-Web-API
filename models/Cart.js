const Product = require("./Product.js");

class Cart{
    #products;
    constructor(products){
        this.#products = products; 
    }

    get products(){
        return this.#products; 
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

    addNewProductFromJSON(product_data){
        const {id,title,cost,subcategory_id, quantity} = product_data; 
        let new_product = new Product(id, title, cost, subcategory_id, quantity); 
        this.addNewProduct(new_product); 
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
            if(prd.id === product.id){
                return prd; 
            }
        });

        //if it exists add 1 to the quantity 
        if(exists){
            exists.addQuantity(); 
        }else{
            this.products.push(product);
        } 
    }
}

module.exports = Cart; 