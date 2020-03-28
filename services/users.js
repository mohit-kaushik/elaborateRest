var express = require('express');
const admin = require('firebase-admin');
var { connection: dbPromise } = require('./db-connection');
var ErrorLog = require("./error-logging")

let init = false;

let adminInitApp = () => {
  try {
    var serviceAccount = require("../elaborate-official-firebase-adminsdk-f9jab-d0ffa98560.json");

    if (!init)
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: "https://elaborate-official.firebaseio.com"
      });

    init = true;

  } catch (error) {
    if (typeof error === "object")
      ErrorLog(JSON.stringify(error))

    console.log(error);
  }
 
};

//this needs to a middlware
let getUserFromToken = (idToken) => {
  try {
    // idToken comes from the client app
    return admin.auth().verifyIdToken(idToken);
  } catch (error) {
    if (typeof error === "object")
      ErrorLog(JSON.stringify(error))

    console.log(error);
  }
};
let createUser = async (uid) => {
  try {
    let db = await dbPromise;
    let userRecord = await admin.auth().getUser(uid)
    let user = {
      userId: userRecord.uid,
      name: userRecord.displayName,
      email: userRecord.email,
      createdOn: userRecord.metadata.creationTime,
      pictureURL: userRecord.photoURL,
      signInProvider: userRecord.providerData[0].providerId,
      role: "user",
      interestedIn: [],
      appreciatedArticles: []
    };
    db.collection("users").insertOne(user);
  } catch (error) {
    if (typeof error === "object")
      ErrorLog(JSON.stringify(error))

  }

};

let checkUserExist = (uid) => {
  return new Promise(function (resolve, reject) {
    dbPromise.then((db) => {
      db.collection("users").findOne({ userId: uid }, { name: 1 }, function (err, result) {
        if (result !== {} && result !== null && result !== undefined) {
          resolve(true);
        } else {
          resolve(false);
        }
      });

    });
  });


};

let deleteUser = () => {
  dbPromise.then(function (db) {
    db.collection("users").deleteMany({ name: "mohit kaushik" }, function (err, obj) {

    });
  });
};

module.exports = {
  checkUserExist: checkUserExist,
  adminInitApp: adminInitApp,
  getUserFromToken: getUserFromToken,
  createUser: createUser
};
