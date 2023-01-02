let params = new URLSearchParams(window.location.search);
let sessionId = params.get('sessionId'); 
let username = params.get('username');


function log(text){
    var time = new Date();
    console.log("[" + time.toLocaleTimeString() + "] " + text);
}

const queryString = new URLSearchParams(params).toString();

let server_url = `${document.location.hostname}:${document.location.port}`; 

let url = new URL(`${document.location.protocol}/${server_url}/CartRetrievalService?${queryString}`); 

let fetch_options = {
    method: "GET",
    headers: {
        Accept: "application/json",
    },
};

fetch(url, fetch_options)
.then( (response) => {
    if(!response.ok){
        let error = response.text(); 
        throw new Error(error); 
    }
    return response.json();
})
.then(data => {
    log(JSON.stringify(data))
    let totalCost = 0;
    data.forEach(item => {
        totalCost += +item.cost;
    });
    makeCartList(data, totalCost);
})
.catch(err => {
    log(err); 
});

function makeCartList(data, totalCost){
    let rawTemplate = document.getElementById("cart-product-list").innerHTML;
    let compiledTemplate = Handlebars.compile(rawTemplate);
    let ourHTML = compiledTemplate({
        products: data,  // an array of products
        totalCost: totalCost // the total cost
      });
    let outputHTML = document.getElementById("cart-list-container");
    outputHTML.innerHTML = ourHTML;
}