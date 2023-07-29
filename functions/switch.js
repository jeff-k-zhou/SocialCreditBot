function Switch(result) {
    switch (true) {
        case result <= -2500:
            return "-2500"
        case result <= -1500:
            return "-1500"
        case result <= -1000:
            return "-1000"
        case result <= -750:
            return "-750"
        case result <= -500:
            return "-500"
        case result <= -300:
            return "-300"
        case result <= -150:
            return "-150"
        case result <= -100:
            return "-100"
        case result <= -50:
            return "-50"
        default:
            return "0"
    }
}

module.exports = Switch