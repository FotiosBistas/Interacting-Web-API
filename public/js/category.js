
function log(text){
    var time = new Date();
    console.log("[" + time.toLocaleTimeString() + "] " + text);
}


Handlebars.registerHelper('makeRadio', function(name, options){
    let html = '';
    for (let i = 0; i < options.length; i++) {
        let option = options[i];
        html += `
        <label for="${option.id}">${option.title}</label>
        <input type="radio" data-category="${option.category_id}" name="${name}" id="${option.id}">`
    }
    return new Handlebars.SafeString(html);
});


let session_id = null; 
let cart = null; 
let username = null;
let cart_size = null; 

let params = new URLSearchParams(window.location.search);

let categoryId = params.get('categoryId'); 


let server_url = `${document.location.hostname}:${document.location.port}`; 

let url_subcategories = new URL(`https://wiki-shop.onrender.com/categories/${categoryId}/subcategories`); 
let url_subcategories_products = new URL(`https://wiki-shop.onrender.com/categories/${categoryId}/products`);


if(!sessionStorage.getItem('products' + categoryId)){
    fetch(url_subcategories_products, {
        method: 'GET',
    })
    .then((responseText) =>{
        if (responseText.status >= 200 && responseText.status < 300){
            return responseText.json(); 
        }else{

        }
    }
    ).then((data) => {
        sessionStorage.setItem('products' + categoryId, JSON.stringify(data));
        addProductHTML(data); 
    }).catch((err) => {
        log(err); 
    }) 
}else{
    addProductHTML(JSON.parse(sessionStorage.getItem('products' + categoryId)));
}

if(!sessionStorage.getItem('subcategories' + categoryId)){   
    fetch(url_subcategories, {
        method: 'GET',
    })
    .then( (responseText) =>{
        if (responseText.status >= 200 && responseText.status < 300){
            return responseText.json(); 
        }else{

        }
    }
    ).then((data) => {
        log(JSON.stringify(data));  
        sessionStorage.setItem('subcategories' + categoryId, JSON.stringify(data));
        createRadio(data); 
    }).catch((err) => {
        log(err); 
    }) 
} else{
    createRadio(JSON.parse(sessionStorage.getItem('subcategories' + categoryId)));
}   

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
    outputHTML.innerHTML = ourHTML;
}

function createRadio(options){
    let rawTemplate = document.getElementById("createRadio").innerHTML;
    let compiledTemplate = Handlebars.compile(rawTemplate);
    let ourHTML = compiledTemplate({options});
    let outputHTML = document.getElementById("products-aside");
    outputHTML.innerHTML = ourHTML;
}

let radio_container = document.getElementById('products-aside');

radio_container.onclick = function(event){
    if(event.target.type == "radio"){
        let children = JSON.parse(sessionStorage.getItem('products' + categoryId));

        if(event.target.id == "radioall"){
            let rawTemplate = document.getElementById("products").innerHTML;
            let compiledTemplate = Handlebars.compile(rawTemplate);
            let ourHTML = compiledTemplate(children);
            let outputHTML = document.getElementById("show_products");
            outputHTML.innerHTML = ourHTML;
            return; 
        }
        
        let data = []; 

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

form.addEventListener('submit',function(event){
    event.preventDefault(); 
    log("submitting");
    let message = document.getElementById("success-failure-connection-message"); 

    const formdata = new FormData(event.target); 
    
    let formDataObject = Object.fromEntries(formdata.entries());
    username = formDataObject.username; 
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
    let url = new URL(document.location.protocol + "//" +  server_url + '/LoginService'); 
    const response = fetch(url, fetchOptions)
    .then((response) => {
        if(!response.ok){
            let error = response.text(); 
            throw new Error(error); 
        }
        return response.json(); 
    })
    .then((data) => {
        log(JSON.stringify(data));
        session_id = data; 
        log("Your session id is: " + session_id);
        message.innerHTML = "Successful connection";
        log("Sending cart size service request");
        const queryParams = {
            username: formdata.get('username'),
            sessionId: session_id.sessionId, 
        };
        const queryString = new URLSearchParams(queryParams).toString();
        const cart_size_url = new URL(`${document.location.protocol}${server_url}/CartSizeService?${queryString}`);
        let cart_size_message = document.getElementById('cart-size');
        let newFetchOptions = {
            method: "GET",
            headers: {
                Accept: "application/json",
            },
        };
        const cz = fetch(cart_size_url, newFetchOptions)
        .then((response) => {
            if(!response.ok){
                let error = response.text(); 
                throw new Error(error); 
            }
            return response.json(); 
        })
        .then(data => {
            log(JSON.stringify(data));
            cart_size = JSON.stringify(data); 
            log("Your cart size is: " + cart_size);
            addCartLink({username: username, sessionId: session_id.sessionId}); 
            cart_size_message.append("Cart size" + cart_size); 
            return data; 
        })
        .catch((error) => {
            cart_size_message.innerHTML = `Failed connection:${error}`; 
            log(error);
        }); 
        return data; 
    })
    .catch((error) => {
        message.innerHTML = `Failed connection:${error}`; 
        log(error);
    });

    

}); 


let figures = document.getElementById("show_products");

figures.onclick = function(event){
    if(event.target.id === 'buy_button'){
        if(!session_id){
            alert("Please connect to the server before adding items to your cart"); 
            return; 
        }
        let figure = event.target.parentElement;

        let json_object = {
            id: figure.id, 
            title: figure.dataset.title, 
            cost: figure.dataset.cost, 
            subcategory_id: figure.dataset.subcategory,
        };

        let message = {
            product_data: json_object, 
            username: username, 
            sessionId: session_id, 
        }

        let fetchOptions = {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            },
            body: JSON.stringify(message),
        };
        let url = new URL(document.location.protocol + "//" +  server_url + '/CartItemService'); 

        const response = fetch(url, fetchOptions)
        .then((response) => {
            if(!response.ok){
                let error = response.text(); 
                throw new Error(error); 
            }
            return response.json(); 
        })
        .then((data) => {
            log(JSON.stringify(data));
            return data; 
        })
        .catch((error) => {
            log(error);
        });
    }

}