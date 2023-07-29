function ViewCredits(user, credits, icon) {
    return {
        title: `${credits} credits`,
        color: 0x0099ff,
        author: {
            name: `${user}`,
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

function Unlist(user, admin, reason) {
    return {
        title: `${user.username} has been unlisted`,
        description: `**Reason:** ${reason}`,
        thumbnail: {
            url: user.avatarURL()
        },
        author: {
            name: admin.username,
            iconUrl: admin.avatarURL()
        },
        footer: {
            text: `${new Date().toLocaleDateString()}`
        }
    }
}

function Warn(user, admin, reason, punishment, offense, statement) {
    return {
        title: ` ${user.username} ${punishment === 0 ? "has been issued a warning" : `has lost ${punishment} credits`}`,
        description: `**Reason:** ${reason}`,
        thumbnail: {
            url: user.avatarURL()
        },
        author: {
            name: admin.username,
            iconUrl: admin.avatarURL()
        },
        fields: [
            {
                name: "",
                value: `**Offense number:** ${offense}`
            },
            {
                name: "",
                value: `<@${user.id}> ${punishment === 0 ? "has been issued a warning" : `${statement}`}`
            }
        ],
        footer: {
            text: `${new Date().toLocaleDateString()}`
        }
    }
}

module.exports = {
    ViewCredits, Leaderboard, Warn, Unlist
}