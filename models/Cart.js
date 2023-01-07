const Product = require("./Product.js");
function log(text){
    var time = new Date();
    console.log("[" + time.toLocaleTimeString() + "] " + text);
}
class Cart{
    #products;
    constructor(products){
        this.#products = products; 
    }

    get products(){
        return this.#products; 
    }   

    set products(products){
        this.#products = products; 
    }

    /**
     * 
     * @returns a json array based on the products inside the cart
     */
    createJSONArray(){
        log("Creating json array from cart products");
        return this.products.map(prod => {
            return {
                id: prod.id, 
                title: prod.title, 
                cost: prod.cost, 
                subcategory_id: prod.subcategory_id, 
                quantity: prod.quantity, 
            };
        }); 
    };
    

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
        log("Adding new product into cart instance from json");
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
            log("Found that product exists and adding quantity");
            exists.addQuantity(); 
        }else{
            log("Pushing new product into cart");
            this.products.push(product);
        } 
    }
}

module.exports = Cart; 