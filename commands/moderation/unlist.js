const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js")
const { Unlist } = require("../../embeds")
const { doc, getDoc } = require("firebase/firestore")
const db = require("../../firebase")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("unlist")
        .setDescription("Take someone off the blacklist")
        .addUserOption(option =>
            option
                .setName("member")
                .setDescription("target @member")
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName("reason")
                .setDescription("reason for unlist")
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        const user = await interaction.options.getUser("member")
        const reason = await interaction.options.getString("reason")
        let isLog = false
        let logchannel
        let autorole
        let blacklistrole
        if (user.bot) {
            return
        } else {
            getDoc(doc(db, interaction.guild.id, "info")).then((docSnap) => {
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
                    interaction.guild.members.fetch(user.id).then((member) => {
                        if (!member.roles.cache.has(blacklistrole)) {
                            interaction.editReply({ content: "Error: Target is not in blacklist" })
                        } else {
                            const embed = Unlist(user, interaction.user, reason)
                            member.roles.remove(blacklistrole).then(() => {
                                if (autorole) {
                                    member.roles.add(autorole)
                                }
                                if (isLog) {
                                    interaction.guild.channels.fetch(logchannel).then((channel) => {
                                        channel.send({ embeds: [embed] })
                                        interaction.editReply({ content: `Success! Logged in <#${logchannel}>` })
                                    })
                                } else {
                                    interaction.editReply({ content: `Use /setlog to log all your admin commands in one channel!`, embeds: [embed] })
                                }
                            })
                        }
                    })
                })
            })
        }
    }
}