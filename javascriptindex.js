
var ourRequest = new XMLHttpRequest();
ourRequest.open("GET", "https://wiki-shop.onrender.com/categories/");


ourRequest.onload = function(){
    if (ourRequest.status >= 200 && ourRequest.status <400){
        var categories = JSON.parse(ourRequest.responseText);
        console.log(categories);
        addHTML(categories);
    }else{

    }
};

ourRequest.onerror = function(){
    console.log("connection error")
};

ourRequest.send();

function addHTML(data){
    var rawTemplate = document.getElementById("categories").innerHTML;
    var compiledTemplate = Handlebars.compile(rawTemplate);
    var ourHTML = compiledTemplate(data);
    var categoriesTest = document.getElementById("show_categories");
    categoriesTest.innerHTML = ourHTML;
}
