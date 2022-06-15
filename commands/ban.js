const Discord = require("discord.js")

module.exports = {
    options: {
        type: 1,
        name: "ban",
        description: "Bannissez un membre du serveur",
        options: [
            {
                type: 6,
                name: "member",
                description: "Membre à bannir",
                required: true
            },
            {
                type: 3,
                name: "reason",
                description: "Raison du bannissement",
                required: true
            },
            {
                type: 4,
                name: "time",
                description: "Nombre de jours de ban (1-7)"
            }
        ],
        userPermissions: ["BAN_MEMBERS"],
        default_permission: false
    },
    /**
     * 
     * @param {Discord.CommandInteraction} interaction 
     */
    run(interaction) {
        const member = interaction.guild.members.cache.get(interaction.options.getUser("member").id)
        let banOptions = {
            reason: interaction.options.getString("reason")
        }

        if (interaction.options.getInteger("time")) {
            if (interaction.options.getInteger("time") > 0 && interaction.options.getInteger("time") < 8) {
                banOptions.days = interaction.options.getInteger("time")
            } else {
                return interaction.reply({
                    ephemeral: true,
                    embeds: [
                        {
                            title: ":x: Erreur",
                            description: "Vous devez choisir un nombre de jour entre 1 et 7 compris.",
                            color: "RED",
                            timestamp: new Date(),
                            footer: {
                                text: interaction.guild.name,
                                icon_url: interaction.guild.iconURL({ dynamic: true })
                            }
                        }]
                })
            }
        }

        member.ban(banOptions).then(member => {
            return interaction.reply({
                embeds: [{
                    author: { name: `🔨${member.user.tag} a été banni`, icon_url: member.user.displayAvatarURL({ format: "png", dynamic: true }) },
                    description: `${member.user.tag} a été banni par ${interaction.user.tag}\n\n__**Raison:**__\`\`\`${banOptions.reason}\`\`\``,
                    color: "RED",
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