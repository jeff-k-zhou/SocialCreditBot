const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js")
const { doc, updateDoc } = require("firebase/firestore")
const db = require("../../firebase")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("autorole")
        .setDescription("Set an autorole")
        .addRoleOption(option =>
            option
                .setName("role")
                .setDescription("target @role")
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        const roleid = await interaction.options.getRole("role").id
        interaction.deferReply({ ephemeral: true }).then(() => {
            interaction.guild.roles.fetch(roleid).then(role => {
                interaction.member.roles.add(role).then(() => {
                    interaction.member.roles.remove(role)
                    updateDoc(doc(db, interaction.guild.id, "info"), {
                        autorole: true,
                        role: roleid
                    }).then(() => {
                        interaction.editReply({ content: `Autorole set <@&${roleid}>` })
                    })
                }).catch(() => {
                    interaction.editReply({ content: "Error: Bot does not have required permissions" })
                })
            })

        })
    }
}