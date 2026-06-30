const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const swaggerDefinition = require("./swaggerDefinition");

const options = {
    definition: swaggerDefinition,

    apis: [
        "./src/routes/**/*.js",
        "./src/controllers/**/*.js",
    ],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = {
    swaggerUi,
    swaggerSpec,
};