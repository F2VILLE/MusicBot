const Discord = require("discord.js")

module.exports = {
    options: {
        type: 1,
        name: "kick",
        description: "Expulser un membre du serveur",
        options: [
            {
                type: 6,
                name: "member",
                description: "Membre à expulser",
                required: true
            },
            {
                type: 3,
                name: "reason",
                description: "Raison de l'expulsion",
                required: true
            }
        ],
        userPermissions: ["KICK_MEMBERS"],
        default_permission: false
    },
    /**
     * 
     * @param {Discord.CommandInteraction} interaction 
     */
    run(interaction) {
        const member = interaction.guild.members.cache.get(interaction.options.getUser("member").id)
        let reason = interaction.options.getString("reason")

        member.kick(reason).then(member => {
            return interaction.reply({
                embeds: [{
                    author: { name: `👊${member.user.tag} a été expulsé`, icon_url: member.user.displayAvatarURL({ format: "png", dynamic: true }) },
                    description: `${member.user.tag} a été expulsé par ${interaction.user.tag}\n\n__**Raison:**__\`\`\`${reason}\`\`\``,
                    color: "NAVY",
                    timestamp: new Date(),
                    footer: {
                        text: interaction.guild.name,
                        icon_url: interaction.guild.iconURL({ dynamic: true })
                    }
                }]
            })
        }).catch(err => {
            console.error(err)
            return interaction.reply({
                ephemeral: true,
                embeds: [
                    {
                        title: ":x: Erreur",
                        description: (err.message ? err.message : err),
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