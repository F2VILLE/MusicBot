const Discord = require("discord.js"),
    fs = require("fs"),
    client = new Discord.Client({ intents: ["GUILDS", "GUILD_MEMBERS", "GUILD_MESSAGES", "GUILD_MESSAGE_REACTIONS", "GUILD_MESSAGE_TYPING", "DIRECT_MESSAGES", "GUILD_INTEGRATIONS", "GUILD_PRESENCES", "GUILD_VOICE_STATES"] }),
    dvoice = require("@discordjs/voice"),
    play = require('play-dl');

require("dotenv").config()

client.commands = new Discord.Collection()

const players = new Discord.Collection()

fs.readdirSync("./events/").forEach(file => {
    if (!file.endsWith(".js")) return
    const event = require(`./events/${file}`)
    let eventName = file.split(".")[0]
    client.on(eventName, (...args) => { event.run(client, ...args) })
})


fs.readdirSync("./commands/").forEach(file => {
    if (!file.endsWith(".js")) return
    const command = require(`./commands/${file}`)
    client.commands.set(command.options.name, command)
})

client.on("nowPlaying", (interaction) => {
    const song = players.get(interaction.guildId)?.nowPlaying
    interaction.reply({
        embeds: [
            {
                author: { name: song.author.name, icon_url: song.author.thumbnails[0].url },
                title: "💽 Now Playing : " + song.title,
                image: { url: song.thumbnail.url },
                footer: { text: interaction.member.user.tag, icon_url: interaction.member.user.displayAvatarURL({ dynamic: true }) },
                color: "#0099ff"
            }
        ],
        components: [
            {
                type: 1,
                components: [
                    {
                        type: 2,
                        emoji: "▶️",
                        custom_id: "cmdplay",
                        style: 2
                    },
                    {
                        type: 2,
                        emoji: "⏸️",
                        custom_id: "cmdpause",
                        style: 2
                    },
                    {
                        type: 2,
                        emoji: "⏭️",
                        custom_id: "cmdskip",
                        style: 2
                    },
                ]
            }
        ]
    }).catch(e => {
        console.log(e)
    })

})

function secondsToTime(rawseconds) {
    const minutes = Math.floor(rawseconds / 60)
    const seconds = rawseconds % 60
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`
}

client.on("skipSong", (interaction) => {
    client.emit("playSong", interaction)
    interaction.reply({
        embeds: [
            {
                title: "⏭️ Song skipped",
                description: "The current song has been skipped!",
                color: "#0099ff"
            }
        ]
    })
})

client.on("queueSong", (interaction) => {
    const songs = players.get(interaction.guildId)?.queue
    if (songs) {
        let i = 0
        interaction.reply({
            embeds: [
                {
                    title: "🎵 Songs in queue",
                    description: songs.map(x => {
                        "`[" + (i++) + "]`" + x.title + " (" + secondsToTime(x.duration) + ")\n"
                    }),
                    color: "#0099ff"
                }
            ]
        })
    }
})

client.on("pauseSong", async (interaction) => {
    if (players.get(interaction.guildId).player) {
        players.get(interaction.guildId).player.pause()
        interaction.reply({
            embeds: [
                {
                    author: { name: interaction.member.user.tag, icon_url: interaction.member.user.displayAvatarURL({ dynamic: true }) },
                    title: "⏸ Song paused",
                    description: "The current song has been paused !",
                    color: "#0099ff"
                }
            ]
        })
    }
})

client.on("resumeSong", async (interaction) => {
    if (players.get(interaction.guildId)?.player) {
        players.get(interaction.guildId).player.unpause()
        interaction.reply({
            embeds: [
                {
                    author: { name: interaction.member.user.tag, icon_url: interaction.member.user.displayAvatarURL({ dynamic: true }) },
                    title: "▶️ Song resumed",
                    description: "The music has been resumed !",
                    color: "#0099ff"
                }
            ]
        })
    }
})

client.on("playSong", async (interaction) => {
    const guildId = interaction.guildId
    console.log("PLAYSONG EVENT")
    console.log(interaction.guildId + " == " + interaction.guild?.id)
    if (players.get(guildId)?.queue.length) {
        console.log(players.get(guildId)?.queue)
        const song = players.get(guildId).queue[0]
        const stream = await play.stream('https://www.youtube.com/watch?v=' + song.id, { discordPlayerCompatibility: true, precache: true })
        const resource = dvoice.createAudioResource(stream.stream, { inputType: stream.type })
        players.get(guildId).player.play(resource)
        players.get(guildId).nowPlaying = song
        players.get(guildId).queue.shift()
        const channel = await client.channels.fetch(song.channel)
        channel?.send({
            embeds: [
                {
                    author: { name: song.author.name, icon_url: song.author.thumbnails[0].url },
                    title: "💽 Now Playing : " + song.title,
                    image: { url: song.thumbnail.url },
                    footer: { text: interaction.member.user.tag, icon_url: interaction.member.user.displayAvatarURL({ dynamic: true }) },
                    color: "#0099ff"
                }
            ],
            components: [
                {
                    type: 1,
                    components: [
                        {
                            type: 2,
                            emoji: "▶️",
                            custom_id: "cmdplay" + guildId,
                            style: 2
                        },
                        {
                            type: 2,
                            emoji: "⏸️",
                            custom_id: "cmdpause" + guildId,
                            style: 2
                        },
                        {
                            type: 2,
                            emoji: "⏭️",
                            custom_id: "cmdskip" + guildId,
                            style: 2
                        },
                    ]
                }
            ]
        }).catch(e => {
            console.log(e)
        })
    }
    else {
        console.log("No More Songs in queue")
        if (players.get(guildId)) {
            players.get(guildId).player?.stop()
            players.delete(guildId)
        }
    }
})

client.on("addSong", async (song, voiceChannel, interaction) => {
    if (players.get(voiceChannel.guild.id)) {
        players.get(voiceChannel.guild.id).queue.push(song)
        console.log(song.title + " added to queue")
        console.log(players.get(voiceChannel.guild.id))
    }
    else {
        let connection = dvoice.getVoiceConnection(voiceChannel.guild.id)
        if (!connection) {
            dvoice.joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: voiceChannel.guild.id,
                adapterCreator: voiceChannel.guild.voiceAdapterCreator
            })
            connection = dvoice.getVoiceConnection(voiceChannel.guild.id)
            connection.on(dvoice.VoiceConnectionStatus.Disconnected, async (oldState, newState) => {
                try {
                    await Promise.race([
                        entersState(connection, dvoice.VoiceConnectionStatus.Signalling, 5_000),
                        entersState(connection, dvoice.VoiceConnectionStatus.Connecting, 5_000),
                    ]);
                } catch (error) {
                    connection.destroy();
                }
            });
        }
        players.set(voiceChannel.guild.id, { connection: connection, player: dvoice.createAudioPlayer({ behaviors: { noSubscriber: dvoice.NoSubscriberBehavior.Pause } }), queue: [] })
        players.get(voiceChannel.guild.id).player.on("stateChange", (oldState, newState) => {
            if (newState.status == "idle") {
                console.log("Player changed state !")
                if (players.get(voiceChannel.guild.id) && players.get(voiceChannel.guild.id).queue.length > 0) {
                    client.emit("playSong", voiceChannel.guild.id)
                }
                else {
                    players.delete(voiceChannel.guild.id)
                }
            }
        })
        players.get(voiceChannel.guild.id).player.on("error", (err) => {
            console.log(err)
        })
        players.get(voiceChannel.guild.id).connection.subscribe(players.get(voiceChannel.guild.id).player)
        players.get(voiceChannel.guild.id).queue.push(song)
        client.emit("playSong", interaction)
    }
})

client.login(process.env.TOKEN)