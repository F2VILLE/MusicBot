const Discord = require("discord.js")

module.exports = {
    options: {
        name: 'queue',
        description: 'Show you the list of songs to play',
    },
    /**
     * 
     * @param {Discord.CommandInteraction} interaction 
     */
    run(interaction) {
        const voiceChannel = interaction.member.voice?.channel
        if (!voiceChannel) {
            interaction.reply('You need to be in a voice channel to play music!')
            return
        }

        interaction.client.emit("queueSong", interaction)
    }
}