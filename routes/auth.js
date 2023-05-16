"use strict";

const Router = require("express").Router;
const router = new Router();
const User = require('../models/user');

/** POST /login: {username, password} => {token} */
router.POST("/login",
  function (req, res, next) {
    if (User.authenticate(req.body.username, req.body.password)) {
      let testUserToken = jwt.sign({username: req.body.username}, SECRET_KEY);
      return res.json({testUserToken});
    }
  });

/** POST /register: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 */


module.exports = router;