//Requires
var cookieParser = require("cookie-parser");
const bodyParser = require('body-parser'); //parse body of post req
const jwt = require('jsonwebtoken');
require('dotenv').config();

//Data access layer
const dataLayer = require("../data.js"); 

/*
    Function:       checkLogin
    Purpose:        Checks if the user has a valid JWT. If they do, they shouldn't be able to access the endpoint.
    Middleware:     YES
*/
checkLogin = (req, res, next) => {
    const token = req.cookies.token;

    if (token != undefined) { //if the user has logged in
        return res.redirect("/table");
    }
    next();
}

/*
    Function:       cookieJwtAuth
    Purpose:        Checks if the user has a valid JWT. If they don't, they shouldn't be able to access the page.
                    They are then redirected to the login screen.
    Middleware:     YES
*/
cookieJwtAuth = (req, res, next) => {
    const token = req.cookies.token;
    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);
        const expirationTime = decoded.exp * 1000; // Expiration time in milliseconds

        if (Date.now() >= expirationTime) {
            // Token has expired
            res.clearCookie("token");
            return res.redirect("/login");
        }

        req.user = decoded;
        next();
    } catch (err) {
        res.clearCookie("token");
        return res.redirect("/login?cookie=false");
    }
}

/*
    Function:       authCookie
    Purpose:        Takes a cookie (string) and verifies its validilty. True if valid, false if not valid.
    Middleware:     NO
    in:             cookie to be validated (string)
*/
function authCookie(token){
    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);
        const expirationTime = decoded.exp * 1000; // Expiration time in milliseconds

        if (Date.now() >= expirationTime) {
            return false;
        }

        return true;
    } catch (err) {
        return false;
    }
}

/*
    Function:       authRole
    Purpose:        Checks if the current account is the desired role. If not, the user should not be able to access 
                    the page. Should be used on any and all endpoints with role restriction.
                    They are then redirected to the login screen.
    Middleware:     YES
*/
function authRole(role) {
    return (req, res, next) => {
        const dataArr = JSON.parse(`[${dataLayer.readData()}]`); //array with user information
        const targetUser = dataArr.find(user => user.username === req.user.username);

        if (targetUser.role !== role) {
            res.status(401)
            return res.send('Not allowed')
        }
        next()
    }
}

/*
    Function:       createUserToken
    Purpose:        Uses the given userName to create a jwt. Note, this function does not send it to the user.
    Middleware:     NO
    in:             Username assigned to the JWT.
*/
function createUserToken(userName) {
    const user = {username: userName};
    const token = jwt.sign(user, process.env.ACCESS_TOKEN, { expiresIn: "10m" });
    return token;
}


module.exports = (app) => {
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(cookieParser());

    return {
        checkLogin,
        cookieJwtAuth,
        authCookie,
        authRole,
        createUserToken
    };
};