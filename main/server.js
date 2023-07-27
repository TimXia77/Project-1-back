
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

// Helper Modules:
const authHelper = require("./authHelper.js")(app);
const cache = require("./cache.js");

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

app.get(registerPage, async (req, res) => {
    try {
        const response = await (await fetch(`http://frontend/register-en.html`)).text();
        res.send(response);

    } catch {
        console.log("LOCAL REQUEST: /register");
        res.sendFile(path.resolve('../../front-end/register-en.html'));
    }
});

app.post(registerPage, async (req, res) => {

    if (!((req.body.email).includes("@"))) {    //Check if username, password, and email pass restrictions
        return res.status(400).redirect('http://localhost:80/register-en.html?error=email');

    } else if (!(/^[a-zA-Z0-9_]{2,}$/.test(req.body.username))) {
        return res.status(400).redirect('http://localhost:80/register-en.html?error=username');

    } else if (!(/[0-9]/.test(req.body.password) && /[A-Z]/.test(req.body.password) && /[a-z]/.test(req.body.password) && (req.body.password).length >= 8)) {
        return res.status(400).redirect('http://localhost:80/register-en.html?error=password');

    }

    const dataArr = dataLayer.readUsers(); // Determining if the target account exists
    const usernameUser = dataArr.find(findUser => findUser.username === req.body.username); 
    const emailUser = dataArr.find(findUser => findUser.email === req.body.email);


    if (usernameUser && emailUser) {     //Check if username, password, and email are not taken
        return res.status(409).redirect('http://localhost:80/register-en.html?error=taken-user-email');

    } else if (emailUser) {
        return res.status(409).redirect('http://localhost:80/register-en.html?error=taken-email');

    } else if (usernameUser) {
        return res.status(409).redirect('http://localhost:80/register-en.html?error=taken-user');

    } else {
        try {       //valid information! Creating account

            await (dataLayer.addUser(req.body.email, req.body.username, req.body.password));
            const token = authHelper.createUserToken(req.body.username);
            res.cookie("token", token);

            return res.redirect(`http://localhost:80/table.html?user=${req.body.username}`);

        } catch {
            res.status(500).send("Internal error occured when registering!");
        }
    }
});


app.get('/login', async (req, res) => {
    console.log('GET IN LOGIN');
    try {
        const response = await (await fetch(`http://frontend/login-en.html`)).text();
        res.send(response);
    } catch {
        console.log("LOCAL REQUEST: /login");
        res.sendFile(path.resolve('../../front-end/login-en.html'));
    }
});


app.post("/login", (req, res) => {
    if (dataLayer.findUser(req.body.username, req.body.password)) {     // A user has been found! Give them a JWT and redirect.
        try {
            const token = authHelper.createUserToken(req.body.username);
            res.cookie("token", token);

            return res.redirect(`http://localhost:80/table.html?user=${req.body.username}`); 

        } catch {
            res.status(500).redirect('http://localhost:80/login-en.html?error=internal');
        }
    } else {
        return res.status(401).redirect('http://localhost:80/login-en.html?error=login');
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


//Data page 
//Inventory Management: When the table is updated, the cache should be updated, and the json sent should be used instead of placeholder.
app.post("/table", authHelper.cookieJwtAuth, cache(3600), (req, res) => {
    if (authHelper.authCookie(req.body.cookie)) {
        res.status(200).json(dataLayer.readTable());
    } else {
        res.status(405).json({ error: 'Authentication failed' });
    }
});


app.get("/table", authHelper.cookieJwtAuth, async (req, res) => {
    try {
        const response = await (await fetch(`http://frontend/table.html`)).text();
        res.send(response);
    } catch {
        console.log("LOCAL REQUEST: /table");
        res.sendFile(path.resolve('../../front-end/table.html'));
    }
});


app.listen(PORT, () => {
    console.log(`\nRunning on port 80.`);
    console.log("Test this at: ");
    console.log(`http://localhost:80/register-en.html`);
    console.log(`http://localhost:80/login-en.html`);
    console.log(`http://localhost:80/table.html`);
    console.log("\nOr check out the specification:")
    console.log(`http://localhost:80/api-docs`);
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
