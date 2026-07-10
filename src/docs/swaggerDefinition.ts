const swaggerDefinition = {
  openapi: '3.0.3',
  info: {
    title: 'BeroTrac API',
    version: '1.0.0',
    description: 'Financial Transparency API for Hotel Sales, Expenses and Pending Transactions',
  },
  servers: [
  {
    url:
      process.env.NODE_ENV === "production"
        ? "https://berotrac.onrender.com/api/v1"
        : "http://localhost:5000/api/v1",
    description:
      process.env.NODE_ENV === "production"
        ? "Production Server"
        : "Development Server",
  },
],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
};

export default swaggerDefinition;
