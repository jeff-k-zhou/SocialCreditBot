const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js")
const db = require("../../firebase")
const { doc, getDoc, updateDoc } = require("firebase/firestore")
const { punishments, statements } = require("../../functions/punishments")
const Switch = require("../../functions/switch")
const { Warn } = require("../../embeds")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("warn")
        .setDescription("warn a member")
        .addUserOption(option =>
            option
                .setName("target")
                .setDescription("target @member")
        )
        .addStringOption(option =>
            option
                .setName("reason")
                .setDescription("reason for warn")
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        const user = await interaction.options.getUser("target")
        const admin = await interaction.user
        const reason = await interaction.options.getString("reason")
        let isLog
        let logchannel
        let blacklistrole
        let blacklistchannel
        interaction.deferReply({ ephemeral: true }).then(() => {
            getDoc(doc(db, interaction.guild.id, "info")).then(docSnap => {
                if (docSnap.data().log) {
                    isLog = true
                    logchannel = docSnap.data().log
                }
                if (docSnap.data().blacklist) {
                    blacklistchannel = docSnap.data().blacklist
                    blacklistrole = docSnap.data().blacklistrole
                }
            }).then(() => {
                if (blacklistchannel && blacklistrole && isLog) {
                    interaction.guild.members.fetch(user.id).then(member => {
                        if (member.roles.cache.has(blacklistrole)) {
                            interaction.editReply({ content: "User already in blacklist!" })
                        } else {
                            getDoc(doc(db, interaction.guild.id, user.id)).then((docSnap) => {
                                let offenses = docSnap.data().offenses + 1
                                if (offenses > 10) {
                                    offenses = 10
                                }
                                const punishment = punishments[offenses]
                                const result = docSnap.data().credits - punishment
                                updateDoc(doc(db, interaction.guild.id, user.id), {
                                    offenses: offenses,
                                    credits: result
                                }).then(() => {
                                    let index = Switch(result)
                                    console.log(index)
                                    let statement = statements[index].text
                                    if (statements[index].time !== 0) {
                                        interaction.guild.roles.fetch(blacklistrole).then(role => {
                                            interaction.guild.members.fetch(user.id).then(member => {
                                                member.roles.set([], ["blacklisted"]).then(() => {
                                                    member.roles.add(role).then(() => {
                                                        if (statements[index].time !== null) {
                                                            setTimeout(() => {
                                                                member.roles.remove(role)
                                                            }, statements[index].time)
                                                        }
                                                    })
                                                })
                                            })
                                        })
                                    }
                                    let embed = Warn(user, admin, reason, punishment, offenses, statement)
                                    interaction.editReply({ content: `Success! Logged in <#${logchannel}>` })
                                    interaction.guild.channels.fetch(blacklistchannel).then(channel => {
                                        channel.send({ embeds: [embed] })
                                    })
                                })
                            })
                        }
                    })
                } else {
                    interaction.editReply({
                        content: `Log channel and/or blacklist channel and role have not been set yet.
                        \nUse /setlog to set a log channel.
                        \nUse /setblacklist to set a blacklist channel and role.
                        \nUse /checklog to check for existing log channel
                        \nUse /checkblacklist to check for existing blacklist channel and role`
                    })
                }
            })
        })
    }
}