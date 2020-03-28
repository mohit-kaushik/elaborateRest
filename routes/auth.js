var express = require('express');
var router = express.Router();
var userSerivces = require('../services/users');
var ErrorLog = require("../services/error-logging")

userSerivces.adminInitApp();

router.post("/auth", async function (req, res) {
    try {
        if (req.body.op === "get user") {
            const idToken = req.body.token;
            let userExist = await userSerivces.checkUserExist(req.user.uid)

            if (userExist === false) {
                userSerivces.createUser(uid);
            }
            res.send(req.user);
        }

    }

    catch (err) {
        if (typeof err === "object")
            ErrorLog(JSON.stringify(err))

        console.log(err);
    }

});

module.exports = router;
