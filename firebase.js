const { initializeApp } = require("firebase/app")
const { getFirestore } = require("firebase/firestore")

const firebaseConfig = {
    apiKey: "AIzaSyAWys8rMnyMdFsX6GW8H3OpEA_VPdkJ7zI",
    authDomain: "socialcreditbot-da360.firebaseapp.com",
    projectId: "socialcreditbot-da360",
    storageBucket: "socialcreditbot-da360.appspot.com",
    messagingSenderId: "892316987234",
    appId: "1:892316987234:web:f1f38f3e0541b421aac63b",
    measurementId: "G-1GBX8S23B3"
};

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

module.exports = db