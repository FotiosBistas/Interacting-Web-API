class Cart{

    constructor(products, UserInfo){
        this.#products = products; 
        this.#UserInfo = UserInfo; 
    }

    get products(){
        return this.products; 
    }

    get UserInfo(){
        return this.UserInfo; 
    }

    addNewProduct(Product){
        if(! Product instanceof Product){
            throw new Error("Product must be an instance of product class");
        }
        
        let exists = this.products.find((product) => {
            if(product.product_id() === Product.product_id()){
                return Product; 
            }
        });

        if(exists){
            exists.addQuantity(); 
        }else{
            this.products.push(Product);
        } 
    }
}

module.exports = Cart; 