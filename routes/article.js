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

                if (initSession) {

                    session = mongoClient.startSession();
                    initSession = false;
                }

                const transactionOptions = {
                    readPreference: 'primary',
                    readConcern: { level: 'local' },
                    writeConcern: { w: 'majority' }
                };

                session.withTransaction(async () => {
                    let article = await db.collection("articles").findOne({ _id: ObjectId(req.body.id) });

                    let userExist = false;
                    //can we use includes here ?
                    article.appreciatedBy.map((u) => {
                        if (u === user.user_id) {
                            userExist = true;
                        }
                    });

                    if (userExist && !req.body.appreciation) {
                        console.log("matched decrement");
                        //already liked .. so remove
                        let article = await db.collection("articles").findOneAndUpdate({ _id: ObjectId(req.body.id) }, {
                            $pull: {
                                appreciatedBy: user.user_id
                            }
                        },{ returnOriginal: false })

                        console.log(article.value);
                        let match = article.value.appreciatedBy.includes(user.user_id)
                        let likes = article.value.appreciatedBy.length;
                        delete article.value.appreciatedBy;
                        res.send({ ...article.value, appreciated: match, likes: likes });

                    }

                    else if (!userExist && req.body.appreciation) {
                        console.log("matched increment")
                        let article = await db.collection("articles").findOneAndUpdate({ _id: ObjectId(req.body.id) }, {
                            $push: {
                                appreciatedBy: user.user_id
                            }
                        }, { returnOriginal: false })
                        console.log(article.value);
                        let match = article.value.appreciatedBy.includes(user.user_id)
                        let likes = article.value.appreciatedBy.length;
                        delete article.value.appreciatedBy;
                        res.send({ ...article.value, appreciated: match, likes: likes });

                    }
                    else {
                        console.log("Nothing matched......!");
                    }

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

    try {
        let id = req.params.article_id;


        client.then((db) => {
            db.collection("articles").findOne({ _id: ObjectId(id) }, {},
                function (err, data) {
                    if (err)
                        throw err;

                    userSerivces.getUserFromToken(req.body.idToken).then(function (user) {
                        // console.log(user);
                        let match = false;
                        client.then((db) => {
                            db.collection("users").findOne({ userId: user.user_id }, {})
                                .then(function (user) {
                                    match = data.appreciatedBy.includes(user.userId);

                                })
                                .then(function () {
                                    let likes = data.appreciatedBy.length;
                                    delete data.appreciatedBy;
                                    res.send({ ...data, appreciated: match, likes: likes });
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