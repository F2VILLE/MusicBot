const Discord = require("discord.js"),
    ytdl = require("ytdl-core")

module.exports = {
    /**
     * 
     * @param {Discord.Client} client 
     * @param {Discord.Interaction} interaction 
     */
    run(client, interaction) {
        if (interaction.isCommand()) {
            client.commands.get(interaction.commandName)?.run(interaction)
        }
        else if (interaction.isButton()) {
            if (interaction.customId.startsWith("play_music_")) {
                console.log("MUSIC CHOSEN")
                const guildId = interaction.customId.split("_")[2]
                const ytcode = interaction.customId.replace("play_music_" + guildId + "_", "")
                const voiceChannel = interaction.member.voice?.channel
                if (voiceChannel) {
                    ytdl.getBasicInfo("https://www.youtube.com/watch?v=" + ytcode).then(infos => {
                        client.emit('addSong', { id: infos.videoDetails.videoId, duration: infos.videoDetails.lengthSeconds, title: infos.videoDetails.title, thumbnail: infos.videoDetails.thumbnails.pop(), channel: interaction.channelId, author: infos.videoDetails.author }, voiceChannel, interaction)
                        console.log("EMITED ADDSONG EVENT")
                        interaction.reply({
                            embeds: [
                                {
                                    title: "Song added to queue",
                                    description: `${infos.videoDetails.title} has been added to the playlist !`,
                                    color: "#0099ff"
                                }
                            ]
                        }).then(() => {
                            interaction.message.delete()
                        })
                    })
                        .catch(err => {
                            interaction.reply({
                                embeds: [{
                                    title: "Error",
                                    description: err.message,
                                    color: "#ff0000"
                                }]
                            })
                        })
                }
                else {
                    interaction.reply({
                        embeds: [{
                            title: "Error",
                            description: "You need to be in a voice channel to play music!",
                            color: "#ff0000"
                        }]
                    })
                }
            }
            else if (interaction.customId.startsWith("cmdplay")) {
                interaction.client.emit("resumeSong", interaction)
            }
            else if (interaction.customId.startsWith("cmdpause")) {
                interaction.client.emit("pauseSong", interaction)
            }
            else if (interaction.customId.startsWith("cmdskip")) {
                interaction.client.emit("skipSong", interaction)
            }
        }
    }
}