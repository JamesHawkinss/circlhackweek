const db = require("../db.js");
const utils = require("../utils.js");
const stateMachine = require('../statemachine.js');
const path = require('path');

module.exports = {
    name: "rm",
    aliases: ["remove"],
    dmOnly: true,
    signUpOnly: true,
    needsAdmin: true,
    needsConnection: true,
    execute: async (message, args) => {
        const connectedServer = stateMachine.getState(message.author.id, "connectedServer");
        const pathState = stateMachine.getState(message.author.id, "path");

        if (args.length !== 1) {
            return message.channel.send(utils.sendError("You need to enter the file name!"));
        }

        const server = (await db.serverModel.find({ ip: connectedServer }))[0];

        let pathInput = args[0];
        let hasWildcard = false;
        // wildcard support
        if (pathInput.endsWith("*")) {
            pathInput = pathInput.slice(0,-1);
            hasWildcard = true;
        }
        const newPath = path.join(pathState, pathInput);

        const file = utils.explorePath(server.files, utils.splitPath(newPath), "files");
        if (!file) {
            return message.channel.send(utils.sendError("Invalid path!"));
        } else {
            if (hasWildcard) {
                if (file.type == "file") {
                    // if wildcard and is file, path is invalid.
                    return message.channel.send(utils.sendError("Invalid path!"));
                }
                // remove everything in dir
                for (let i = 0; i < file.contents.length; i++) {
                    if (file.contents[i].type === "file") {
                        // remove if file.
                        server.set(file.path + ".contents." + i, undefined); // TODO rework the error, not set to null
                    }
                }
                server.save((err, server) => {
                    if (err) {
                        console.log(error);
                        return message.channel.send(utils.sendError("Could not save the server ☹"));
                    }
                    return message.channel.send(utils.sendSuccess("Deleted files in directory!"));
                });
            } else {
                if (file.type !== "file") {
                    // only delete a single file, dir's cant be removed.
                    return message.channel.send(utils.sendError("Can only be run on files!"));
                }
                // remove file
                server.set(file.path, undefined); // TODO rework the error, not set to null
                server.save((err, server) => {
                    if (err) {
                        console.log(error);
                        return message.channel.send(utils.sendError("Could not save the server ☹"));
                    }
                    return message.channel.send(utils.sendSuccess("Deleted file!"));
                });
            }
        }
    }
}