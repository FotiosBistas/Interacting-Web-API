let params = new URLSearchParams(window.location.search);
let sessionId = params.get('sessionId'); 
let username = params.get('username');


function log(text){
    var time = new Date();
    console.log("[" + time.toLocaleTimeString() + "] " + text);
}

const queryString = new URLSearchParams(params).toString();

let server_url = `${document.location.hostname}:${document.location.port}`; 



/**
 * Uses the fetch api to request data from the server and retrieve them 
 * @param {*} url the url we want to retrieve the data from 
 * @param {*} options the options that are specified in the http header 
 * @returns the data received 
 */
async function fetchAsync(url, options){
    try{    
        log("Sending request to server: " + url + " with options: " + JSON.stringify(options));
        const response = await fetch(url, options);
        
        if(!response.ok){
            throw new Error(response.statusText); 
        } 

        log("Received response from server, parsing data...");
        const data = await response.json(); 
        log("Data parsed");
        return data; 
    }catch(err){
        log("Error: " + err + " while fetching: " + url + " with options: " + JSON.stringify(options)); 
        alert(err);
        throw new Error(err);
    }
}

let url = new URL(`${document.location.protocol}/${server_url}/CartRetrievalService?${queryString}`); 


let fetch_options = {
    method: "GET",
    headers: {
        Accept: "application/json",
    },
};

const getProductsFromCart = async() => {
    let data = null; 
    try{
        data = await fetchAsync(url, fetch_options); 
        let totalCost = 0;
        data.forEach(item => {
            totalCost += +(item.cost*item.quantity);
        });
        makeCartList(data, totalCost);
    }catch(err){
        //handle error 
        alert("Something went wrong trying to retrieve items from cart.");
    }
    
};

getProductsFromCart(); 

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