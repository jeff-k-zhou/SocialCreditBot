require("dotenv").config()
const { Client, GatewayIntentBits, Collection, Events } = require("discord.js")
const db = require("./firebase")
const path = require("node:path")
const fs = require("node:fs")
const Loadup = require("./loadup")
const { setDoc, getDoc, doc, updateDoc, deleteDoc, increment, collection, getDocs } = require("firebase/firestore")
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
    ]
})
const token = process.env.TOKEN

client.commands = new Collection()

const commandsPath = path.join(__dirname, "commands")
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"))

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file)
    const command = require(filePath)

    if ("data" in command && "execute" in command) {
        client.commands.set(command.data.name, command)
    } else {
        console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`)
    }
}



client.on(Events.ClientReady, () => {
    console.log(`Logged as ${client.user.tag}`)
    Loadup()
})

client.on(Events.GuildCreate, (guild) => {
    getDocs(collection(db, guild.id)).then((docs) => {
        if (docs.size > 0) {
            guild.systemChannel.send("Unexpected error: Server ID already exists. DM longhua for support. Leaving server now.")
            guild.leave()
        } else {
            guild.members.fetch().then((list) => {
                const members = list.filter(member => !member.user.bot).map(member => member)
                members.forEach(member => {
                    setDoc(doc(db, guild.id, member.user.id), {
                        credits: 0,
                        username: member.user.username
                    })
                })
                setDoc(doc(db, guild.id, "info"), {
                    autorole: false
                })
            })
        }
    })
})

client.on(Events.GuildDelete, (guild) => { 
    getDocs(collection(db, guild.id)).then(docs => {
        docs.forEach((docSnap) => {
            deleteDoc(doc(db, guild.id, docSnap.id))
        })
    })
})

client.on(Events.GuildMemberAdd, (member) => {
    getDoc(doc(db, member.guild.id, member.user.id)).then((docSnap) => {
        if (!docSnap.exists()) {
            if (!member.user.bot) {
                setDoc(doc(db, member.guild.id, member.user.id), {
                    credits: 0,
                    username: member.user.username
                }).then(() => {
                    getDoc(doc(db, member.guild.id, "info")).then((docSnap) => {
                        if (docSnap.data().autorole) {
                            member.guild.roles.fetch("1133486083708043284").then(role => {
                                member.roles.add(role)
                            })
                        }
                    })
                })
            }
        } else {
            member.guild.systemChannel.send({ content: "Unexpected error: User already exists. DM longhua for support. Kicking member." })
            member.kick("Unexpected error. DM longhua for support")
        }
    })
})

client.on(Events.GuildMemberRemove, (member) => {
    deleteDoc(doc(db, member.guild.id, member.user.id))
})

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return

    const command = interaction.client.commands.get(interaction.commandName)

    if (!command) {
        interaction.reply({ content: "Unexepected error: Command does not exist. DM longhua for support." })
        console.error(`No command matching ${interaction.commandName} was found.`)
        return
    }

    try {
        await command.execute(interaction)
    } catch (error) {
        console.error(error)
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: "Unexpected error. DM longhua for support.", ephemeral: true })
        } else {
            await interaction.reply({ content: "Unexpected error. DM longhua for support.", ephemeral: true })
        }
    }
})

const userMap = new Map()
const limit = 7
const diff = 60000

client.on(Events.MessageCreate, message => {
    if (message.author.bot) return

    const userid = message.author.id
    if (userMap.has(userid)) {
        const userData = userMap.get(userid)
        const difference = message.createdTimestamp - userData.lastMessage.createdTimestamp
        let msgCount = userData.msgCount

        if (difference > diff) {
            userData.msgCount = 1
            userData.lastMessage = message
            const increase = Math.floor(Math.random() * (7 - 2 + 1) + 2)
            updateDoc(doc(db, message.guild.id, message.author.id), {
                credits: increment(increase)
            })
        } else {
            ++msgCount
            if (!(parseInt(msgCount) === limit)) {
                const increase = Math.floor(Math.random() * (7 - 2 + 1) + 2)
                updateDoc(doc(db, message.guild.id, message.author.id), {
                    credits: increment(increase)
                })
                userData.msgCount = msgCount
            }
        }
    } else {
        userMap.set(message.author.id, {
            msgCount: 1,
            lastMessage: message
        })
        const increase = Math.floor(Math.random() * (7 - 2 + 1) + 2)
        updateDoc(doc(db, message.guild.id, message.author.id), {
            credits: increment(increase)
        })
    }
})

client.login(token)