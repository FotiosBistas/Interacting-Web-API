
function log(text){
    var time = new Date();
    console.log("[" + time.toLocaleTimeString() + "] " + text);
}


Handlebars.registerHelper('makeRadio', function(name, options){
    let html = '';
    for (let i = 0; i < options.length; i++) {
        let option = options[i];
        html += `
        <input type="radio" data-category="${option.category_id}" name="${name}" id="${option.id}">
        <label for="${option.id}">${option.title}</label>
        `
    }
    return new Handlebars.SafeString(html);
});


let sessionId = null; 
let cart = null; 
let username = null;
let cartSize = null; 

//url params contain categoryId: http://127.0.0.1:8080/category.html?categoryId=1
let params = new URLSearchParams(window.location.search);
let categoryId = params.get('categoryId'); 

//server url e.g. 127.0.0.1:8080 
let server_url = `${document.location.hostname}:${document.location.port}`; 

let url_subcategories = new URL(`https://wiki-shop.onrender.com/categories/${categoryId}/subcategories`); 
let url_subcategories_products = new URL(`https://wiki-shop.onrender.com/categories/${categoryId}/products`);
let url_login_service = new URL(`${document.location.protocol}//${server_url}/LoginService`);
let url_cart_item_service = new URL(`${document.location.protocol}//${server_url}/CartItemService`); 

/**
 * Uses the fetch api to request data from the server and retrieve them 
 * @param {*} url the url we want to retrieve the data from 
 * @param {*} options the options that are specified in the http header 
 * @returns the data received 
 * @throws the error caught by the fetch function or the response.json() 
 */
async function fetchAsync(url, options){
    try{    
        log("Sending request to server: " + url + " with options: " + JSON.stringify(options));
        const response = await fetch(url, options);
        
        if(!response.ok){
            throw new Error(response.statusText); 
        } 
        log("Received response from server, parsing data...");
        const data = await response.json(); 
        log("Data parsed");
        return data; 
    }catch(err){
        log("Error: " + err + " while fetching: " + url + " with options: " + JSON.stringify(options)); 
        alert(err);
        throw new Error(err); 
    }
}

/**
 * Checks if the data is stored is the session storage else uses the fetchAsync function to retrieve the data. 
 * @param {*} url the url we want to retrieve the data from 
 * @param {*} options the options that are specified in the http header 
 * @param {*} sessionStorageKey the key that the data will be stored for using session storage.
 * @returns the data of the session storage or the data received the by the server 
 * @throws the underlying error caught by fetch 
 */
async function getData(sessionStorageKey, url, options){
    try {
        // Check if data is already stored in sessionStorage
        const data = sessionStorage.getItem(sessionStorageKey);
        
        if (data) {
            log("Data were received by session storage, parsing data...");

            return JSON.parse(data);
        }
    
        // If data is not stored in sessionStorage, fetch it and store it
        const response = await fetchAsync(url, options);
        log("Data were received by fetch api"); 

        sessionStorage.setItem(sessionStorageKey, JSON.stringify(response));
        return response;
    } catch (err) {
        log("Error: " + err + " while fetching: " + url + " with options: " + JSON.stringify(options)); 
        alert(err);
        throw new Error(err); 
    }
}


const fetchSubcategoriesProducts = async () => {
    const options = { method: "GET" };
    try{
        const data = await getData('products' + categoryId, url_subcategories_products, options);
    }catch(err){
        //TODO handle the error 
    }
    // Use the data to populate the list of products on the page
    addProductHTML(data);
  };
  
const fetchSubcategories = async () => {
    const options = { method: "GET" };
    try{
        const data = await getData('subcategories' + categoryId, url_subcategories, options);
    }catch(err){
        //TODO handle the error 
    }
    // Use the data to populate the list of products on the page
    createRadio(data);
  };
  
fetchSubcategoriesProducts();
fetchSubcategories();

//TODO add key of template 
function addProductHTML(data){
    let rawTemplate = document.getElementById("products").innerHTML;
    let compiledTemplate = Handlebars.compile(rawTemplate);
    let ourHTML = compiledTemplate(data);
    let outputHTML = document.getElementById("show_products");
    outputHTML.innerHTML = ourHTML;
}

function addCartLink(data){
    let rawTemplate = document.getElementById("cart-page").innerHTML;
    let compiledTemplate = Handlebars.compile(rawTemplate);
    let ourHTML = compiledTemplate(data);
    let outputHTML = document.getElementById("cart-size");
    outputHTML.innerHTML += ourHTML;
}

function createRadio(options){
    let rawTemplate = document.getElementById("createRadio").innerHTML;
    let compiledTemplate = Handlebars.compile(rawTemplate);
    let ourHTML = compiledTemplate({options});
    let outputHTML = document.getElementById("products-aside");
    outputHTML.innerHTML = ourHTML;
}

let radio_container = document.getElementById('products-aside');

//filter the products displayed using the radio 
radio_container.onclick = function(event){
    if(event.target.type == "radio"){
        let children = JSON.parse(sessionStorage.getItem('products' + categoryId));
        //display all the products 
        if(event.target.id == "radioall"){
            let rawTemplate = document.getElementById("products").innerHTML;
            let compiledTemplate = Handlebars.compile(rawTemplate);
            let ourHTML = compiledTemplate(children);
            let outputHTML = document.getElementById("show_products");
            outputHTML.innerHTML = ourHTML;
            return; 
        }
        
        let data = []; 
        //display products based on the subcategory id 
        //get their essential info from the dataset inside the figure 
        for(let i = 0; i < children.length; i++){
            if(children[i].subcategory_id == event.target.id){
                let object = {}; 
                object.id = children[i].id; 
                object.subcategory_id = children[i].subcategory; 
                object.cost = children[i].cost; 
                object.image = children[i].image; 
                object.title = children[i].title;
                object.description = children[i].description; 
                data.push(object);
            }
        }

        let rawTemplate = document.getElementById("products").innerHTML;
        let compiledTemplate = Handlebars.compile(rawTemplate);
        let ourHTML = compiledTemplate(data);
        let outputHTML = document.getElementById("show_products");
        outputHTML.innerHTML = ourHTML;
    }
};




let password_fieldset = document.getElementById("passwords-username"); 

/**
 * Whenever user leaves a key when entering a password the below validation methods
 * are called 
 * @param {*} event 
 */
password_fieldset.onkeyup = function(event){
    if(event.target.id !== "password" && event.target.id !== "re-password"){
        return; 
    }
    let message = document.getElementById('match-message'); 
    let password_value = document.getElementById("password").value; 
    let re_password_value = document.getElementById("re-password").value; 
    //this regex pattern enforces the at least one restrictions 
    let pattern = new RegExp(document.getElementById("password").getAttribute("pattern"));
    if(!pattern.test(password_value) || password_value.length < 10){
        message.style.color = 'red'; 
        message.innerHTML = `password must have at least 10 characters,
        at least one uppercase and lowercase letter, at least one special character
        and at least one number and no spaces are allowed`;
        event.target.setCustomValidity(`password must have at least 10 characters,
        at least one uppercase and lowercase letter, at least one special character
        and at least one number and no spaces are allowed`);
    }
    else if(password_value != re_password_value){
        message.style.color = 'red'; 
        message.innerHTML = "passwords don't match"
        event.target.setCustomValidity("Passwords don't match");
    }
    else{
        message.style.color = 'green'; 
        message.innerHTML = "matching"
        let re_password = document.getElementById("re-password");
        let password = document.getElementById("password");
        re_password.setCustomValidity(""); 
        password.setCustomValidity("");
    }
}

let form = document.getElementById("register-form");

form.addEventListener('submit', async function(event){
    event.preventDefault(); 
    log("submitting");
    let message = document.getElementById("success-failure-connection-message"); 

    const formdata = new FormData(event.target); 
    
    let formDataObject = Object.fromEntries(formdata.entries());

    let jsonFormData = JSON.stringify(formDataObject); 


    let fetchOptions = {
        method: "POST",
        headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        },
        body: jsonFormData,
    };

    log("Sending login service request"); 
     
    try{
        let login_service_server_response = await fetchAsync(url_login_service, fetchOptions); 
    }catch(err){
        //TODO handle error 
    }
    log("Server responded after login request: " + JSON.stringify(login_service_server_response));
    sessionId = login_service_server_response.sessionId; 
    message.innerHTML = "Successfull connection with session id: " + sessionId; 
    log("Sending cart size service request");
    const queryParams = {
        username: formdata.get('username'),
        sessionId: login_service_server_response.sessionId, 
    };

    const queryString = new URLSearchParams(queryParams).toString();
    log("Created query string: " + queryString); 

    const cart_size_url = new URL(`${document.location.protocol}${server_url}/CartSizeService?${queryString}`);

    let cart_size_message = document.getElementById('cart-size');

    let newFetchOptions = {
        method: "GET",
        headers: {
            Accept: "application/json",
        },
    };

    try{
        let cart_size_server_response = await fetchAsync(cart_size_url, newFetchOptions); 
    }catch(err){
        //TODO handle error 
    }
    cartSize = cart_size_server_response; 
    cart_size_message.innerHTML = 'Cart size: ' + cartSize;
    log("Server responded after cart size request: " + JSON.stringify(cart_size_server_response));

    username = formDataObject.username; 
    addCartLink({username: username, sessionId: sessionId}); 

}); 


let figures = document.getElementById("show_products");

figures.onclick = async function(event){
    //event delegation on the buy button displayed with each figure 
    if(event.target.id === 'buy_button'){
        if(!sessionId){
            alert("Please connect to the server before adding items to your cart"); 
            return; 
        }
        let figure = event.target.parentElement;
        //using the figure's dataset get the important data to add to cart 
        let json_object = {
            id: figure.id, 
            title: figure.dataset.title, 
            cost: figure.dataset.cost, 
            subcategory_id: figure.dataset.subcategory,
        };
        //construct the required message to send to server 
        let message = {
            product_data: json_object, 
            username: username, 
            sessionId: sessionId, 
        }

        let fetchOptions = {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            },
            body: JSON.stringify(message),
        };
        
        try{
            let cart_item_service_server_response = await fetchAsync(url_cart_item_service, fetchOptions); 
            log("Server responsed with: " + cart_item_service_server_response + " after requesting for cart item service");  
            /* alert("Item added to cart!"); */
        }catch(err){

        }
        
    }

}

function myFunctionShowRegister() {
    var x = document.getElementById("register_form");
    if (x.style.display === "block") {
      x.style.display = "none";
    } else {
      x.style.display = "block";
    }
}