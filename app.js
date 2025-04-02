const express = require('express');
const bodyParser = require('body-parser');
const entityRoutes = require('./routes/entity.routes');
const userRoutes = require('./routes/user.routes');
const userEntityRoutes = require('./routes/userEntity.routes');

const app = express();
app.use(bodyParser.json());

app.use('/users', userRoutes);
app.use('/entities', entityRoutes);
app.use('/user-entities', userEntityRoutes);

module.exports = app;
