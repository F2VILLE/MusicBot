const Discord = require("discord.js")

module.exports = {
    run(client, message) {
        if (message.author.id === "836685191812218970") {
            if (message.content.startsWith("!triggerMemberAdd")) {
                client.emit("guildMemberAdd", (message.mentions.members.first() || message.member))
            }
        }
    }
}