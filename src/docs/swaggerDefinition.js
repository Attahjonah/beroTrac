const swaggerDefinition = {
    openapi: "3.0.3",

    info: {
        title: "BeroTrac API",
        version: "1.0.0",
        description:
            "Financial Transparency API for Hotel Sales, Expenses and Pending Transactions",
    },

    servers: [
        {
            url: "http://localhost:5000/api/v1",
            description: "Development Server",
        },
    ],

    components: {
        securitySchemes: {
            bearerAuth: {
                type: "http",
                scheme: "bearer",
                bearerFormat: "JWT",
            },
        },
    },

    security: [
        {
            bearerAuth: [],
        },
    ],
};

module.exports = swaggerDefinition;