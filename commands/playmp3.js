const Discord = require("discord.js")

module.exports = {
    options: {
        name: 'playmp3',
        description: 'Play a song from MP3 file',
        options: [
            {
                type: 3,
                name: 'mp3_url',
                description: 'URL of an MP3 file'
            }
        ]
    },
    /**
     * 
     * @param {Discord.CommandInteraction} interaction 
     */
    run(interaction) {
        const url = interaction.options.getString('mp3_url')
        if (!url) {
            interaction.client.emit("waitForMP3", interaction)
            interaction.reply({
                embeds: [
                    {
                        title: "Upload MP3",
                        description: "Please upload a MP3 file in this channel",
                        color: "BLUE"
                    }
                ]
            })
        }
        else {
            if (!url.endsWith(".mp3")) {
                message.reply({
                    embeds: [{
                        title: "Not an MP3 !",
                        description: "The link that you provided doesn't seems to be an MP3 file ! Be sure to give the direct link to MP3",
                        color: "RED"
                    }]
                })
                return
            }
            
            const voiceChannel = interaction.member.voice?.channel
            if (!voiceChannel) {
                interaction.reply('You need to be in a voice channel to play music!')
                return
            }
            interaction.client.waitForMP3.splice(interaction.client.waitForMP3.indexOf(interaction.user.id), 1)
            interaction.client.emit("addSong", {url, name: url.split("/").pop(), isAnMP3: true}, voiceChannel, interaction)
        }
    }
}