const { connection: client } = require("../services/db-connection");
var ErrorLog = require("./error-logging")

let suggestArticles = (user)=>{
    try {
        client.then(function (db) {
            let articles = db.collection("articles");
            // console.log(articles);
            articles.find({}, {
                projection: {
                    heading: 1,
                    anchor: 1,
                    channel: 1,
                    appreciations: 1,
                    desc: 1,
                    imagePath: 1
                }
            }).toArray(function (err, result) {

                return result;
            });

        })
    } catch (err) {
        if (typeof err === "object")
            ErrorLog(JSON.stringify(err))

        console.log(err);
    }
    // return [];
}

module.exports = {
    suggestArticles: suggestArticles
}