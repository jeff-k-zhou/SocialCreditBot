const { updateDoc, doc, deleteField } = require("firebase/firestore")
const db = require("../firebase")

function Blacklist(guildid, memberid, time, role, member) {
    const started = Date.now()
    const end = started + time
    setTimeout(() => {
        member.roles.remove(role).then(() => {
            updateDoc(doc(db, guildid, memberid), {
                blacklisttime: deleteField()
            })
        })
    }, time)
    const signals = ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGKILL', 'SIGTRAP', 'SIGABRT', 'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM']
    signals.forEach(function (sig) {
        process.on(sig, function () {
            updateDoc(doc(db, guildid, memberid), {
                blacklisttime: end - Date.now()
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

module.exports = Blacklist