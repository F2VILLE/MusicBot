const Discord = require("discord.js")

module.exports = {
    options: {
        type: 1,
        name: "ping",
        description: "Ping!",
    },
    /**
     * 
     * @param {Discord.CommandInteraction} interaction 
     */
    run(interaction) {
        interaction.reply({
            ephemeral: true,
            embeds: [
                {
                    title: ":ping_pong: Pong!",
                    description: `\`\`\`${interaction.client.ws.ping} ms\`\`\``,
                    color: "RANDOM",
                    timestamp: new Date(),
                    footer: {
                        text: interaction.guild.name,
                        icon_url: interaction.guild.iconURL({dynamic: true})
                    }
                }
            ]
        })
    }
}