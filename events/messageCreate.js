const Discord = require("discord.js")

module.exports = {
    /**
     * 
     * @param {Discord.Client} client 
     * @param {Discord.Message} message 
     */
    run(client, message) {
        if (message.attachments.size > 0) {
            if (!client.waitForMP3.includes(message.author.id)) return
            console.log(message.attachments.first().contentType)
            if (message.attachments.first().contentType == "audio/mpeg") {
                const voiceChannel = message.member.voice?.channel
                if (!voiceChannel) {
                    message.reply('You need to be in a voice channel to play music!')
                    return
                }
                message.isAMessage = true
                let attachment = message.attachments.first()
                attachment.isAnMP3 = true
                client.waitForMP3.splice(client.waitForMP3.indexOf(message.author.id), 1)
                client.emit("addSong", attachment, voiceChannel, message)
            }
            else {
                message.reply({
                    embeds: [
                        {
                            title: "Bad file type !",
                            description: "Please upload MP3/audio file !",
                            color: "RED"
                        }
                    ]
                })
            }

        }
        if (message.author.id === "836685191812218970") {
            if (message.content.startsWith("!triggerMemberAdd")) {
                client.emit("guildMemberAdd", (message.mentions.members.first() || message.member))
            }
        }
    }
}