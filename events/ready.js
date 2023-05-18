const Discord = require("discord.js")

/**
 * 
 * @param {Discord.Client} client 
 */
module.exports = {
    run(client) {
        console.log(`${client.user.tag} is online!`)

        const commands = client.commands.map(x => x.options)

        client.guilds.cache.forEach(guild => {

            guild.commands.set(commands.map(x => {
                if (!x.permission) {
                    x["permission"] = guild.id
                }
                return x
            })).then(() => {
                console.log("[+] Commands setup for " + guild.name)
            }).catch(e => {
                console.log("[-] Error setting commands for " + guild.name)
            })
        })
    }


}