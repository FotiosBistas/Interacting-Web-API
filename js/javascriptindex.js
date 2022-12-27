

fetch('https://wiki-shop.onrender.com/categories/', {
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
    addCategoryHTML(data);
}).catch((err) => {
    log(err); 
})



function log(text){
    var time = new Date();
    console.log("[" + time.toLocaleTimeString() + "] " + text);
}

function addCategoryHTML(data){
    var rawTemplate = document.getElementById("categories").innerHTML;
    var compiledTemplate = Handlebars.compile(rawTemplate);
    var ourHTML = compiledTemplate(data);
    var show_categories = document.getElementById("show_categories");
    show_categories.innerHTML = ourHTML;
}
