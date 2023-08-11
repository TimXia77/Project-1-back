
require('dotenv').config();

const express = require("express");
const path = require('path');
const cors = require('cors');
const fetch = require('node-fetch');
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const cookieParser = require("cookie-parser");
const bodyParser = require('body-parser');

const app = express();

app.set("view engine", "ejs");

// Middleware
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
app.use(express.static(path.join(__dirname, "/../../front-end")));
app.use(express.json());

module.exports = {
    express,
    path,
    cors,
    fetch,
    swaggerJSDoc,
    swaggerUi,
    YAML,
    cookieParser,
    bodyParser,
    app
};
