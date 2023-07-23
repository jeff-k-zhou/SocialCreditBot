function ViewCredits(user, credits) {
    return {
        title: `${user} has ${credits} credits`,
        description: "Send more messages to earn more social credits!",
        color: 0x0099ff
    }
}

module.exports = {
    ViewCredits
}