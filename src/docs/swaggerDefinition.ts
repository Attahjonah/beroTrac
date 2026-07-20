// Dynamically determine the production URL based on where it's deployed.
// 1. Fallback to a custom SERVER_URL if defined in your dashboard env variables.
// 2. Automatically detect Railway's default domain variable if present.
// 3. Fallback to the hardcoded Render URL.
const productionUrl = 
  process.env.SERVER_URL || 
  (process.env.RAILWAY_PUBLIC_DOMAIN ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}/api/v1` : null) ||
  "https://berotrac.onrender.com/api/v1";

const swaggerDefinition = {
  openapi: '3.0.3',
  info: {
    title: 'BeroTrac API',
    version: '1.0.0',
    description: 'Financial Transparency API for Hotel Sales, Expenses and Pending Transactions',
  },
  servers: [
    {
      url: process.env.NODE_ENV === "production" ? productionUrl : "http://localhost:5000/api/v1",
      description: process.env.NODE_ENV === "production" ? "Production Server" : "Development Server",
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