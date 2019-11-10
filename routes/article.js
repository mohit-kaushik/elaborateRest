const client = require("../services/db-connection");
var ObjectId = require('mongodb').ObjectId;
var express = require('express');
var router = express.Router();

// const uri = "mongodb://192.168.56.1:27017?gssapiServiceName=mongodb";

router.get("/:article_id", (req,res,next)=>{
    console.log("------------------------------");
    try {
        let id = req.query.article_id;
        client.then((db)=>{
            db.collection("articles").findOne({_id: ObjectId(id)}, {}, function(err, data){
                if(err)
                console.log(err);
                console.log(data);
                res.send(data);
            });
        });
    } catch (error) {
        
    }
});


router.get('/', function (req, res, next) {
    // console.log
    // console.log("====================");
    try {
        client.then(function (db) {

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
                //     // let results = results;
                console.log(result);
                res.send(result);
            });
            // console.log(articles);
            // articles.findOne({}, function (err, result) {
            //      // let results = results;

            //         console.log(err);

            //     console.log(result);
            //     res.send(result);
            // });
        })
    } catch (err) {
        console.log(err);
    }

});

module.exports = router;



