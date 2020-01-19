const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json());

require('./routes/dialogFlowRoutes')(app);
require('./routes/fulfillmentRoutes')(app);
require('./models/Demand');
require('./models/Registration');

const PORT = process.env.PORT || 5000;
app.listen(PORT);