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
      let _token = jwt.sign({ username: req.body.username }, SECRET_KEY);
      return res.json({ _token });
    }
  });

/** POST /register: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 */
router.post("/register",
  function (req, res, next) {

    User.register(req.body);
    {
      let _token = jwt.sign({ username: req.body.username }, SECRET_KEY);
      return res.json({ _token });
    }
  });

module.exports = router;