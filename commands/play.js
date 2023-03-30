const Discord = require("discord.js"),
    yts = require("ytsr"),
    play = require('play-dl'),
    ytdl = require("ytdl-core")
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
        play.validate(song).then(type => {
            console.log("Type :", type)
            if (type == "search") {
                if (song.startsWith("http") && play.yt_validate(url) === 'video') type = "yt_video"
            }
            if (type == "yt_video") {
                console.log("it's URL !")
                ytdl.getBasicInfo(song).then(infos => {
                    interaction.client.emit('addSong', { id: infos.videoDetails.videoId, duration: infos.videoDetails.lengthSeconds, title: infos.videoDetails.title, thumbnail: infos.videoDetails.thumbnails.pop(), channel: interaction.channelId, author: infos.videoDetails.author, member: interaction.member }, voiceChannel, interaction)
                    console.log("EMITED ADDSONG EVENT")
                    interaction.reply({
                        embeds: [
                            {
                                title: "Song added to queue",
                                description: `${infos.videoDetails.title} has been added to the queue !`,
                                color: 0x0099ff
                            }
                        ]
                    })
                })
                    .catch(err => {
                        console.error(err)
                        interaction.reply({
                            embeds: [{
                                title: "Error",
                                description: err.message,
                                color: "#ff0000"
                            }]
                        })
                    })
            }
            else if (type == "yt_playlist") {
                play.playlist_info(song).then(playlist => {
                    playlist.all_videos().then(async videos => {
                        for await (const video of videos) {
                            console.log("CHANNEL ICON URL", video.channel)
                            interaction.client.emit('addSong', { id: video.id, duration: video.durationInSec, title: video.title, thumbnail: video.thumbnails.pop(), channel: interaction.channelId, author: {name: video.channel.name, thumbnails: [(video.channel.iconURL() || interaction.client.user.avatarURL())]}, member: interaction.member }, voiceChannel, interaction)
                        }
                        interaction.reply({
                            embeds: [
                                {
                                    title: "Playlist added to queue",
                                    description: `${playlist.title} has been added to the queue !`,
                                    color: 0x0099ff
                                }
                            ]
                        })
                    })
                })
            }
            else if (type == "search") {
                yts(song, { limit: 5 }).then(res => {
                    res = res.items.filter(x => x.type === 'video')
                    let embed = {
                        title: 'Search Results',
                        fields: [],
                        color: 0x0099ff
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
                            },
                            {
                                type: 1,
                                components: [{
                                    type: 2,
                                    emoji: "❌",
                                    style: 2,
                                    custom_id: "cancel_search_"
                                }]
                            },
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
            }
        }).catch(console.error)


    }
}