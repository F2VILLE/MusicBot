const Discord = require("discord.js"),
    fs = require("fs"),
    client = new Discord.Client({
        intents: [
            Discord.IntentsBitField.Flags.GuildIntegrations,
            Discord.IntentsBitField.Flags.GuildMembers,
            Discord.IntentsBitField.Flags.GuildMessages,
            Discord.IntentsBitField.Flags.GuildVoiceStates,
            Discord.IntentsBitField.Flags.Guilds,
            Discord.IntentsBitField.Flags.MessageContent,
            Discord.IntentsBitField.Flags.GuildMessageReactions
        ]
    }),
    dvoice = require("@discordjs/voice"),
    play = require('play-dl');
const ms = require("ms")
require("dotenv").config()

client.commands = new Discord.Collection()
client.waitForMP3 = []
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

client.on("waitForMP3", interaction => {
    client.waitForMP3.push(interaction.user.id)
    setTimeout(() => {
        client.waitForMP3.splice(client.waitForMP3.indexOf(interaction.user.id), 1)
    }, 60000)
})

client.on("nowPlaying", (interaction) => {
    const song = players.get(interaction.guildId)?.nowPlaying
    interaction.reply({
        embeds: [
            {
                author: { name: song.author.name, icon_url: song.author.thumbnails[0].url },
                title: "💽 Now Playing : " + song.title,
                description: secondsToTime(song.duration),
                image: { url: song.thumbnail.url },
                footer: { text: song.member.user.tag, icon_url: song.member.user.displayAvatarURL({ dynamic: true }) },
                color: 0x0099ff
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
                color: 0x0099ff
            }
        ]
    })
})

client.on("queueSong", async (interaction) => {
    const songs = [...players.get(interaction.guildId)?.queue]
    songs.unshift(players.get(interaction.guildId).nowPlaying)
    if (songs && songs.length > 0) {
        const embeds = []
        let songIndex = 1
        const formatedSongs = songs.map((x, i) => {
            return (i == 0 ? "**" : "") + "`[" + (songIndex++) + "]`" + x.title + " (" + secondsToTime(x.duration) + ")\n" + (i == 0 ? "** - Now playing" : "")
        })

        let embedIndex = 0

        const indexBar = "○".repeat(Math.ceil(formatedSongs.length / 5))
        for (let i = 0; i < formatedSongs.length; i += 5) {
            const embedSongs = [...formatedSongs].slice(i, i + 5)
            embeds.push({
                title: "🎵 Songs in queue",
                description: embedSongs.join("\n"),
                footer: { text: "○ ".repeat(i/5) + "◉ " + "○ ".repeat(Math.ceil(formatedSongs.length/5) - (i/5 + 1))},
                color: 0x0099ff
            })
        }
        interaction.reply({
            embeds: [
                embeds[0]
            ]
        }).then(() => {
            interaction.fetchReply().then(async (msg) => {
                console.log(msg)
                if (embeds.length > 1) {
                    msg.react("⬅️")
                    msg.react("➡️")
                    const filter = (reaction, user) => ["⬅️", "➡️"].includes(reaction.emoji.name) && user.id == interaction.user.id;

                    const collector = msg.createReactionCollector({ filter, time: 85000 })

                    collector.on("collect", async (r) => {
                        switch (r.emoji.name) {
                            case "⬅️":
                                embedIndex == 0 ? embedIndex = embeds.length - 1 : embedIndex--
                                break;
                            case "➡️":
                                embedIndex < embeds.length - 1 ? embedIndex++ : embedIndex = 0
                                break;
                        }
                        const userReactions = msg.reactions.cache.filter(reaction => reaction.users.cache.has(interaction.user.id));

                        try {
                            for await (const reaction of userReactions.values()) {
                                await reaction.users.remove(interaction.user.id);
                            }
                        } catch (error) {
                            console.error('Failed to remove reactions.');
                        }

                        msg.edit({
                            embeds: [
                                embeds[embedIndex]
                            ]
                        })
                    })
                }
            })
        })

    }
    else {
        interaction.reply({
            embeds: [
                {
                    title: "🎵 There's no song in queue",
                    description: "To add a song, use </play:1088589745266896973>",
                    color: 0x0099ff
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
                    color: 0x0099ff
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
                    color: 0x0099ff
                }
            ]
        })
    }
})

client.on("playSong", async (interaction) => {
    console.log("PLAYSONG EVENT")
    const guildId = interaction.guildId
    if (players.get(guildId)?.queue.length) {
        console.log(players.get(guildId)?.queue)
        const song = players.get(guildId).queue[0]
        if (song.isMP3) {
            const resource = dvoice.createAudioResource(song.url)
            players.get(guildId).player.play(resource)
            players.get(guildId).nowPlaying = song
            players.get(guildId).queue.shift()
            const channel = await client.channels.fetch(song.channel)
            channel?.send({
                embeds: [
                    {
                        title: "💽 Now Playing : " + song.title,
                        description: "Playing this song from [" + song.title + "](" + song.url + ") !",
                        footer: { text: interaction.member.user.tag, icon_url: interaction.member.user.displayAvatarURL({ dynamic: true }) },
                        color: 0x0099ff
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
        } else {
            console.log("SONG :", song)
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
                        footer: { text: song.member.user.tag, icon_url: song.member.user.displayAvatarURL({ dynamic: true }) },
                        color: 0x0099ff
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
    if (players.get(interaction.guild.id)) {
        if (song.isAnMP3) {
            const songMP3 = {
                title: song.name,
                url: song.url,
                channel: interaction.channel.id,
                isMP3: true
            }
            players.get(voiceChannel.guild.id).queue.push(songMP3)
        } else {
            players.get(voiceChannel.guild.id).queue.push(song)
        }
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

            // TRYING FIX TIMEOUT
            const networkStateChangeHandler = (oldNetworkState, newNetworkState) => {
                const newUdp = Reflect.get(newNetworkState, 'udp');
                clearInterval(newUdp?.keepAliveInterval);
            }

            connection.on('stateChange', (oldState, newState) => {
                const oldNetworking = Reflect.get(oldState, 'networking');
                const newNetworking = Reflect.get(newState, 'networking');

                oldNetworking?.off('stateChange', networkStateChangeHandler);
                newNetworking?.on('stateChange', networkStateChangeHandler);
            });
            // ======================== =================

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
                    console.log("Switching to next song in queue")
                    client.emit("playSong", { guildId: voiceChannel.guild.id })
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
        if (song.isAnMP3) {
            const songMP3 = {
                title: song.name,
                url: song.url,
                channel: interaction.channel.id,
                isMP3: true
            }
            players.get(voiceChannel.guild.id).queue.push(songMP3)
        } else {
            players.get(voiceChannel.guild.id).queue.push(song)
        }
        client.emit("playSong", interaction)
    }
})

client.login(process.env.TOKEN)