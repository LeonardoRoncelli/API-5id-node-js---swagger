// app.js
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');
const path = require('path');

const app = express();
const port = 3000;

// Swagger definition
const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'My API',
            version: '1.0.0',
            description: 'API documentation using Swagger',
        },
        servers: [
            {
                // use a generic local server URL for docs
                url: `http://localhost:${port}/api`,
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
    },
    apis: ['./routes/*.js'], // Path to your API docs
};

// Middleware per il parsing JSON
app.use(express.json());

// Serve static frontend files from ../frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// API routes
const userRoutes = require('./routes/user');
app.use('/api', userRoutes);

// Swagger UI
const swaggerDocs = swaggerJSDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Fallback: serve index.html on root
app.get('/', (req, res) => {
    const indexPath = path.join(__dirname, '../frontend/index.html');
    console.log('GET / -> serving', indexPath);
    const fs = require('fs');
    console.log('exists:', fs.existsSync(indexPath));
    res.sendFile(indexPath);
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});