//server url e.g. 127.0.0.1:8080 
let server_url = `${document.location.hostname}:${document.location.port}`; 
let index_url = new URL(`${document.location.protocol}//${server_url}/`); 

/**
 * Uses the fetch api to request html data from the server and retrieve them as html data
 * @param {*} url the url we want to retrieve the data from 
 * @param {*} options the options that are specified in the http header 
 * @returns the data received 
 */
async function fetchAsyncHtml(url, options){
    try{    
        const response = await fetch(url, options);
        
        if(!response.ok){
            throw new Error(response.statusText); 
        } 

        const data = await response.text(); 
        return data; 
    }catch(err){
        log("Error: " + err + " while fetching: " + url + " with options: " + JSON.stringify(options)); 
        alert(err);
    }
}

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
        throw new Error(err)
    }
}

/**
 * Checks if the data is stored is the session storage else uses the fetchAsync function to retrieve the data. 
 * @param {*} url the url we want to retrieve the data from 
 * @param {*} options the options that are specified in the http header 
 * @param {*} sessionStorageKey the key that the data will be stored for using session storage.
 * @returns 
 */
async function getData(sessionStorageKey, url, options){
    try {
        // Check if data is already stored in sessionStorage
        const data = sessionStorage.getItem(sessionStorageKey);
        
        if (data) {
            log("Data were received by session storage, parsing data...");
            return JSON.parse(data);
        }
    
        // If data is not stored in sessionStorage, fetch it and store it
     
         const response = await fetchAsync(url, options);
    
        log("Data were received by fetch api"); 
        sessionStorage.setItem(sessionStorageKey, JSON.stringify(response));
        return response;
    } catch (err) {
        log("Error: " + err + " while fetching: " + url + " with options: " + JSON.stringify(options)); 
        alert(err);
        throw new Error(err); 
    }
}

const getHtmlFromWebServer = async() => {
    await fetchAsyncHtml(index_url, {method:'GET'}); 
};

getHtmlFromWebServer(); 


let url = new URL('https://wiki-shop.onrender.com/categories/');

const getProductCategoriesFromServer = async() => {
    try{
        let data = await getData('categories', url, {method: 'GET',"headers":{"Accept":"application/json"}});
        addCategoryHTML(data);
    }catch(err){
        //handle error 
        alert("Something went wrong during the loading of the page. Try reloading the page.");
    }
   
}

getProductCategoriesFromServer(); 

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
