const Discord = require("discord.js"),
    Genius = require("genius-lyrics"),
    GLyrics = new Genius.Client(process.env.GENIUS_TOKEN);

module.exports = {
    options: {
        type: 1,
        name: "lyrics",
        description: "Get Lyrics of music",
        options: [
            {
                type: 3,
                name: 'song',
                description: 'The song name',
                required: true
            }
        ]
    },
    /**
     * 
     * @param {Discord.CommandInteraction} interaction 
     */
    async run(interaction) {
        try {
            const song = interaction.options.getString('song')
            const searches = await GLyrics.songs.search(song);
    
            if (searches.length == 0) {
                return interaction.reply();
            }
            else {
                const gsong = searches[0];
                const lyrics = await gsong.lyrics();
    
                if (lyrics.length > 2040) {
                    for (let i = 0; i < Math.ceil(lyrics.length / 2040); i += 2040) {
                        interaction.reply({
                            embeds: [{
                                title: gsong.title,
                                description: lyrics.substring(i, i + 2040),
                                color: 0x0099ff
                            }]
                        });
                    }
                }
                else {
                    return interaction.reply({
                        embeds: [{
                            title: gsong.title,
                            description: lyrics,
                            color: 0x0099ff
                        }]
                    });
                }
                
            }    
        } catch (error) {
            interaction.replied({
                embeds: [{
                    title: ":x: Error",
                    description: error.message,
                    color: "#ff0000"
                    
                }]
            })
        }
    }
}