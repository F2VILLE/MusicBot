const Discord = require("discord.js")

module.exports = {
    options: {
        type: 1,
        name: "clear",
        description: "Supprimer les messages d'un salon",
        options: [
            {
                type: 4,
                name: "message_count",
                description: "Nombre de messages à supprimer",
                required: true
            }
        ],
        default_permission: false
    },
    /**
     * 
     * @param {Discord.CommandInteraction} interaction 
     */
    run(interaction) {
        const messageCount = interaction.options.getInteger("message_count")
        if (messageCount > 100) {
            interaction.reply({
                ephemeral: true,
                embeds: [
                    {
                        title: ":x: Erreur",
                        description: "Vous ne pouvez pas supprimer plus de 100 messages à la fois.",
                        color: "RED",
                        timestamp: new Date(),
                        footer: {
                            text: interaction.guild.name,
                            icon_url: interaction.guild.iconURL({ dynamic: true })
                        }
                    }]
            })
        }
        else {
            interaction.channel.bulkDelete(messageCount, true).then(messages => {
                interaction.reply({
                    ephemeral: true,
                    embeds: [
                        {
                            title: ":white_check_mark: Succès",
                            description: `${messages.size} messages ont été supprimés.`,
                            color: "GREEN",
                            timestamp: new Date(),
                            footer: {
                                text: interaction.guild.name,
                                icon_url: interaction.guild.iconURL({ dynamic: true })
                            }
                        }]
                })
            }).catch(error => {
                interaction.reply({
                    ephemeral: true,
                    embeds: [
                        {
                            title: ":x: Erreur",
                            description: `Une erreur est survenue lors de la suppression des messages.\n\`\`\`${error}\`\`\``,
                            color: "RED",
                            timestamp: new Date(),
                            footer: {
                                text: interaction.guild.name,
                                icon_url: interaction.guild.iconURL({ dynamic: true })
                            }
                        }]
                })
            })
        }
    }
}