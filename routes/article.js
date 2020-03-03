const { connection: client } = require("../services/db-connection");
const { client: mongoClient } = require("../services/db-connection");
var ObjectId = require('mongodb').ObjectId;
var express = require('express');
var router = express.Router();
var userSerivces = require('../services/users');
const MongoClient = require('mongodb').MongoClient;
// const uri = "mongodb://192.168.56.1:27017?gssapiServiceName=mongodb";

let initSession = true;
let session;


router.post("/appreciation", function (req, res, next) {
    // res.send("something wrong");
    try {
        userSerivces.getUserFromToken(req.body.idToken).then(function (user) {
            // console.log(MongoClient);
            client.then(async (db) => {

                if(initSession){
                    console.log("starting session...");
                     session = mongoClient.startSession();
                    initSession = false;
                }

                const transactionOptions = {
                    readPreference: 'primary',
                    readConcern: { level: 'local' },
                    writeConcern: { w: 'majority' }
                };

                session.withTransaction(async () => {
                    // db.collection("users").count().then((c) => { console.log(c) });
                    db.collection("users").findOne({ userId: user.user_id }, {}).then(function (user) {
                        let match = false;
                        // console.log("user liked these", user.appreciatedArticles[0]);
                        user.appreciatedArticles.map(function (articleId) {
                            if (req.body.id === articleId) {
                                match = true;
                            }

                        });

                        if (!match && req.body.appreciation) {

                            db.collection("users").updateOne({ userId: user.userId }, {
                                $push: {
                                    appreciatedArticles: req.body.id
                                }
                            }, { session }, function (err, _doc) {
                                if (err) throw err;
                                console.log("user array done");

                                db.collection("articles").findOneAndUpdate({ _id: ObjectId(req.body.id) }, {
                                    $inc: { appreciations: 1 }
                                }, { returnOriginal: false, session }, function (err, doc) {
                                    if (err)
                                        throw err;

                                    // session.endSession();
                                    console.log("inc done");
                                    res.send({ appreciations: doc.value.appreciations, appreciated: true });
                                });

                            });






                        } else if (match && !req.body.appreciation) {


                            db.collection("users").findOneAndUpdate({ userId: user.userId }, {
                                $pull: {
                                    appreciatedArticles: req.body.id
                                }
                            }, session, function (err, _doc) {
                                if (err)
                                    throw err;

                                console.log("user array done");

                                // console.log("delete from liked ", match, " and ", req.body.appreciation);
                                db.collection("articles").findOneAndUpdate({ _id: ObjectId(req.body.id) }, {
                                    $inc: { appreciations: -1 }
                                }, { returnOriginal: false, session }, function (err, doc) {
                                    // console.log(doc.value.appreciations);
                                    // session.endSession();
                                    console.log("dec done");
                                    if (!err)
                                        res.send({ appreciations: doc.value.appreciations, appreciated: false });
                                    else
                                        throw err;

                                });
                            });
                        }
                    });



                }, transactionOptions).then(() => {

                }).catch((err) => { throw err; });

            }).catch((err) => { throw err; });
        }).catch(function (error) {
            console.log(error);
        });
    } catch (error) {
        console.log(error);
    }


});

router.post("/:article_id", (req, res, next) => {
    // res.send("something wrong");
    console.log("article id not");
    try {
        let id = req.params.article_id;

        console.log(req.query);
        client.then((db) => {
            db.collection("articles").findOne({ _id: ObjectId(id) }, {},
                function (err, data) {
                    if (err)
                        throw err;

                    userSerivces.getUserFromToken(req.body.idToken).then(function (user) {
                        // console.log(user);
                        let match = false;
                        client.then((db) => {
                            // db.collection("users").count().then((c) => { console.log(c) });
                            db.collection("users").findOne({ userId: user.user_id }, {})
                                .then(function (user) {
                                    // match = false;

                                    user.appreciatedArticles.map(function (articleId) {
                                        // console.log(req.params.article_id);
                                        // console.log(articleId);
                                        if (req.params.article_id === articleId) {
                                            // console.log("BINGOPOOOOOOOO");
                                            // res.send(true);
                                            match = true;
                                        }

                                    });
                                })
                                .then(function () {
                                    console.log(data);
                                    res.send({ ...data, appreciated: match });
                                });
                        });
                    });


                });
        });
    } catch (error) {

    }
});


router.get('/', function (req, res, next) {
    // res.send("something wrong");
    try {
        client.then(function (db) {
            // db.collection("")

            articles = db.collection("articles");
            // console.log(articles);
            articles.find({}, {
                projection: {
                    heading: 1,
                    anchor: 1,
                    channel: 1,
                    appreciations: 1,
                    desc: 1 
                }
            }).toArray(function (err, result) {

                res.send(result);
            });

        })
    } catch (err) {
        console.log(err);
    }

});

module.exports = router;