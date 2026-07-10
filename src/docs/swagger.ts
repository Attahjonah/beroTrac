import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import swaggerDefinition from './swaggerDefinition';

const options = {
  definition: swaggerDefinition,
  apis: [
    "./src/routes/**/*.ts",
    "./src/controllers/**/*.ts",
    "./dist/routes/**/*.js",
    "./dist/controllers/**/*.js",
  ],
};

const swaggerSpec = swaggerJsdoc(options);

export { swaggerUi, swaggerSpec };
