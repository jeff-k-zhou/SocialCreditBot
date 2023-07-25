const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js")
const { getDoc, doc, updateDoc } = require("firebase/firestore")
const db = require("../firebase")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("autorole")
        .setDescription("Toggle autorole")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        interaction.deferReply().then(() => {
            getDoc(doc(db, interaction.guild.id, "info")).then((docSnap) => {
                updateDoc(doc(db, interaction.guild.id, "info"), {
                    autorole: !(docSnap.data().autorole)
                }).then(() => {
                    const auto = docSnap.data().autorole
                    interaction.editReply({ content: `${auto ? "Turned autorole off" : "Turned autorole on"}` })
                })
            })
        })
    }
}