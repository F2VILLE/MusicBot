const Discord = require("discord.js")

module.exports = {
    options: {
        name: 'resume',
        description: 'Resume the music if paused',
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

        interaction.client.emit("resumeSong", interaction.guildId)
        
    }
}