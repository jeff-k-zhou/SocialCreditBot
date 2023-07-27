const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js")
const { Blacklist } = require("../embeds")
const { doc, getDoc } = require("firebase/firestore")
const db = require("../firebase")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("blacklist")
        .setDescription("Send a member to the blacklist")
        .addUserOption(option =>
            option
                .setName("member")
                .setDescription("target @member")
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName("reason")
                .setDescription("reason for blacklist")
                .setRequired(true)
        )
        .addNumberOption(option =>
            option
                .setName("days")
                .setDescription("set days")
        )
        .addNumberOption(option =>
            option
                .setName("hours")
                .setDescription("set hours")
        )
        .addNumberOption(option =>
            option
                .setName("minutes")
                .setDescription("set minutes")
        )
        .addNumberOption(option =>
            option
                .setName("seconds")
                .setDescription("set seconds")
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        const user = await interaction.options.getUser("member")
        const days = await interaction.options.getNumber("days")
        const hours = await interaction.options.getNumber("hours")
        const minutes = await interaction.options.getNumber("minutes")
        const seconds = await interaction.options.getNumber("seconds")
        const reason = await interaction.options.getString("reason")
        let blacklistrole
        let isLog = false
        let blacklist
        let logchannel
        let autorole
        if (user.bot) {
            return
        } else {
            getDoc(doc(db, interaction.guild.id, "info")).then((docSnap) => {
                blacklist = docSnap.data().blacklist
                blacklistrole = docSnap.data().blacklistrole
                if (docSnap.data().log) {
                    isLog = true
                    logchannel = docSnap.data().log
                }
                if (docSnap.data().autorole) {
                    autorole = docSnap.data().role
                }
            }).then(() => {
                interaction.deferReply({ ephemeral: isLog }).then(() => {
                    if (blacklist && blacklistrole) {
                        interaction.guild.members.fetch(user.id).then(member => {
                            if (member.roles.cache.has(blacklistrole)) {
                                interaction.editReply({ content: "Member already in blacklist." })
                            } else {
                                member.roles.set([], ["blacklisted"]).then(() => {
                                    member.roles.add(blacklistrole).then(() => {
                                        const embed = Blacklist(days, hours, minutes, seconds, reason, user, interaction.user)
                                        if (days || hours || minutes || seconds) {
                                            setTimeout(() => {
                                                member.roles.remove(blacklistrole)
                                                if (autorole) {
                                                    member.roles.add(autorole)
                                                }
                                            }, (
                                                (days * 24 * 60 * 60 * 1000) + (hours * 60 * 60 * 1000) + (minutes * 60 * 1000) + (seconds * 1000)
                                            ))
                                        }
                                        if (isLog) {
                                            interaction.guild.channels.fetch(logchannel).then((channel) => {
                                                channel.send({ embeds: [embed] })
                                                interaction.editReply({ content: `Success! Logged in <#${logchannel}>` })
                                            })
                                        } else {
                                            interaction.editReply({ content: "Use /setlog to log all admin commands in only 1 channel!", embeds: [embed] })
                                        }
                                    }).catch((error) => {
                                        console.error(error)
                                        interaction.editReply({ content: "Error: Bot does not have required permissions." })
                                    })
                                })
                            }
                        })
                    } else {
                        interaction.editReply({ content: "Blacklist role and channel have not been set yet. Use command /setblacklist" })
                    }
                })
            })
        }
    }
}