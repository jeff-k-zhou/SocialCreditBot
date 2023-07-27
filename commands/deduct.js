const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js")
const { BalanceChange } = require("../embeds")
const { getDoc, doc, updateDoc, increment } = require("firebase/firestore")
const db = require("../firebase")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("deduct")
        .setDescription("Deduct a certain amount of credits from the target")
        .addUserOption(option =>
            option
                .setName("target")
                .setDescription("target @member")
                .setRequired(true)
        )
        .addNumberOption(option =>
            option
                .setName("amount")
                .setDescription("deduct amount")
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName("reason")
                .setDescription("Reason for deduction")
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        const target = await interaction.options.getUser("target")
        const amount = await interaction.options.getNumber("amount")
        const reason = await interaction.options.getString("reason")
        let isLog = false
        let logchannel = ""
        getDoc(doc(db, interaction.guild.id, "info")).then((docSnap) => {
            if (docSnap.data().log) {
                logchannel = docSnap.data().log
                isLog = true
            }
        }).then(() => {
            interaction.deferReply({ ephemeral: isLog }).then(() => {
                getDoc(doc(db, interaction.guild.id, target.id)).then((docSnap) => {
                    if (docSnap.exists()) {
                        updateDoc(doc(db, interaction.guild.id, target.id), {
                            credits: increment(amount * -1)
                        }).then(() => {
                            let embed = BalanceChange(true, amount, target.username, reason, interaction.user)
                            if (isLog) {
                                interaction.guild.channels.fetch(logchannel).then(channel => {
                                    channel.send({ embeds: [embed] })
                                    interaction.editReply({ content: `Success! Logged in <#${logchannel}>` })
                                })
                            } else {
                                interaction.editReply({ embeds: [embed], ephemeral: false, content: "Use /setlog to log all admin commands in only 1 channel!" })
                            }
                        })
                    } else {
                        interaction.deleteReply().then(() => {
                            interaction.followUp({ content: "There was an unexpected error. Did you try to deduct credits from a bot?", ephemeral: true })
                        })
                    }
                })
            })
        })
    }
}