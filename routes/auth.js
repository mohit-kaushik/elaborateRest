var express = require('express');
var router = express.Router();
var userSerivces = require('../services/users');

userSerivces.adminInitApp();

router.post("/auth", function (req, res) {
    try {
        const idToken = req.body.token;

        if (req.body.op === "get user") {
            
            let user = userSerivces.getUserFromToken(idToken)
                .then(function (decodedToken) {
                    let uid = decodedToken.uid;
                    // got username lets do something
                    // console.log(decodedToken);
                    // userServices.deleteUser();
                    userSerivces.checkUserExist(uid).then(function(userExist){
                        if(userExist === true){
                            console.log("user Exist");
                        }else if(userExist === false){
                            console.log("creating user");
                            userSerivces.createUser(uid);
                        }
                    });
                   
                    
                    
                    res.send(decodedToken);

                }).catch(function (error) {
                    // Handle error
                    console.log(error);
                });
            // userSerivces.getUserFromToken(token);
            // return user;
        }
        // let userExist = userSerivces.checkUserExist();

        // if (!userExist) {
        //     let user = userSerivces.getUserFromToken(idToken);
        //     userSerivces.createUser(user);
        // }

    } catch (err) {
        console.log(err);
    }

});


module.exports = router;
