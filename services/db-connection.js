const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;

const uri = "mongodb+srv://mohit:M1a4r9k1!@cluster0-j2jnt.mongodb.net/admin?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


// Modules in Node that you load with require() are loaded synchronously and 
// it is not possible for require to return any value that is loaded asynchronously.

let connection = new Promise((resolve, reject) => {
    try {
        client.connect(err => {
            console.log("making connection... ");
            if (err) {
                console.log(err);
                reject(err);
                throw err
            }
            else {
                console.log("connected");
                try {
                    let dbConn = client.db("elaborate");
                    
                    dbConn.stats(function (err, stats) {
                        // console.log(stats);
                        if(stats.collections <= 0){
                            throw Error("no collection exist in the db name " + stats.db);  
                        }
                        
                    });
                    resolve(dbConn);
                } catch (err) {
                    console.log(err);
                    reject(err);
                    // log in file instead of here

                }
            }



        });
    } catch (err) {
        console.log(err);
    }

});

module.exports = {
    connection:connection,
    client: client
};