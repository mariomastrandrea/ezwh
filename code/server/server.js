'use strict';
const { application } = require('express');
const express = require('express');
const io_router = require('./api/internalOrdersRouter');
const testDescriptorRouter = require('./api/testDescriptorRouter');
const testResultRouter = require('./api/testResultRouter');
const userRouter = require('./api/userRouter');

// init express
const app = new express();
const port = 3001;

app.use(express.json());

//GET /api/test
app.get('/api/hello', (req,res)=>{
  let message = {
    message: 'Hello World!'
  }
  return res.status(200).json(message);
});

// activate the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

app.use('/api',io_router)
app.use('/api',testDescriptorRouter);
app.use('/api',testResultRouter);
app.use('/api',userRouter);

module.exports = app;