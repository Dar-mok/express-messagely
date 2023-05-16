"use strict";

const Router = require("express").Router;
const router = new Router();
const User = require('../models/user');
const { SECRET_KEY } = require("../config");
const jwt = require("jsonwebtoken");

/** POST /login: {username, password} => {token} */
router.post("/login",
  function (req, res, next) {
    if (User.authenticate(req.body.username, req.body.password)) {
      let testUserToken = jwt.sign({ username: req.body.username }, SECRET_KEY);
      return res.json({ testUserToken });
    }
  });

/** POST /register: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 */
router.post("/register",
  function (req, res, next) {
    // const userName = req.body.username;
    // const password = req.body.password;
    // const firstName = req.body.first_name
    // const lastName = req.body.last_name
    // const phone = req.body.phone

    User.register(req.body);
    {
      let newUserToken = jwt.sign({ username: req.body.username }, SECRET_KEY);
      return res.json({ newUserToken });
    }
  });

module.exports = router;