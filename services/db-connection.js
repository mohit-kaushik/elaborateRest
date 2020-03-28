const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
var ErrorLog = require("./error-logging")

const uri = "mongodb+srv://mohit:M1a4r9k1!@cluster0-j2jnt.mongodb.net/admin?retryWrites=true&w=majority";
// const uri = "mongodb://localhost:27017"
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


// Modules in Node that you load with require() are loaded synchronously and 
// it is not possible for require to return any value that is loaded asynchronously.

let connection = new Promise((resolve, reject) => {
    try {
        client.connect(err => {
            if (err) {
                console.log(err);
                reject(err);
                if (typeof err === "object")
                    ErrorLog(JSON.stringify(err))

                throw err

            }
            else {
                try {
                    let dbConn = client.db("elaborate");

                    dbConn.stats(function (err, stats) {
                        if (stats.collections <= 0) {
                            throw Error("no collection exist in the db name " + stats.db);
                        }

                    });
                    resolve(dbConn);
                } catch (err) {
                    if (typeof err === "object")
                        ErrorLog(JSON.stringify(err))

                    reject(err);
                }
            }
        });
    } catch (err) {
        if (typeof err === "object")
            ErrorLog(JSON.stringify(err))

    }

});

module.exports = {
    connection: connection,
    client: client
};