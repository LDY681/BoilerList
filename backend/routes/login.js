const express = require('express');
const router = express.Router();
const utils = require('utility');
const jwt = require('jsonwebtoken');

const userM = require('../models/user');

router.post('/', (req, res) => {
    console.log('login request');
    const userData = req.body;

    // check field of request body
    try {
        if (userData.email == '' || userData.password == '') {
            console.log('null body property');
            res.status(400).send();
            return;
        }
    } catch (e) {
        console.log(e);
        res.status(400).send();
        return;
    }

    userM.findOne({email: userData.email}, (err, user) => {
        console.log(user);
        if (err) {
            console.log('query err occurred');
            res.status(500).send('query error');
            return
        }

        if (!user) {
            console.log('No matching email');
            res.status(403).send('No such user');
            return
        }

        if (utils.md5(userData.password, 'base64') !== user.password) {
            console.log(userData.password);
            console.log('Unmatched password');
            res.status(401).send('Invalid password entered!')
        }
        else {
            let payload = {email: user.email, userId: user._id};
            const token = jwt.sign(payload, 'secretKey');
            userM.updateOne({username: user.username}, {token: token}, {upsert: true}, (err) => {
                if (err) console.log(err);
            });
            res.status(200).json({
              token: token,
              username: user.username
            });

        }

    }); //end User.findOne()

});

module.exports = router;
