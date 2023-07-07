
//Requires
const express = require("express");
const app = express();

const cors = require('cors');
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
var cookieParser = require("cookie-parser");
const bodyParser = require('body-parser'); //parse body of post req
require('dotenv').config();

app.set("view engine", "ejs");

//Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
app.use(cookieParser());
app.use(express.static(__dirname + "/views"));
app.use(express.json());

//Data access layer
const dataLayer = require("./../data.js");

//Helper Modules
const authHelper = require("./authHelper.js")(app);
const cache = require("./cache.js");

//Constants (for readability)
const registerPage = ["/", "/register"];
const PORT = 3000;
const swaggerDocument = YAML.load('./apiSpecification.yaml');

//Data that is off limits (used for testing)
const existingEmail = 'TestTest@test.test';
const existingUsername = 'existUserTest';

const newEmail = "TestExisting@test.test"
const newUsername = 'newUserTest';

const swaggerOptions = {
    swaggerDefinition: swaggerDocument,
    apis: ['./server.js'], // Update with your actual route files
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec)); //http://localhost:3000/api-docs

dataLayer.deleteUser('newUserTest');

//Routes


app.post(registerPage, async (req, res) => {
    if (!((req.body.email).includes("@"))) {        //Check if username, password, and email pass restrictions
        return res.status(400).json({ error: 'Invalid format for email' });

    } else if (!(/^[a-zA-Z0-9_]{2,}$/.test(req.body.username))) {
        return res.status(400).json({ error: 'Invalid format for username' });

    } else if (!(/[0-9]/.test(req.body.password) && /[A-Z]/.test(req.body.password) && /[a-z]/.test(req.body.password) && (req.body.password).length >= 8)) {
        return res.status(400).json({ error: 'Invalid format for password' });

    }
    

    const dataArr = dataLayer.readUsers(); //array with user information

    const usernameUser = dataArr.find(findUser => findUser.username === req.body.username); //variables to determine if an account already exists.
    const emailUser = dataArr.find(findUser => findUser.email === req.body.email);

    if (usernameUser && emailUser) {     //username and email taken
        return res.status(409).json({error: 'Username and email taken' });

    } else if (emailUser) {              //email taken
        return res.status(409).json({error: 'Email already taken' });
        
    } else if (usernameUser) {          //user with that username already exists
        return res.status(409).json({error: 'Username already taken' });

    } else {
        try {   //valid information! Creating account

            await (dataLayer.addUser(req.body.email, req.body.username, req.body.password));

            //logging user in:
            const token = authHelper.createUserToken(req.body.username);

            return res.status(200).json({ cookie: token }); //should send back status 200 with cookie str. front end should make 

        } catch {
            res.status(500).send("Internal error occured when registering!");
        }
    }
});


app.post("/login", (req, res) => {

    if (dataLayer.findUser(req.body.username, req.body.password)) {
        try {
            const token = authHelper.createUserToken(req.body.username);

            return res.status(200).json({ cookie: token });

        } catch {
            res.status(500).send("Internal error occured when logging in!");
        }
    } else {
        return res.status(401).json({error: 'Invalid Login Information' });
    }

});


//Data page //removed cache(15)
app.post("/table", (req, res) => {

    if (authHelper.authCookie(req.body.cookie)){
        res.status(200).json(dataLayer.readTable());
    } else {
        res.status(405).json({error: 'Authentication failed' });
    }
});

//Start the server
app.listen(PORT, () => {
    console.log(`\nRunning on port ${PORT}.`);
    console.log("Test this at: ");
    console.log(`http://localhost:${PORT}/register`);
    console.log(`http://localhost:${PORT}/login`);
    console.log(`http://localhost:${PORT}/table`);
    console.log("\nOr check out the specification:")
    console.log(`http://localhost:3000/api-docs`);
});

module.exports = app; //For automated testing