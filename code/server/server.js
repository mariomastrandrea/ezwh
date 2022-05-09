'use strict';
const { application } = require('express');
const express = require('express');

/**
 * Routers
 * - Each router refers to a specific group of models (orders, items, ecc.)
 *   and defines the mappings between the exposed REST APIs and the related
 *   controllers' methods implementing the main functionalities of the application
 */
const ordersRouter = require('./api/ordersRouter');
const itemsRouter  = require('./api/itemsRouter');
const testsRouter  = require('./api/testsRouter');
const usersRouter  = require('./api/usersRouter');

// init express
const app = new express();
const port = 3001;

app.use(express.json());

// link paths to the related routers
app.use('/api', ordersRouter);
app.use('/api', itemsRouter);
app.use('/api', testsRouter);
app.use('/api', usersRouter);
app.use('/api',testDescriptorRouter);
app.use('/api',testResultRouter);

// GET /api/test  -  * used for test only *
app.get('/api/hello', (req, res) => {
    let message = {
        message: 'Hello World!'
    }
    return res.status(200).json(message);
});

// activate the server
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});

module.exports = app;