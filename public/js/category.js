
function log(text){
    var time = new Date();
    console.log("[" + time.toLocaleTimeString() + "] " + text);
}



let params = new URLSearchParams(window.location.search);

let categoryId = params.get('categoryId'); 


let server_url = `${document.location.hostname}:${document.location.port}`; 

let url_subcategories = new URL(`https://wiki-shop.onrender.com/categories/${categoryId}/subcategories`); 
let url_subcategories_products = new URL(`https://wiki-shop.onrender.com/categories/${categoryId}/products`);


if(localStorage.getItem('products')){
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
        localStorage.setItem('products', JSON.stringify(data));
        addProductHTML(data); 
    }).catch((err) => {
        log(err); 
    }) 
}else{
    addProductHTML(JSON.parse(localStorage.getItem('products')));
}

if(!localStorage.getItem('subcategories')){
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
        localStorage.setItem('subcategories', JSON.stringify(data));
        createRadio(data); 
    }).catch((err) => {
        log(err); 
    }) 
}else{
    createRadio(JSON.parse(localStorage.getItem('subcategories')));
}

function addProductHTML(data){
    let rawTemplate = document.getElementById("products").innerHTML;
    let compiledTemplate = Handlebars.compile(rawTemplate);
    let ourHTML = compiledTemplate(data);
    let outputHTML = document.getElementById("show_products");
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
        let children = JSON.parse(localStorage.getItem('products'));

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
      })
      .catch((error) => {
        log(error);
      });
    log(response);
}); 