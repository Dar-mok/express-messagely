"use strict";

const Router = require("express").Router;
const router = new Router();
const User = require('../models/user');

/** POST /login: {username, password} => {token} */
router.POST("/login",
  function (req, res, next) {
    if (User.authenticate(req.body.username, req.body.password)) {
      // testUserToken = jwt.sign(testUser, SECRET_KEY);

    }
    return res.json(User.get(req.params.username));
  });

/** POST /register: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 */

module.exports = router;