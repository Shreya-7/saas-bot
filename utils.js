const fs = require('node:fs');
const path = require('node:path');
const DONE_EMOJI = '👍';

function isMessageTodoDone(message) {
    const messageReaction = message.reactions.resolve(DONE_EMOJI);
    console.log(`Message "${message.content}" by ${message.author.username} has reactions=${messageReaction == null}`)
    if (messageReaction) {
        return messageReaction.count > 0;
    }
    return false;
}

function fetchFilesFromPath(folderName) {
    var items = [];
    const itemPath = path.join(__dirname, folderName);
    const itemFiles = fs.readdirSync(itemPath).filter(file => file.endsWith('.js'));
    for (const file of itemFiles) {
        const filePath = path.join(itemPath, file);
        const item = require(filePath);
        items.push(item);
    }
    return items;
}

module.exports = { isMessageTodoDone, fetchFilesFromPath, DONE_EMOJI };