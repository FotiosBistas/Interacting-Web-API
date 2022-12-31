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
        this.products.push(Product); 
    }
}