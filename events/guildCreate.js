const Discord = require("discord.js")

/**
 * 
 * @param {Discord.Client} client 
 */
module.exports = {
    /**
     * 
     * @param {Discord.Client} client 
     * @param {Discord.Guild} guild 
     */
    run(client, guild) {
        console.log(`${client.user.tag} has been added to ${guild.name} !`)

        const commands = client.commands.map(x => x.options)

        client.guilds.cache.forEach(guild => {

            guild.commands.set(commands.map(x => {
                if (x.default_permission == undefined) {
                    x["default_permission"] = 2147483648
                }
                console.log(x)
                return x
            })).then(() => {
                console.log("[+] Commands setup for " + guild.name)
            }).catch(e => {
                console.log("[-] Error setting commands for " + guild.name)
            })
        })
    }


}