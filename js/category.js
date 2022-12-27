
function log(text){
    var time = new Date();
    console.log("[" + time.toLocaleTimeString() + "] " + text);
}

let params = new URLSearchParams(window.location.search);

let categoryId = params.get('categoryId'); 

let url_subcategories = new URL(`https://wiki-shop.onrender.com/categories/${categoryId}/subcategories`); 
let url_subcategories_products = new URL(`https://wiki-shop.onrender.com/categories/${categoryId}/products`);



fetch(url_subcategories_products, {
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
    addProductHTML(data); 
}).catch((err) => {
    log(err); 
}) 

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
    createRadio(data); 
}).catch((err) => {
    log(err); 
}) 

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



Handlebars.registerHelper('makeRadio', function(name, options){
    let html = '';
    for (let i = 0; i < options.length; i++) {
        let option = options[i];
        html += `
        <label for="${option.id}">${option.title}</label>
        <input type="radio" name="${name}" id="${option.id}">`
    }
    return new Handlebars.SafeString(html);
});