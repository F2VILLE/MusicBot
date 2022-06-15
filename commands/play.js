const Discord = require("discord.js"),
    yts = require("ytsr"),
    play = require('play-dl')
const emojiNumbers = [
    "0️⃣",
    "1️⃣",
    "2️⃣",
    "3️⃣",
    "4️⃣",
    "5️⃣",
    "6️⃣",
    "7️⃣",
    "8️⃣",
    "9️⃣"
]

module.exports = {
    options: {
        name: 'play',
        description: 'Play a song from YouTube',
        options: [
            {
                type: 3,
                name: 'song',
                description: 'The song name or YT URL',
                required: true
            }
        ]
    },
    /**
     * 
     * @param {Discord.CommandInteraction} interaction 
     */
    run(interaction) {
        const song = interaction.options.getString('song')
        const voiceChannel = interaction.member.voice?.channel
        if (!voiceChannel) {
            interaction.reply('You need to be in a voice channel to play music!')
            return
        }

        // if (play.validate(song).valueOf()) {
        //     console.log("it's URL !")
        //     interaction.client.emit('addSong', song, voiceChannel, interaction.member)
        // }
        // else {
            yts(song, { limit: 5 }).then(res => {
                res = res.items.filter(x => x.type === 'video')
                let embed = {
                    title: 'Search Results',
                    fields: [],
                    color: "#0099ff"
                }

                for (let i = 0; i < res.length; i++) {
                    embed.fields.push({
                        name: `${emojiNumbers[i + 1]} - [${res[i].duration}]`,
                        value: res[i].title
                    })

                }

                let components = []

                for (let i = 0; i < res.length; i++) {
                    components.push({
                        type: 2,
                        emoji: emojiNumbers[i + 1],
                        style: 2,
                        custom_id: "play_music_" + interaction.guild.id + "_" + res[i].id
                    })
                }

                interaction.reply({
                    embeds: [embed],
                    components: [
                        {
                            type: 1,
                            components
                        }
                    ]
                })
            }).catch(e => {
                interaction.reply({
                    embeds: [{
                        title: ':x: Error',
                        description: e.message
                    }]
                })
            })
        // }


    }
}