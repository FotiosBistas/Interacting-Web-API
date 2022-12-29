const express = require('express');
const path = require('path');
const { v4: uuidv4 } = require('uuid'); 
const app = express();
const port = 8080;
const cors = require("cors");

let ___dirname = "../public"



function log(text){
    var time = new Date();
    console.log("[" + time.toLocaleTimeString() + "] " + text);
}

app.listen(port, () => {
    log(`App listening on port ${port}`)
});

//cors to allow cross origin resource sharing
app.use(cors());

app.use(express.static('public'));

// parse url-encoded content from body
app.use(express.urlencoded({ extended: false }));

// parse application/json content from body
app.use(express.json()) ;

app.post('/LoginService', (request, response) => {

    log("Received login service request");
    const {username, password, re_password} = request.body; 
    log("Received username: " + username + " and password: " + password + " and re-password: " + re_password);
    //TODO call mongoDB 
    let successdata = {sessionId: uuidv4()};
    response.status(200).json(successdata); 
}); 

app.get('/', (req, res) => {
    
    var options = {
        root: path.join(__dirname, 'public')
    }

    res.sendFile('index.html', options, function(err){
        log(err)
    })
})