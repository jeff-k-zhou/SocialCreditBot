const { SlashCommandBuilder, ChannelType } = require("discord.js")
const { updateDoc, doc } = require("firebase/firestore")
const db = require("../../firebase")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("setlog")
        .setDescription("Set a log channel for admin commands")
        .addChannelOption(option =>
            option
                .setName("channel")
                .setDescription("target channel")
                .setRequired(true)
        ),
        async execute(interaction) {
            const channel = await interaction.options.getChannel("channel")
            interaction.deferReply({ ephemeral: true }).then(() => {
                if (channel.type === ChannelType.GuildText) {
                    updateDoc(doc(db, interaction.guild.id, "info"), {
                        log: channel.id
                    }).then(() => {
                        interaction.editReply({ content: "Log channel set!" })
                    })
                } else {
                    interaction.editReply({ content: "Error: channel selected is not a text channel" })
                }
            })
        }
}