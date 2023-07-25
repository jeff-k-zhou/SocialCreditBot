function ViewCredits(user, credits) {
    return {
        title: `${user} has ${credits} credits`,
        description: "Send more messages to earn more social credits!",
        color: 0x0099ff
    }
}

function Leaderboard(list) {
    return {
        title: "Leaderboard",
        description: "Top 10 members in the server",
        color: 0x00cc00,
        fields: list
    }
}

module.exports = {
    ViewCredits, Leaderboard
}