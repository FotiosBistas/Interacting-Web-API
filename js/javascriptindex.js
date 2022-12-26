
var ourRequest = new XMLHttpRequest();
ourRequest.open("GET", "https://wiki-shop.onrender.com/categories/");


function log(text){
    var time = new Date();
    console.log("[" + time.toLocaleTimeString() + "] " + text);
}

ourRequest.onload = function(event){
    if (ourRequest.status >= 200 && ourRequest.status <400){
        let categories = JSON.parse(ourRequest.responseText);
        log(JSON.stringify(categories));
        addCategoryHTML(categories);
    }else{

    }
};

ourRequest.onerror = function(event){
    log(JSON.stringify(event));
};

ourRequest.send();

function addCategoryHTML(data){
    var rawTemplate = document.getElementById("categories").innerHTML;
    var compiledTemplate = Handlebars.compile(rawTemplate);
    var ourHTML = compiledTemplate(data);
    var categoriesTest = document.getElementById("show_categories");
    categoriesTest.innerHTML = ourHTML;
}


let categories = document.getElementById("show_categories");



categories.onclick = function(event){

    switch(event.target.id){
        case "1": 
            const searchParams = new URLSearchParams(`categories`);
            break; 
        case "2":
            break; 
        case "3": 
            break; 
        default: 
            log("unknown area pressed"); 
    }
}