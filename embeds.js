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

function BalanceChange(deduct, amount, user, reason, admin) {
    return {
        title: `${deduct ? "Deducted" : "Added"} ${amount} ${amount === 1 ? "credit" : "credits"} ${deduct ? "from" : "to"} ${user}`,
        description: `Reason: ${reason ? reason : "No reason provided"}`,
        author: {
            name: admin.username,
            iconUrl: admin.avatarURL()
        }
    }
}

function Blacklist(days, hours, minutes, seconds, reason, user, admin) {
    let result = "for"
    if (!(days || minutes || seconds || hours)) {
        result = permanently
    } else {
        if (days) {
            result += ` ${days} ${days === 1 ? "day" : "days"}`
        }
        if (hours) {
            result += `${hours} ${hours === 1 ? "hour" : "hours"}`
        }
        if (minutes) {
            result += ` ${minutes} ${minutes === 1 ? "minute" : "minutes"}`
        }
        if (seconds) {
            result += ` ${seconds} ${seconds === 1 ? "second" : "seconds"}`
        }
    }
    return {
        title: `${user.username} has been blacklisted`,
        description: `**Reason**: ${reason}`,
        author: {
            name: admin.username,
            iconUrl: admin.avatarURL()
        },
        thumbnail: {
            url: user.avatarURL()
        },
        fields: [
            {
                name: "",
                value: `<@${user.id}> has been blacklisted ${result}`
            }
        ],
        footer: {
            text: `${new Date().toDateString()}`
        }
    }
}

module.exports = {
    ViewCredits, Leaderboard, BalanceChange, Blacklist
}