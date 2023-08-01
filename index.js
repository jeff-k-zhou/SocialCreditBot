require("dotenv").config()
const { Client, GatewayIntentBits, Collection, Events, MessageType } = require("discord.js")
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
const Timeout = require("./functions/timeout")
const Blacklist = require("./functions/blacklist")
const token = process.env.TOKEN

client.commands = new Collection()

const foldersPath = path.join(__dirname, "commands")
const commandFolders = fs.readdirSync(foldersPath)

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder)
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"))
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file)
        const command = require(filePath)
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}



client.on(Events.ClientReady, (client) => {
    client.guilds.fetch().then(guilds => {
        console.log("Fetching guilds...")
        guilds.forEach(guild => {
            guild.fetch().then(guild => {
                console.log("Fetching members...")
                guild.members.fetch().then(members => {
                    console.log("Filtering out bots...")
                    const list = members.filter(member => !member.user.bot).map(member => member)
                    console.log("Setting timers...")
                    list.forEach(member => {
                        getDoc(doc(db, member.guild.id, member.id)).then((docSnap) => {
                            if (docSnap.data().timestamp) {
                                Timeout(member.guild.id, member.id, docSnap.data().timestamp)
                            } else {
                                Timeout(member.guild.id, member.id)
                            }
                            if (docSnap.data().blacklisttime) {
                                const time = docSnap.data().blacklisttime
                                getDoc(doc(db, member.guild.id, "info")).then((docSnap) => {
                                    member.guild.roles.fetch(docSnap.data().blacklistrole).then((role) => {
                                        Blacklist(member.guild.id, member.id, time, role, member)
                                    })
                                })
                            }
                        })
                    })
                    console.log("Timers set!")
                }).then(() => {
                    console.log(`Logged as ${client.user.tag}`)
                    Loadup()
                })
            })
        })
    })
})

client.on(Events.GuildCreate, (guild) => {
    getDocs(collection(db, guild.id)).then((docs) => {
        if (docs.size > 0) {
            guild.systemChannel.send("Unexpected error: Server ID already exists. DM longhua for support. Leaving server now.")
            guild.leave()
        } else {
            setDoc(doc(db, guild.id, "info"), {
                autorole: false
            })
            guild.members.fetch().then((list) => {
                const members = list.filter(member => !member.user.bot).map(member => member)
                members.forEach(member => {
                    setDoc(doc(db, guild.id, member.user.id), {
                        credits: 0,
                        username: member.user.username,
                        offenses: 0
                    }).then(() => {
                        Timeout(guild.id, member.id)
                    })
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
                })
                getDoc(doc(db, member.guild.id, "info")).then((docSnap) => {
                    if (docSnap.data().autorole) {
                        member.guild.roles.fetch(docSnap.data().role).then(role => {
                            member.roles.add(role)
                        })
                    }
                })
                Timeout(member.guild.id, member.id)
            }
        } else {
            member.guild.systemChannel.send({ content: "Unexpected error: User already exists. DM longhua for support. Kicking member." })
            member.kick("Unexpected error: User already exists.")
        }
    })
})

client.on(Events.GuildMemberRemove, (member) => {
    const id = member.guild.id
    const userid = member.user.id
    deleteDoc(doc(db, id, userid))
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

client.on(Events.MessageCreate, async message => {
    if (message.author.bot) return
    if (message.type === MessageType.UserJoin) return
    if (message.author.system) return

    const userid = message.author.id
    if (userMap.has(userid)) {
        const userData = userMap.get(userid)
        const difference = message.createdTimestamp - userData.lastMessage.createdTimestamp
        let msgCount = userData.msgCount

        if (difference > diff) {
            userData.msgCount = 1
            userData.lastMessage = message
            const increase = Math.floor(Math.random() * (7 - 2 + 1) + 2)
            await updateDoc(doc(db, message.guild.id, message.author.id), {
                credits: increment(increase)
            })
        } else {
            ++msgCount
            if (!(parseInt(msgCount) === limit)) {
                const increase = Math.floor(Math.random() * (7 - 2 + 1) + 2)
                await updateDoc(doc(db, message.guild.id, message.author.id), {
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
        await updateDoc(doc(db, message.guild.id, message.author.id), {
            credits: increment(increase)
        })
    }
})

client.login(token)