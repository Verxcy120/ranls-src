const fs = require('fs');
const path = require('path');

const whitelistFilePath = path.join(__dirname, '..', 'data', 'client', 'whitelist.json');

function loadWhitelist() {
    try {
        return JSON.parse(fs.readFileSync(whitelistFilePath, 'utf-8'));
    } catch (error) {
        console.error('Error loading whitelist file:', error);
        return [];
    }
}

function saveWhitelist(whitelist) {
    try {
        fs.writeFileSync(whitelistFilePath, JSON.stringify(whitelist, null, 2), 'utf-8');
    } catch (error) {
        console.error('Error saving whitelist file:', error);
    }
}

exports.run = async (message, args) => {
    if (args.toString().trim() === '') {
        return message.reply('`!whitelist` is a command to add a Realm code to the whitelist.\n\nSyntax: !whitelist <realm-code>');
    }

    const realmCode = args.toString().trim();
    const whitelist = loadWhitelist();

    if (whitelist.includes(realmCode)) {
        return message.reply('This Realm code is already in the whitelist!');
    }

    whitelist.push(realmCode);
    saveWhitelist(whitelist);

    message.reply(`Successfully added **${realmCode}** to the whitelist!`);
};
