const { getDoc, updateDoc, doc, increment } = require("firebase/firestore")
const db = require("../firebase")

function Timeout(guildid, memberid) {
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
    }, (2 * 7 * 24 * 60 * 60 * 1000))
}

module.exports = Timeout