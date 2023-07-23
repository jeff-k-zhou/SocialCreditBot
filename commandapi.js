require("dotenv").config()

function LoadUp() {
    const { REST, Routes } = require('discord.js');
    const commands = require("./commands")
    const token = process.env.TOKEN
    const clientid = process.env.CLIENT_ID

    const rest = new REST({ version: "10" }).setToken(token)

    try {
        console.log("Loading up slash commands")

        rest.put(Routes.applicationCommands(clientid), { body: commands })

        console.log("Loaded slash commands")
    } catch (error) {
        console.log(error)
    }
}

module.exports = LoadUp