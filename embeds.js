function ViewCredits(user, credits) {
    if(credits < 100) {  
        return {
            title: `${user} has ${credits} credits. YOU ARE A BETA!`,
            description: "Send more messages to earn more social credits!",
            color: 0x0099ff
        }
    } else if(credits < 500) {
        return {
            title: `${user} has ${credits} credits. YOU ARE MID!`,
            description: "Send more messages to earn more social credits!",
            color: 0x0099ff
        }
    } else if(credits < 1000) {
        return {
            title: `${user} has ${credits} credits. YOU ARE A CHICKEN WING!`,
            description: "Send more messages to earn more social credits!",
            color: 0x0099ff
        }
    } else {
        return {
            title: `${user} has ${credits} credits. YOU ARE MASTER OOGWAY!`,
            description: "Send more messages to earn more social credits!",
            color: 0x0099ff
        }
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