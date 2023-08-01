const { getDoc, updateDoc, doc, increment } = require("firebase/firestore")
const db = require("../firebase")

function Timeout(guildid, memberid, time) {
    const started = Date.now()
    const end = started + (2 * 7 * 24 * 60 * 60 * 1000)
    let timer = setTimeout(() => {
        const guild = guildid
        const member = memberid
        getDoc(doc(db, guildid, memberid)).then((docSnap) => {
            if (!docSnap.exists()) {
                clearTimeout(timer)
                return
            }
            if (docSnap.data().offenses > 0) {
                updateDoc(doc(db, guildid, memberid), {
                    offenses: increment(-1)
                })
            }
            Timeout(guild, member)
        })
    }, time ? time : (2 * 7 * 24 * 60 * 60 * 1000))
    const signals = ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGKILL', 'SIGTRAP', 'SIGABRT', 'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM']
    signals.forEach(function (sig) {
        process.on(sig, function () {
            updateDoc(doc(db, guildid, memberid), {
                timestamp: end - Date.now()
            }).then(() => {
                console.log("Updated!")
                console.log("Terminating program: ", sig)
                process.exit()
            }).catch((error) => {
                console.error(error)
            })
        });
    });
}

module.exports = Timeout