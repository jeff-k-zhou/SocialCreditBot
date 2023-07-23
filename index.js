require("dotenv").config()
const { Client, GatewayIntentBits } = require("discord.js")
const { ViewCredits } = require("./embeds")
const LoadUp = require("./commandapi")
const db = require("./firebase")
const { setDoc, getDoc, doc, updateDoc, arrayUnion, arrayRemove, deleteField } = require("firebase/firestore")
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] })
const token = process.env.TOKEN

client.on("ready", () => {
    console.log(`Logged as ${client.user.tag}`)
    LoadUp()
})

client.on("guildCreate", (guild) => {
    getDoc(doc(db, "servers", guild.id)).then((docSnap) => {
        if (docSnap.exists()) {
            guild.systemChannel.send("Unexpected error: Server ID already exists. DM longhua for support. Leaving server now.")
            guild.leave()
        } else {
            guild.members.fetch().then((list) => {
                const members = list.map(member => member.user.id)
                setDoc(doc(db, "servers", guild.id), {

                }).then(() => {
                    members.forEach((member) => {
                        updateDoc(doc(db, "servers", guild.id), {
                            [member]: 0
                        })
                    })
                })
            })
        }
    })
})

client.on("guildMemberAdd", (member) => {
    getDoc(doc(db, "servers", member.guild.id)).then((docSnap) => {
        if (docSnap.exists()) {
            updateDoc(doc(db, "servers", member.guild.id), {
                [member.id]: 0
            })
        }
    })
})

client.on("guildMemberRemove", (member) => {
    getDoc(doc(db, "servers", member.guild.id)).then((docSnap) => {
        if (docSnap.exists()) {
            updateDoc(doc(db, "servers", member.guild.id), {
                [member.id]: deleteField()
            })
        }
    })
})

client.on("interactionCreate", interaction => {
    if (!interaction.isChatInputCommand()) {
        return
    }

    if (interaction.commandName === "ping") {
        interaction.reply("pong")
    } else if (interaction.commandName === "credits") {
        getDoc(doc(db, "servers", interaction.guild.id)).then((docSnap) => {
            if (docSnap.exists()) {
                const embed = ViewCredits(interaction.user.username, docSnap.data()[interaction.user.id])
                interaction.reply({ embeds: [embed] })
            } else {
                interaction.reply("Unexpected Error: User does not exist. DM longhua for support.")
            }
        })
    }
})

client.login(token)