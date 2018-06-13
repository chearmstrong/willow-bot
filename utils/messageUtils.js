const Promise = require('bluebird');

const sendMessageWithTyping = (session, message, timeout = 1500) => {
    session.sendTyping();
    return Promise.delay(timeout).then(() => session.send(message))
};

module.exports = {
    sendMessageWithTyping
};