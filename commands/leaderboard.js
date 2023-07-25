const { SlashCommandBuilder } = require("discord.js")
const { Leaderboard } = require("../embeds")
const { query, collection, orderBy, limit, getDocs } = require("firebase/firestore")
const db = require("../firebase")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("leaderboard")
        .setDescription("Get top 10 members in the server"),
    async execute(interaction) {
        const leaderboard = query(collection(db, interaction.guild.id), orderBy("credits", "desc"), limit(10))
        let list = []
        let i = 1
        getDocs(leaderboard).then((docs) => {
            docs.forEach(document => {
                list.push({
                    name: `Rank ${i}`,
                    value: `${document.data().username}: ${document.data().credits} credits`
                })
                i++
            })
        }).then(() => {
            let embed = Leaderboard(list)
            interaction.deferReply().then(() => {
                interaction.editReply({ embeds: [embed] })
            })
        })
    }
}