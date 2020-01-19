const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const config = require('./config/keys');
const mongoose = require('mongoose');

mongoose.connect(config.mongoURI, {
    useNewUrlParser: true
});

app.use(bodyParser.json());
require('./models/Registration');
require('./routes/dialogFlowRoutes')(app);
require('./routes/fulfillmentRoutes')(app);
require('./models/Demand');
require('./models/Registration');

const PORT = process.env.PORT || 5000;
app.listen(PORT);