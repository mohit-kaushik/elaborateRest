const fs = require("fs");

const ErrorLog = (error)=>{
    fs.appendFile("../logs/error.log",error,function(err){
        if(err)
        throw err;

    });
}

module.exports = ErrorLog;