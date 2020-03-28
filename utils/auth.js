var userSerivces = require('../services/users');
var ErrorLog = require("../services/error-logging")

const isUserLoggedIn = async (req, res, next)=>{
    
    try {
        if(req.method === "GET"){
            req.user = undefined;
        }else if(req.method === "POST"){
            
            if(req.body.token){
               let user = await userSerivces.getUserFromToken(req.body.token)
               req.user = user;
            
            }
            else{
                req.user = undefined;
                
            }
    
        }
    } catch (error) {
        req.user = undefined;

        if(typeof error === "object"){
            ErrorLog(JSON.stringify(error))
        }
        console.log(error)
    }
    
    next()
}
module.exports = isUserLoggedIn;
