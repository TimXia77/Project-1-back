
// Requires:
const {
    express,        path,
    cors,           fetch,
    swaggerJSDoc,   swaggerUi,
    YAML,           cookieParser,
    bodyParser,     app
} = require('./dependencies');

// Data access layer:
const dataLayer = require("../data.js");

// Helper Module(s):
const authHelper = require("./authHelper.js")(app);

// Constants (for readability):
const registerPage = ["/", "/register"];
const PORT = 3000;

// Data that is off limits (used for testing) / Code to aid testing:
dataLayer.deleteUser('newUserTest');

// API Specification (swagger):
const swaggerDocument = YAML.load('./apiSpecification.yaml');
const swaggerOptions = {
    swaggerDefinition: swaggerDocument,
    apis: ['./server.js'],
};
const swaggerSpec = swaggerJSDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


// Routes:
// In this commit, get requests are unused. The frontend is served by an nginx server from docker.

// app.get(registerPage, async (req, res) => {
//     console.log("GET request for /register");
//     try {
//         const response = await (await fetch(`http://frontend/register-en.html`)).text();
//         res.send(response);

//     } catch {
//         console.log("LOCAL REQUEST: /register");
//         res.sendFile(path.resolve('../../front-end/register-en.html'));
//     }
// });

app.post(registerPage, async (req, res) => {
    //TEST

    if (!((req.body.email).includes("@"))) {    //Check if username, password, and email pass restrictions
        return res.status(400).json({ error: "Invalid format for email" });

    } else if (!(/^[a-zA-Z0-9_]{2,}$/.test(req.body.username))) {
        return res.status(400).json({ error: "Invalid format for username" });

    } else if (!(/[0-9]/.test(req.body.password) && /[A-Z]/.test(req.body.password) && /[a-z]/.test(req.body.password) && (req.body.password).length >= 8)) {
        return res.status(400).json({ error: "Invalid format for password" });

    }

    const dataArr = dataLayer.readUsers(); // Determining if the target account exists
    const usernameUser = dataArr.find(findUser => findUser.username === req.body.username); 
    const emailUser = dataArr.find(findUser => findUser.email === req.body.email);


    if (usernameUser && emailUser) {     //Check if username, password, and email are not taken
        return res.status(409).json({ error: "Username and email are taken by another user" });

    } else if (emailUser) {
        return res.status(409).json({ error: "Email is already taken by another user" });

    } else if (usernameUser) {
        return res.status(409).json({ error: "Username is already taken by another user" });

    } else {
        try {       //valid information! Creating account

            await (dataLayer.addUser(req.body.email, req.body.username, req.body.password));
            const token = authHelper.createUserToken(req.body.username);

            return res.status(200).json( {token: token} );

        } catch {
            return res.status(500).json( {error: "An internal error has occured"} );
        }
    }
});


// app.get('/login', async (req, res) => {
//     console.log("GET request for /login");
//     try {
//         const response = await (await fetch(`http://frontend/login-en.html`)).text();
//         res.send(response);
//     } catch {
//         console.log("LOCAL REQUEST: /login");
//         res.sendFile(path.resolve('../../front-end/login-en.html'));
//     }
// });


app.post("/login", (req, res) => {
    
    if (dataLayer.findUser(req.body.username, req.body.password)) {     // A user has been found! Give them a JWT.
        try {
            const token = authHelper.createUserToken(req.body.username);

            return res.status(200).json( {token: token} );

        } catch {
            return res.status(500).json( {error: "An internal error has occured"} );
        }
    } else {
        return res.status(401).json( {error: "Username or password is incorrect."} );
    }
});


app.post('/logout', (req, res) => {
    if (req.cookies.token) {
        res.clearCookie("token");
        res.status(302).redirect("http://localhost:80/login-en.html?logout=true");
    } else {
        res.status(405).redirect("http://localhost:80/login-en.html");
    }
});


// app.get("/table", authHelper.cookieJwtAuth, async (req, res) => {
//     console.log("GET request for /table");
//     try {
//         const response = await (await fetch(`http://frontend/table.html`)).text();
//         res.send(response);
//     } catch {
//         console.log("LOCAL REQUEST: /table");
//         res.sendFile(path.resolve('../../front-end/table.html'));
//     }
// });

//Data page 
//Inventory Management: When the table is updated, the cache should be updated, and the json sent should be used instead of placeholder.
app.post("/table", authHelper.cookieJwtAuth, (req, res) => {
    if (authHelper.authCookie(req.body.cookie)) {
        res.status(200).json(dataLayer.readTable());
    } else {
        res.status(405).json({ error: 'Authentication failed' });
    }
});


app.listen(PORT, () => {
    console.log(`\nRunning on port 4000.`);
    console.log("Test this at: ");
    console.log(`http://localhost/register`);
    console.log(`http://localhost/login`);
    console.log(`http://localhost/table`);
    console.log("\nOr check out the specification:")
    console.log(`http://localhost/api-docs`);
});


//Start server for automated tests
function startServer(PORT) {
    app.listen(PORT, () => {
        console.log(`\nRunning on port parameter ${PORT}.`);
        console.log("Test this at: ");
        console.log(`http://localhost:${PORT}/register-en.html`);
        console.log(`http://localhost:${PORT}/login-en.html`);
        console.log(`http://localhost:${PORT}/table`);
        console.log("\nOr check out the specification:")
        console.log(`http://localhost:${PORT}/api-docs`);
    });

    return app;
};

module.exports = { startServer };
