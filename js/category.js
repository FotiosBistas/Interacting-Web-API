
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