const { SlashCommandBuilder } = require("discord.js")
const { ViewCredits } = require("../embeds")
const { getDoc, doc } = require("firebase/firestore")
const db = require("../firebase")
require("dotenv").config()
const botid = process.env.BOTID

module.exports = {
    data: new SlashCommandBuilder()
        .setName("credits")
        .setDescription("View your Social Credits")
        .addUserOption(option =>
            option
                .setName("target")
                .setDescription("target @member")
        ),
    async execute(interaction) {
        const target = interaction.options.getUser("target")
        if (!(target.user.bot)) {
            await getDoc(doc(db, "servers", interaction.guild.id)).then((docSnap) => {
                if (docSnap.exists()) {
                    let embed;
                    if (!target) {
                        embed = ViewCredits(interaction.user.username, docSnap.data()[interaction.user.id])
                    } else {
                        embed = ViewCredits(target.username, docSnap.data()[target.id])
                    }
                    interaction.reply({ embeds: [embed] })
                } else {
                    interaction.reply({ content: "Error: User does not exist. DM longhua for support."})
                }
            })
        } else {
            interaction.reply({ content: "Bots cannot have credits", ephemeral: true })
        }
    }
}