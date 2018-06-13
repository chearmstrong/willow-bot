'use strict';

const builder = require('botbuilder');
const { standard_responses, bot_details } = require('../resources/resources.json')

module.exports = class Cards {

        welcomeCards(session) {
        return [
            new builder.HeroCard(session)
            .title('About Us')
            .subtitle(`Find out more about ${bot_details.business}.`)
            .images([
                builder.CardImage.create(session, 'https://willow-burn.co.uk/wp-content/uploads/2016/10/Untitled-2.png')
            ])
            .buttons([
                builder.CardAction.postBack(session, 'about-us', 'About Us')
			]),			new builder.HeroCard(session)
            .title('Our Services')
            .subtitle(`The services on offer at ${bot_details.business}.`)
            .images([
                builder.CardImage.create(session, 'https://willow-burn.co.uk/wp-content/uploads/2016/10/Untitled-16.png')
            ])
            .buttons([
                builder.CardAction.postBack(session, 'our-services', 'Our Services')
            ]),
			new builder.HeroCard(session)
            .title('Donate')
            .subtitle(`Give a donation to ${bot_details.business}.`)
            .images([
                builder.CardImage.create(session, 'https://willow-burn.co.uk/wp-content/uploads/2016/10/Untitled-15.png')
            ])
            .buttons([
                builder.CardAction.openUrl(session, 'http://willow-burn.co.uk/donate/', 'Donate')
			]),
			new builder.HeroCard(session)
            .title('Contact Us')
            .subtitle('Need to speak to us? Get in touch.')
            .images([
                builder.CardImage.create(session, 'https://willow-burn.co.uk/wp-content/uploads/2016/10/Untitled-14.png')
            ])
            .buttons([
				builder.CardAction.openUrl(session, 'https://willow-burn.co.uk/contact-us/', 'Contact Details'),
				builder.CardAction.postBack(session, 'contact-agent', 'Message the Team')
            ]),
        ];
	}
	
	aboutUsCards(session) {
        return [
			new builder.HeroCard(session)
            .title('Money')
            .subtitle('Where your money goes.')
            .images([
                builder.CardImage.create(session, 'https://willow-burn.co.uk/wp-content/uploads/2016/10/Untitled-15.png')
            ])
            .buttons([
                builder.CardAction.openUrl(session, 'https://willow-burn.co.uk/our-shopping-list/', 'Money')
			]),
			new builder.HeroCard(session)
            .title('History')
            .subtitle(`The history of ${bot_details.business}.`)
            .images([
                builder.CardImage.create(session, 'https://willow-burn.co.uk/wp-content/uploads/2016/10/Untitled-14.png')
            ])
            .buttons([
                builder.CardAction.openUrl(session, 'https://willow-burn.co.uk/history/', 'History')
            ])
        ];
	}
	
	servicesCards(session) {
        return [
			new builder.HeroCard(session)
            .title('Day Hospice')
            .subtitle('Find out more about our day hospice.')
            .images([
                builder.CardImage.create(session, 'https://willow-burn.co.uk/wp-content/uploads/2016/11/94f39030e46b91d1ab072f43d85d3980-2.jpg')
            ])
            .buttons([
                builder.CardAction.openUrl(session, 'https://willow-burn.co.uk/day-hospice/', 'Day Hospice')
			]),
			new builder.HeroCard(session)
            .title('In-Patient Unit')
            .subtitle("Find out more about our in-patient unit.")
            .images([
                builder.CardImage.create(session, 'https://willow-burn.co.uk/wp-content/uploads/2016/11/a449df8a9061d434598752f89843eaf7.jpg')
            ])
            .buttons([
                builder.CardAction.openUrl(session, 'https://willow-burn.co.uk/ipu/', 'In-Patient Unit')
			]),
			new builder.HeroCard(session)
            .title('Family Support')
            .subtitle("Find out more about family support.")
            .images([
                builder.CardImage.create(session, 'https://willow-burn.co.uk/wp-content/uploads/2016/11/bbe27054824ef324f4514ba1dd63be2f.jpg')
            ])
            .buttons([
                builder.CardAction.openUrl(session, 'https://willow-burn.co.uk/ipu/', 'Family Support')
            ])
        ];
    }
    
	contactCards(session) {
        return [
			new builder.HeroCard(session)
            .title('Contact Details')
            .subtitle("Find out how to get in touch with us.")
            .images([
                builder.CardImage.create(session, 'https://willow-burn.co.uk/wp-content/uploads/2016/10/Untitled-16.png')
            ])
            .buttons([
                builder.CardAction.openUrl(session, 'https://willow-burn.co.uk/contact-us/', 'Contact Details')
            ]),
            new builder.HeroCard(session)
            .title('Message the Team')
            .subtitle("Leave us a message here, and we'll get back to you ASAP.")
            .images([
                builder.CardImage.create(session, 'https://willow-burn.co.uk/wp-content/uploads/2016/10/Untitled-14.png')
            ])
            .buttons([
				builder.CardAction.postBack(session, 'contact-agent', 'Message the Team')
            ])
        ];
	}

};