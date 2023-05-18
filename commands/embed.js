const Discord = require("discord.js")

module.exports = {
    options: {
        type: 1,
        name: "embed",
        description: "Créer un embed",
        options: [
            {
                type: 3,
                name: "description",
                description: "Description de l'embed",
                required: true
            },
            {
                type: 3,
                name: "color",
                description: "Couleur de l'embed (en hexadecimal)",
            },
            {
                type: 3,
                name: "title",
                description: "Titre de l'embed",
            },
            {
                type: 3,
                name: "thumbnail",
                description: "URL de l'image de la miniature",
            },
            {
                type: 3,
                name: "image",
                description: "URL de l'image principale",
            },
            {
                type: 3,
                name: "author_image",
                description: "URL de l'image de l'auteur",
            },
            {
                type: 3,
                name: "author_name",
                description: "Nom de l'auteur",
            },
            {
                type: 3,
                name: "footer_image",
                description: "URL de l'image du bas de page",
            },
            {
                type: 3,
                name: "footer_text",
                description: "Texte du bas de page",
            },
        ],
        default_member_permissions: false
    },
    /**
     * 
     * @param {Discord.CommandInteraction} interaction 
     */
    run(interaction) {
        const description = interaction.options.getString("description")
        const color = interaction.options.getString("color")
        const title = interaction.options.getString("title")
        const thumbnail = interaction.options.getString("thumbnail")
        const image = interaction.options.getString("image")
        const author_image = interaction.options.getString("author_image")
        const author_name = interaction.options.getString("author_name")
        const footer_image = interaction.options.getString("footer_image")
        const footer_text = interaction.options.getString("footer_text")

        let embed = {}

        embed.description = description

        color ? embed.color = color : null
        title ? embed.title = title : null
        thumbnail ? embed.thumbnail = { url: thumbnail } : null
        image ? embed.image = { url: image } : null
        author_image ? embed.author = { icon_url: author_image } : null
        author_name ? embed.author = { name: author_name } : null
        footer_image ? embed.footer = { icon_url: footer_image } : null
        footer_text ? embed.footer = { text: footer_text } : null

        interaction.channel.send({
            embeds: [embed]
        })
            .then(() => {
                interaction.deferReply();
                interaction.deleteReply();
            }).catch(e => {
                interaction.reply({
                    embeds: [{
                        title: ":x: Erreur",
                        description: e.message,
                        color: "RED",
                        timestamp: new Date()
                    }]
                })
            })
    }
}