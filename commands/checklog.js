const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js")
const { doc, getDoc } = require("firebase/firestore")
const db = require("../firebase")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("checklog")
        .setDescription("returns current log channel")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        interaction.deferReply({ ephemeral: true }).then(() => {
            getDoc(doc(db, interaction.guild.id, "info")).then((docSnap) => {
                if (docSnap.data().log) {
                    interaction.editReply({ content: `Log channel: <#${docSnap.data().log}>` })
                } else {
                    interaction.editReply({ content: "No log channel set. Use /setlog to set." })
                }
            })
        })
    }
}