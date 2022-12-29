const express = require('express')
const path = require('path')
const app = express()
const port = 8080

let ___dirname = "../public"



function log(text){
    var time = new Date();
    console.log("[" + time.toLocaleTimeString() + "] " + text);
}

app.listen(port, () => {
    log(`App listening on port ${port}`)
});

app.use(express.static('public'));

// parse url-encoded content from body
app.use(express.urlencoded({ extended: false }))

// parse application/json content from body
/* app.use(express.json()) */

app.post('/LoginService', (request, response) => {

    log("Received login service request");
    const {username, password,re_password} = request.body; 
    log("Received username: " + username + " and password: " + password + " and re-password: " + re_password);
    //TODO call mongoDB 

}); 

app.get('/', (req, res) => {
    
    var options = {
        root: path.join(__dirname, 'public')
    }

    res.sendFile('index.html', options, function(err){
        log(err)
    })
})