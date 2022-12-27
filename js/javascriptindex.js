
if(!localStorage.getItem('categories')){ 
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
        localStorage.setItem('categories', JSON.stringify(data));
        addCategoryHTML(data);
    }).catch((err) => {
        log(err); 
    })
}else{ 
    addCategoryHTML(JSON.parse(localStorage.getItem('categories')));
}



function log(text){
    var time = new Date();
    console.log("[" + time.toLocaleTimeString() + "] " + text);
}

function addCategoryHTML(data){
    let rawTemplate = document.getElementById("categories").innerHTML;
    let compiledTemplate = Handlebars.compile(rawTemplate);
    let ourHTML = compiledTemplate(data);
    let show_categories = document.getElementById("show_categories");
    show_categories.innerHTML = ourHTML;
}
