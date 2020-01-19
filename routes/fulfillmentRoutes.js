const {
    WebhookClient
} = require('dialogflow-fulfillment');
const mongoose = require('mongoose');
const Demand = mongoose.model('demand');

module.exports = app => {
    app.post('/', async (req, res) => {
        const agent = new WebhookClient({
            request: req,
            response: res
        });

        function opes(agent) {
            agent.add('Welcome to Opes fulfillment');
        }

        function learn(agent) {
            Demand.findOne({
                'course': agent.parameters.course
            }, function (err, course) {
                if (course != null) {
                    course.counter++;
                    course.save();
                } else {
                    const demand = new Demand({
                        course: agent.parameters.course
                    });
                    demand.save();
                }
            });
            let responseText = 'You can apply about ${agent.parameters.courses}. Here is a link: https://www.linkedin.com/jobs/view/1645077657/ ';
            agent.add(responseText);
        }

        function fallback(agent) {
            agent.add('I did not understand');
            agent.add('I am sorry, can you try again?');
        }
        let intentMap = new Map();
        intentMap.set('opes', opes);
        intentMap.set('search the jobs', learn)
        intentMap.set('Default Fallback Intent', fallback);
        agent.handleRequest(intentMap);
    });
}