const dialogflow = require("dialogflow");
const structjson = require("./structjson");
const config = require("../config/keys");
const projectID = config.googleProjectID;
const mongoose = require('mongoose');
const credentials = {
    client_email: config.googleClientEmail,
    private_key: config.googlePrivateKey
};
const sessionClient = new dialogflow.SessionsClient({
    projectID,
    credentials
});

const sessionPath = sessionClient.sessionPath(config.googleProjectID, config.dialogFlowSessionID);
const Registration = mongoose.model('registration');

module.exports = {
    textQuery: async function (text, parameters = {}) {
        let self = module.exports;
        // The text query request.
        const request = {
            session: sessionPath,
            queryInput: {
                text: {
                    // The query to send to the dialogflow agent
                    text: text,
                    // The language used by the client (en-US)
                    languageCode: config.dialogFlowSessionLanguageCode
                }
            },
            queryParams: {
                payload: {
                    data: parameters
                }
            }
        };
        let responses = await sessionClient.detectIntent(request);
        responses = await self.handleAction(responses);
        return responses;
    },

    eventQuery: async function (event, parameters = {}) {
        let self = module.exports;
        const request = {
            session: sessionPath,
            queryInput: {
                event: {
                    name: event,
                    parameters: structjson.jsonToStructProto(parameters),
                    languageCode: config.dialogFlowSessionLanguageCode
                }
            }
        };
        let responses = await sessionClient.detectIntent(request);
        responses = await self.handleAction(responses);
        return responses;
    },

    handleAction: function (responses) {
        let self = module.exports;
        let queryResult = responses[0].queryResult;
        switch (queryResult.action) {
            case 'differentWebsites-yes':
                if (queryResult.allRequiredParamsPresent) {
                    self.saveRegistration(queryResult.parameters.fields);
                }
                break;
        }
        return responses;
    },
    saveRegistration: async function (fields) {
        const registration = new Registration({
            name: fields.name.stringValue,
            address: fields.address.stringValue,
            phone: fields.phone.stringValue,
            email: fields.email.stringValue,
            dataSent: Data.now()
        });
        try {
            let reg = await registration.save();
            console.log(reg);
        } catch (err) {
            console.log(err);
        }
    }
};