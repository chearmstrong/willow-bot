'use strict';

// const restify = require('restify');
const builder = require('botbuilder');
const cognitiveservices = require('botbuilder-cognitiveservices');
const config = require('./config/config.json');
const Cards = require('./cards/Cards');
const { sendMessageWithTyping } = require('./utils/messageUtils');
const handoff = require('botbuilder-handoff');
const express = require('express');
const { standard_responses, bot_details } = require('./resources/resources.json');
const Promise = require('bluebird');

const cards = new Cards();

//=========================================================
// Bot Setup
//=========================================================

const app = express();
//const server = restify.createServer();

app.listen(process.env.port || process.env.PORT || 3978, () => console.log('%s listening to %s', app.name, app.url));

const connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});


const bot = new builder.UniversalBot(connector, [
    function(session){
        if (!session.userData.returningUser) {
            return sendMessageWithTyping(session, `Hi! I'm ${bot_details.name}. 👋 I can help with any questions you have about ${bot_details.business}. 😊`)
                .then(() => {
                    return sendMessageWithTyping(session, standard_responses.questionOptions);
                }).then(() => {
                    session.userData.returningUser = true;
                    session.replaceDialog('welcome');
                });
        }
        return session.replaceDialog('qna');
    }
]);

bot.set('storage', new builder.MemoryBotStorage());   

app.post('/api/messages', connector.listen());

//=========================================================
// Bot Middleware
//=========================================================

// Anytime the major version is incremented any existing conversations will be restarted.
bot.use(builder.Middleware.dialogVersion({ version: 1.0, resetCommand: /^reset/i }));

//=========================================================
// QnA Maker
//=========================================================

const recognizer = new cognitiveservices.QnAMakerRecognizer({
    knowledgeBaseId: config.qna.id, 
    subscriptionKey: config.qna.key,
    top: 3
});
 
const qnaMakerTools = new cognitiveservices.QnAMakerTools();

bot.library(qnaMakerTools.createLibrary());
	
const basicQnAMakerDialog = new cognitiveservices.QnAMakerDialog({
	recognizers: [recognizer],
	defaultMessage: `${standard_responses.qnaNotFound} Ask another question or say 'contact' if you want to get in touch with one of the team.`,
	qnaThreshold: 0.3,
	feedbackLib: qnaMakerTools
});

// Override to also include the knowledgebase question with the answer on confident matches
basicQnAMakerDialog.respondFromQnAMakerResult = (session, qnaMakerResult) => {
    let result = qnaMakerResult;
    // var response = 'Here is the match from FAQ:  \r\n  Q: ' + result.answers[0].questions[0] + '  \r\n A: ' + result.answers[0].answer;
    sendMessageWithTyping(session, result.answers[0].answer)
        .then(() => {
            session.endDialog();
        });
}

// Override to log user query and matched Q&A before ending the dialog
basicQnAMakerDialog.defaultWaitNextMessage = (session, qnaMakerResult) => {
	session.endDialog();
}

//=========================================================
// Bot Dialogs
//=========================================================

bot.dialog('qna', basicQnAMakerDialog);

bot.dialog('welcome', [
    (session) => {
        return Promise.resolve()
            .then(() => {
                let welcomeCards = cards.welcomeCards(session);
                let reply = new builder
                    .Message(session)
                    .attachmentLayout(builder.AttachmentLayout.carousel)
                    .attachments(welcomeCards);
        
                return sendMessageWithTyping(session, reply)
            })
            .then(() => sendMessageWithTyping(session, standard_responses.homeAgain))
            .then(() => session.endDialog());
    }
]).triggerAction({ matches: 'WelcomeIntent' });

bot.dialog('about', [
    (session) => {
        return sendMessageWithTyping(session, `${bot_details.business} is a community that holds no boundaries in treasuring lives through the provision of specialist supportive, palliative and end of life care.`)
            .then(() => sendMessageWithTyping(session, 'Treasuring lives through the provision of seamless personalised high quality care, whenever and wherever it is needed. 😀'))
            .then(() => {
                let aboutUsCards = cards.aboutUsCards(session);
                let reply = new builder
                    .Message(session)
                    .attachmentLayout(builder.AttachmentLayout.carousel)
                    .attachments(aboutUsCards);

                return sendMessageWithTyping(session, reply);
            })
            .then(() => sendMessageWithTyping(session, standard_responses.homeOptions))
            .then(() => session.endDialog());
    }
]).triggerAction({ matches: 'AboutIntent' }); 

bot.dialog('agent', (session) => {
    const messageLower = session.message.text.toLowerCase();

    if (messageLower === 'cancel' || messageLower === 'endchat' || messageLower === 'end chat') {
        session.userData.speakingWithHuman = false;

        return sendMessageWithTyping(session, `Hey! You're back with ${bot_details.name}. 👋 `)
            .then(() => session.endDialog(standard_responses.homeOptions))
    }

    if (!session.userData.speakingWithHuman) {
        session.userData.speakingWithHuman = true;


        return sendMessageWithTyping(session, "I've notified one of the team to pick up this conversation and they'll respond soon.")
            .then(() => sendMessageWithTyping(session, "If you no longer want to speak to someone, say 'cancel' or 'end chat'."));
    }
}).triggerAction({ matches: 'ContactAnAgent' });

bot.dialog('services', [
    (session) => {
        return sendMessageWithTyping(session, 'We have a wide range of services available at the hospice.')
            .then(() => sendMessageWithTyping(session, "Here's just some of the things we have on offer."))
            .then(() => {
                let servicesCards = cards.servicesCards(session);
                let reply = new builder
                    .Message(session)
                    .attachmentLayout(builder.AttachmentLayout.carousel)
                    .attachments(servicesCards);
    
                    return sendMessageWithTyping(session, reply);
                })
            .then(() => sendMessageWithTyping(session, standard_responses.homeOptions))
            .then(() => session.endDialog());
    }
]).triggerAction({ matches: 'ServicesIntent' });

bot.dialog('contact', [
    (session) => {
        return sendMessageWithTyping(session, "It's easy to get in touch with us. Here's you options.")
            .then(() => {
                let contactCards = cards.contactCards(session);
                let reply = new builder
                    .Message(session)
                    .attachmentLayout(builder.AttachmentLayout.carousel)
                    .attachments(contactCards);
    
                    return sendMessageWithTyping(session, reply);
                })
            .then(() => sendMessageWithTyping(session, standard_responses.homeOptions))
            .then(() => session.endDialog());
    }
]).triggerAction({ matches: 'ContactIntent' }); 

//========================================================
// Agent handoff
//========================================================

// const isAgent = (session) => session.message.user.name.startsWith("Agent");

// handoff.setup(bot, app, isAgent, {
//     mongodbProvider: process.env.MONGODB_PROVIDER || "mongodb://willowburnmongo:lvbGGW9IGBzAwDaHEAfiKHXIxA87GwAccP8bmdouXHNb4OdT4tAyvrBFYeDeWNaozkudD6mK6xc97R3XlFoUAQ==@willowburnmongo.documents.azure.com:10255/?ssl=true&replicaSet=globaldb",
//     directlineSecret: process.env.MICROSOFT_DIRECTLINE_SECRET || "Lmosn8Piz14.cwA.Ab0.HnUb55wiagPD6YuWBmjr2HAYh-OxPJLiMV_grdwdmDo",
//     //textAnalyticsKey: process.env.CG_SENTIMENT_KEY,
//     //appInsightsInstrumentationKey: process.env.APPINSIGHTS_INSTRUMENTATIONKEY,
//     retainData: process.env.RETAIN_DATA || "false",
//     //customerStartHandoffCommand: process.env.CUSTOMER_START_HANDOFF_COMMAND
// });

//=========================================================
// Bot Intents
//=========================================================

bot.recognizer(new builder.RegExpRecognizer('WelcomeIntent', /^(welcome|end|home)/i));
bot.recognizer(new builder.RegExpRecognizer('AboutIntent', /^(about-us)/i));
bot.recognizer(new builder.RegExpRecognizer("ContactAnAgent", /^(contact-agent)/i));
bot.recognizer(new builder.RegExpRecognizer('ServicesIntent', /^(our-services)/i));
bot.recognizer(new builder.RegExpRecognizer('ContactIntent', /^(contact)$/i));