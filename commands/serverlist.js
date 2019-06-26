const utils = require("../utils.js");
const path = require('path');
const stateMachine = require('../statemachine.js');
const db = require("../db.js");

module.exports = {
    name: "serverlist",
    aliases: ["servers"],
    dmOnly: true,
    signedUpOnly: true,
    needsAdmin: false,
    needsConnection: false,
    execute: async (message, args) => {
        const user = (await db.userModel.find({userId: message.author.id}))[0];
        const serverList = user.serverList;

        // reply with servers
        let out = "Server list:\n";
        for (let i = 0; i < serverList.length; i++) {
            out += `**${serverList[i].ip}** - ${serverList[i].name}\n`;
        }
        message.channel.send(out);
    }
}