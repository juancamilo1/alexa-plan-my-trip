function generateSpeechResponse(speech, shouldEndSession) {
    return {
        "outputSpeech": {
            "type": 'PlainText',
            "text": speech
        },
        "shouldEndSession": shouldEndSession
    }
}

function generateFinalOutput(response, sessionAttributes) {
    return {
        version: '1.0',
        sessionAttributes,
        response
    };
}

function processLaunchRequest(event, res) {
    const greeting = 'Welcome to plan my trip. You can say Help me plan my trip';
    const response = generateSpeechResponse(greeting, false);
    const sessionAttributes = {};
    const output = generateFinalOutput(response, sessionAttributes);

    res.send(output);
}

function processPlanMyTrip(event, res) {
    console.log(event);
    if (event.request.dialogState === 'STARTED' || event.request.dialogState === 'IN_PROGRESS') {
        const fromCityValue = event.request.intent.slots.fromCity.value;
        const toCityValue = event.request.intent.slots.toCity.value;
        if (fromCityValue && fromCityValue === 'Dallas' && !toCityValue) {
            const output = {
                "version": "1.0",
                "sessionAttributes": {},
                "response": {
                    "outputSpeech": null,
                    "shouldEndSession": false,
                    "directives": [{
                        "type": "Dialog.Delegate",
                        "slotToElicit": "fromCity",
                        "updatedIntent": {
                            "name": "PlanMyTrip",
                            "confirmationStatus": "NONE",
                            "slots": {
                                "toCity": {
                                    "name": "toCity",
                                    "confirmationStatus": "NONE",
                                    "value": "seattle"
                                },
                                "travelDate": {
                                    "name": "travelDate",
                                    "confirmationStatus": "NONE"
                                },
                                "fromCity": {
                                    "name": "fromCity",
                                    "confirmationStatus": "NONE",
                                    "value": fromCityValue
                                }
                            }
                        }
                    }]
                }
            };
            res.send(output);
        } else {
            const response = {
                "outputSpeech": null,
                "card": null,
                "directives": [{
                    "type": "Dialog.Delegate"
                }],
                "reprompt": null,
                "shouldEndSession": false
            };
            const sessionAttributes = {};
            const output = generateFinalOutput(response, sessionAttributes);
            res.send(output);
        }
    } else if (event.request.dialogState === 'COMPLETED') {
        const fromCity = event.request.intent.slots.fromCity.value;
        const toCity = event.request.intent.slots.toCity.value;
        const travelDate = event.request.intent.slots.travelDate.value;

        // Some business logic.
        const speech = `Your travel itenerary is from ${fromCity} to ${toCity} on ${travelDate}.`;
        const response = generateSpeechResponse(speech, true);
        const sessionAttributes = {};
        const output = generateFinalOutput(response, sessionAttributes);
        res.send(output);
    }
}

function processStopIntent(res) {
    const speechText = 'Thank you for using Plan My Trip. Good bye';
    const response = generateSpeechResponse(speechText, true);
    const sessionAttributes = {};
    const output = generateFinalOutput(response, sessionAttributes);
    res.send(output);
}

function processHelpIntent(res) {
    const speechText = 'You can say help me Plan My Trip or you can say something like I wish to visit Dallas from Tampa tomorrow';
    const response = generateSpeechResponse(speechText, true);
    const sessionAttributes = {};
    const output = generateFinalOutput(response, sessionAttributes);
    res.send(output);
}

function processIntentRequest(event, res) {
    switch(event.request.intent.name) {
        case 'AMAZON.CancelIntent':
            processStopIntent(res);
            break;
        case 'AMAZON.HelpIntent':
            processHelpIntent(res);
            break;
        case 'AMAZON.StopIntent':
            processStopIntent(res);
            break;
        case 'PlanMyTrip':
            processPlanMyTrip(event, res);
            break
    }
}

function processSessionEnded(event, res) {
    // close any third party connections
    console.log(JSON.stringify(event.request.error));
}

exports.process = (req, res) => {
    let event = req.body;

    switch(event.request.type) {
        case 'LaunchRequest':
            processLaunchRequest(event, res);
            break;
            case 'IntentRequest':
                processIntentRequest(event, res);
                break;
            case 'SessionEndedRequest':
                processSessionEnded(event, res);
                break;
    }
}