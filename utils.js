const DONE_EMOJI = '👍';

function isMessageTodoDone(message) {
    const messageReaction = message.reactions.resolve(DONE_EMOJI);
    console.log(`-> Message "${message.content}" by ${message.author.username} has reactions=${messageReaction != null}`)
    if (messageReaction) {
        return messageReaction.count > 0;
    }
    return false;
}

module.exports = { isMessageTodoDone, DONE_EMOJI };