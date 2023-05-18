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

            guild.commands.set(commands).then(() => {
                console.log("[+] Commands setup for " + guild.name)
            }).catch(e => {
                console.log("[-] Error setting commands for " + guild.name)
                console.log(e)
            })
        })
    }


}