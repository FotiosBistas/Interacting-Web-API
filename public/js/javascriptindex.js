let server_url = `${document.location.hostname}:${document.location.port}`; 

let index_url = new URL(`${document.location.protocol}//${server_url}/`); 

fetch(index_url,{
    method: 'GET',
}).then((response) => {
    if(!response.ok){
        log("Error: " + response.statusText);
        alert(response.statusText);
        return; 
    }
    return response.text(); 
}).catch(err => log("Error: " + err + " while receiving html"));

let url = new URL('https://wiki-shop.onrender.com/categories/');

if(!sessionStorage.getItem('categories')){ 
    fetch(url, {
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
        sessionStorage.setItem('categories', JSON.stringify(data));
        addCategoryHTML(data);
    }).catch((err) => {
        log(err); 
    })
}else{ 
    addCategoryHTML(JSON.parse(sessionStorage.getItem('categories')));
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
