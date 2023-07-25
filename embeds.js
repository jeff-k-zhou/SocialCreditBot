function ViewCredits(user, credits, icon) {
    return {
        title: `${credits} credits`,
        description: "Send more messages to earn more social credits!",
        color: 0x0099ff,
        author: {
            name: user,
            iconUrl: icon
        }
    }
}

function Leaderboard(list) {
    return {
        title: "Leaderboard",
        description: "Top 10 members in the server",
        color: 0xCC0000,
        fields: list
    }
}

module.exports = {
    ViewCredits, Leaderboard
}