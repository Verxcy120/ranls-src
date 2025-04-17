const bedrock = require('bedrock-protocol');
const fs = require('fs');
const { Authflow } = require('prismarine-auth');
const { NIL, v3: uuidv3, v4: uuidv4, v5: uuidv5 } = require("uuid");
const { genrandomstring } = require('./util.js')

function createClient(invite, namespoof,userid) {
    return bedrock.createClient({
        profilesFolder: `./data/user/profilefolders/${userid}`,
        connectTimeout: 500,
        username: userid,
        offline: false,
        realms: invite.length === 8 ? { realmId: invite } : { realmInvite: invite },
        skinData: {
            DeviceOS: 12,
            DeviceId: uuidv3(uuidv4(), NIL),
            PlatformOnlineId: genrandomstring(19, '0987654321'),
            PrimaryUser: true,
            SelfSignedId: uuidv4(),
            ThirdPartyName: namespoof ,
            ThirdPartyNameOnly: true,
            TrustedSkin: true,
        },
        skipPing: true
    });
}

module.exports = {
	createClient: createClient
};