
function log(text){
    var time = new Date();
    console.log("[" + time.toLocaleTimeString() + "] " + text);
}

let params = new URLSearchParams(window.location.search);; 

let categoryId = params.get('categoryId'); 

let url_subcategories = new URL(`https://wiki-shop.onrender.com/categories/${categoryId}/subcategories`); 
let url_subcategories_products = new URL(`https://wiki-shop.onrender.com/categories/${categoryId}/products`);

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
    addSubCategoryHTML(data); 
}).catch((err) => {
    log(err); 
}) 


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
addSubCategoryHTML(data); 
}).catch((err) => {
log(err); 
}) 

function addSubCategoryHTML(data){
    let rawTemplate = document.getElementById("categories").innerHTML;
    let compiledTemplate = Handlebars.compile(rawTemplate);
    let ourHTML = compiledTemplate(data);
    let show_sub_categories = document.getElementById("show_sub_categories");
    show_sub_categories.innerHTML = ourHTML;
}