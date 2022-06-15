const Discord = require("discord.js")

module.exports = {
    options: {
        name: 'nowplaying',
        description: 'Show the currently playing song',
    },
    /**
     * 
     * @param {Discord.CommandInteraction} interaction 
     */
    run(interaction) {
        interaction.client.emit("nowPlaying", interaction)
    }
}