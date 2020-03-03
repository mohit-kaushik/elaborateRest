var express = require('express');
const admin = require('firebase-admin');
var {connection: dbPromise} = require('./db-connection');

let init = false;

let adminInitApp = () => {
  try {
    var serviceAccount = require("/home/mohit/Documents/firebase/elaborate-official-firebase-adminsdk-f9jab-d0ffa98560.json");

    if (!init)
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: "https://elaborate-official.firebaseio.com"
      });

    init = true;

  } catch (error) {
    console.log(error);
  }
  // Initialize the default app
  // move these as global variables

};

let getUserFromToken = (idToken) => {
  try {
    // console.log("\nget user from token");
    // idToken comes from the client app
    return admin.auth().verifyIdToken(idToken);
  } catch (error) {
    console.log(error);
  }


};
let createUser = (uid) => {
  // db.collection.insert
  dbPromise.then((db) => {
    admin.auth().getUser(uid).then(function (userRecord) {
      let user = {
        userId: userRecord.uid,
        name: userRecord.displayName,
        email: userRecord.email,
        createdOn: userRecord.metadata.creationTime,
        pictureURL: userRecord.photoURL,
        signInProvider: userRecord.providerData[0].providerId,
        role: "user",
        interestedIn: [],
        appreciatedArticles:[]
      };
      db.collection("users").insertOne(user);
      // console.log("should insert this", userRecord);

    });

  });
};

let checkUserExist = (uid) => {
  let flag;
  return new Promise(function(resolve, reject){
    dbPromise.then((db) => {
      db.collection("users").findOne({ userId: uid }, { name: 1 }, function(err, result){
        if(result !== {} && result !== null && result !== undefined){
          resolve(true);
        }else{
          resolve(false);
        }
      });
      
    });
  });
  

};

let deleteUser = ()=>{
  dbPromise.then(function(db){
    db.collection("users").deleteMany({name: "mohit kaushik"}, function(err, obj){

    });
  });
};

module.exports = {
  checkUserExist: checkUserExist,
  adminInitApp: adminInitApp,
  getUserFromToken: getUserFromToken,
  createUser: createUser
};
