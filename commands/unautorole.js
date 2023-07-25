const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js")
const { getDoc, doc, updateDoc } = require("firebase/firestore")
const db = require("../firebase")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("unautorole")
        .setDescription("Shut off autorole")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        const role = await interaction.options.getRole("role")
        interaction.deferReply().then(() => {
            updateDoc(doc(db, interaction.guild.id, "info"), {
                autorole: false,
            }).then(() => {
                interaction.editReply({ content: `Autorole turned off` })
            })
        })
    }
}