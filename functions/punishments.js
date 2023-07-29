const punishments = {
    1: 0,
    2: 50,
    3: 100,
    4: 150,
    5: 300,
    6: 500,
    7: 750,
    8: 1000,
    9: 1500,
    10: 2500
}

const statements = {
    "0": {
        text: " has had their credits taken away.",
        time: 0
    },
    "-50": {
        text: "has been blacklisted for 30 minutes.",
        time: 30 * 60 * 1000
    },
    "-100": {
        text: "has been blacklisted for 1 hour.",
        time: 60 * 60 * 1000
    },
    "-150": {
        text: "has been blacklisted for 3 hours",
        time: 3 * 60 * 60 * 1000
    },
    "-300": {
        text: "has been blacklisted for 12 hours.",
        time: 12 * 60 * 60 * 1000
    },
    "-500": {
        text: "has been blacklisted for 1 day.",
        time: 24 * 60 * 60 * 1000
    },
    "-750": {
        text: "has been blacklisted for 3 days.",
        time: 3 * 24 * 60 * 60 * 1000
    },
    "-1000": {
        text: "has been blacklisted for 1 week.",
        time: 7 * 24 * 60 * 60 * 1000
    },
    "-1500": {
        text: "has been blacklisted for 2 weeks.",
        time: 14 * 24 * 60 * 60 * 1000
    },
    "-2500": {
        text: "has been blacklisted permanently.",
        time: null
    },
}

module.exports = {
    punishments, statements
}