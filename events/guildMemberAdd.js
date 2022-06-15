const Discord = require("discord.js"),
    fs = require("fs")

function randomPhrase(member, phrases) {
    return phrases[Math.floor(Math.random() * phrases.length)].replace("USER", member.user.username)
}

module.exports = {
    /**
     * 
     * @param {Discord.Client} client 
     * @param {Discord.GuildMember} member 
     */
    run(client, member) {
        try {
            const config = JSON.parse(fs.readFileSync("./config.json"))

            const embed = {
                title: `${member.user.username} a rejoint le serveur !`,
                description: randomPhrase(member, config.welcomePhrases),
                color: "BLURPLE",
                timestamp: new Date(),
                author: {
                    name: member.user.tag,
                    icon_url: member.user.displayAvatarURL({dynamic: true})
                },
                footer: {
                    text: member.guild.name,
                    icon_url: member.guild.iconURL({dynamic: true})
                }
            }

            console.log(embed)

            member.guild.channels.cache.get(config.welcomeChannel)?.send({
                embeds: [embed]
            })
        } catch (error) {
            
        }
    }
}