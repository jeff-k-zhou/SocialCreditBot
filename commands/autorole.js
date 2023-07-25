const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js")
const { getDoc, doc, updateDoc } = require("firebase/firestore")
const db = require("../firebase")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("autorole")
        .setDescription("Toggle autorole")
        .addRoleOption(option =>
            option
                .setName("role")
                .setDescription("auto role")
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        const role = await interaction.options.getRole("role")
        interaction.deferReply().then(() => {
            getDoc(doc(db, interaction.guild.id, "info")).then((docSnap) => {
                updateDoc(doc(db, interaction.guild.id, "info"), {
                    autorole: true,
                    role: role.id
                }).then(() => {
                    interaction.editReply({ content: `Autorole set!` })
                })
            })
        })
    }
}