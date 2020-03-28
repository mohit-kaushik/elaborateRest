const { connection: client } = require("../services/db-connection");
var ObjectId = require('mongodb').ObjectId;
var express = require('express');
var router = express.Router();
var userSerivces = require('../services/users');
var ErrorLog = require('../services/error-logging')
// const uri = "mongodb://192.168.56.1:27017?gssapiServiceName=mongodb";

//try catch
router.post("/appreciation", async function (req, res, next) {
    // let ip = req.ip;
    try {
        if (req.body.token) {
            let user = req.user;

            let db = await client;
            let article = await db.collection("articles")
                .findOne({ _id: ObjectId(req.body.id) });
            
            let alreadyLiked = false;

            alreadyLiked = article.appreciatedBy.includes(user.user_id)

            if (alreadyLiked && !req.body.appreciation) {
                //already liked .. so remove
                let article = await db.collection("articles").findOneAndUpdate({ _id: ObjectId(req.body.id) }, {
                    $pull: {
                        appreciatedBy: user.user_id
                    }
                }, { returnOriginal: false })

                let match = article.value.appreciatedBy.includes(user.user_id)
                let likes = article.value.appreciatedBy.length;
                delete article.value.appreciatedBy;
                res.send({ ...article.value, appreciated: match, likes: likes });

            }

            else if (!alreadyLiked && req.body.appreciation) {
                // console.log("matched increment")
                let article = await db.collection("articles").findOneAndUpdate({ _id: ObjectId(req.body.id) }, {
                    $push: {
                        appreciatedBy: user.user_id
                    }
                }, { returnOriginal: false })

                let match = article.value.appreciatedBy.includes(user.user_id)
                let likes = article.value.appreciatedBy.length;
                delete article.value.appreciatedBy;
                res.send({ ...article.value, appreciated: match, likes: likes });

            }
            else {
                // console.log("Nothing matched......!");
            }
        }
        else {
            res.send({ error: "Not logged in" })
        }
    } catch (error) {
        if (typeof error === "object")
            ErrorLog(JSON.stringify(error))

        console.log(error);
    }


});

router.post("/:article_id", async (req, res, next) => {

    try {
        let id = req.params.article_id;
        let db = await client;

        db.collection("articles").findOne({ _id: ObjectId(id) }, {},
            async function (err, data) {
                
                if (err)
                    throw err;

                if (req.body.token) {
                    let user = await userSerivces.getUserFromToken(req.body.token)

                    let match = false;
                    let db = await client;
                    let u = await db.collection("users").findOne({ userId: user.user_id }, {})
                    
                    match = data.appreciatedBy.includes(u.userId);

                    let likes = data.appreciatedBy.length;
                    delete data.appreciatedBy;
                    res.send({ ...data, appreciated: match, likes: likes });

                }
                else {
                    let likes = data.appreciatedBy.length;
                    delete data.appreciatedBy;
                    res.send({ ...data, appreciated: false, likes: likes });
                }


            });

    } catch (error) {
        if (typeof error === "object")
            ErrorLog(JSON.stringify(error))

    }
});

// set domain cors so that no other can get this json
router.get('/', function (req, res, next) {
    if (req.body.token) {

        // console.log(user)
    } else {
        try {
            client.then(function (db) {

                articles = db.collection("articles");
                // console.log(articles);
                articles.find({}, {
                    projection: {
                        heading: 1,
                        anchor: 1,
                        channel: 1,
                        desc: 1,
                        imagePath: 1,
                        appreciatedBy: 1
                    }
                }).toArray(function (err, result) {
                    // console.log(result)
                    if (err)
                        throw err;

                    // console.log(result)
                    let arr = [];
                    for (var i of result) {
                        i["appreciatedBy"] = i["appreciatedBy"].length;
                        // consol
                        arr.push(i);
                    }
                    res.send(arr);
                    // res.send(result);
                });

            })
        } catch (err) {
            if (typeof err === "object")
                ErrorLog(JSON.stringify(err))

            console.log(err);
        }
    }

});
router.post("/", async (req, res, next) => {
    try {
        let db = await client;

        articles = db.collection("articles");
        articles.find({}, {
            projection: {
                heading: 1,
                anchor: 1,
                channel: 1,
                desc: 1,
                imagePath: 1,
                appreciatedBy: 1
            }
        }).toArray(function (err, result) {
            if (err) {
                if (typeof error === "object")
                    ErrorLog(JSON.stringify(error))

            }

            let arr = []
            for (var i of result) {

                i["appreciatedBy"] = i["appreciatedBy"].length;
                arr.push(i);
            }
            res.send(arr);
        });

    } catch (error) {
        if (typeof error === "object")
            ErrorLog(JSON.stringify(error))

    }

})

router.post("/user/like", async (req, res, next) => {
    try {
        let id = req.body.article_id;
        let db = await client;

        db.collection("articles").findOne({ _id: ObjectId(id) }, {
            projection: {
                appreciatedBy: 1
            }
        },
            async function (err, data) {
                let u = await db.collection("users").findOne({ userId: req.user.user_id }, {})

                match = data.appreciatedBy.includes(u.userId);
                res.send(match)

            });

    } catch (error) {
        if (typeof error === "object")
            ErrorLog(JSON.stringify(error))

    }
})
module.exports = router;