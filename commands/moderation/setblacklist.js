const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js")
const { doc, updateDoc } = require("firebase/firestore")
const db = require("../../firebase")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("setblacklist")
        .setDescription("Set a blacklist channel")
        .addChannelOption(option =>
            option
                .setName("channel")
                .setDescription("target channel")
                .setRequired(true)
        )
        .addRoleOption(option => 
            option
                .setName("role")
                .setDescription("blacklist @role")
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        const channelid = await interaction.options.getChannel("channel").id
        const roleid = await interaction.options.getRole("role").id
        interaction.deferReply({ ephemeral: true }).then(() => {
            interaction.guild.roles.fetch(roleid).then((role) => {
                interaction.member.roles.add(role).then(() => {
                    interaction.member.roles.remove(role)
                    updateDoc(doc(db, interaction.guild.id, "info"), {
                        blacklist: channelid,
                        blacklistrole: roleid
                    }).then(() => {
                        interaction.editReply({ content: "Blacklist set!" })
                    })
                }).catch(() => {
                    interaction.editReply({ content: "Error: Bot does not have required permissions" })
                })
            })
        })
    }
}