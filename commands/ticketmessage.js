const Discord = require("discord.js")

module.exports = {
    options: {
        type: 1,
        name: "ticketmessage",
        description: "Créer le message 'Panel' pour les tickets",
        default_permission: false
    },
    /**
     * 
     * @param {Discord.CommandInteraction} interaction 
     */
    run(interaction) {
        interaction.channel.send({
            embeds: [
                {
                    title: ":ticket: Panel",
                    description: "Choisissez le Sujet du ticket que vous souhaitez créer.",
                    color: "#3a86ff",
                }
            ],
            components: [
                {
                    type: 1,
                    components: [
                        {
                            type: 3,
                            custom_id: "ticket_subject",
                            options: [
                                {
                                    emoji: "💰",
                                    label: "Remboursement",
                                    value: "refund",
                                    description: "Remboursement d'un achat"
                                },
                                {
                                    emoji: "🔴",
                                    label: "Plainte",
                                    value: "complaint",
                                    description: "Se plaindre d'un joueur ou problème RP"
                                },
                                {
                                    emoji: "❓",
                                    label: "Question",
                                    value: "question",
                                    description: "Question à propos du serveur"
                                },
                                {
                                    emoji: "💬",
                                    label: "Autre",
                                    value: "other",
                                    description: "Vous avez un problème qui ne se trouve pas dans la liste ?"
                                }
                            ],
                            placeholder: "Choisissez un Sujet"
                        },
                    ]
                }
            ]
        }).then(message => {
            interaction.reply({
                ephemeral: true,
                embeds: [
                    {
                        title: ":ticket: Panel créé",
                        description: "Message d'ouverture de tickets créé !",
                        color: "#3a86ff",
                    }
                ]
            })
        }).catch(e => {
            console.error(e)
            interaction.reply({
                embeds: [
                    {
                        title: ":x: Erreur",
                        description: "Une erreur est survenue lors de la création du message.",
                        color: "#ff0000",
                    }
                ]
            })
        })
    }
}