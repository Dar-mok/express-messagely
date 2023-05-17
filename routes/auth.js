"use strict";

const Router = require("express").Router;
// @ts-ignore
const router = new Router();
const User = require('../models/user');
const { SECRET_KEY } = require("../config");
const jwt = require("jsonwebtoken");
const { BadRequestError } = require("../expressError");

/** POST /login: {username, password} => {token} */
router.post("/login",
  async function (req, res, next) {

    if (!req.body) {
      throw new BadRequestError("invalid data");
    }

    if (await User.authenticate(req.body.username, req.body.password)) {
      let _token = jwt.sign({ username: req.body.username }, SECRET_KEY);
      User.updateLoginTimestamp(req.body.username);

      return res.json({ _token });
    } else {
      throw new BadRequestError("invalid username or password");
    }

  });

/** POST /register: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 */
router.post("/register",
  async function (req, res, next) {

    if (!req.body) {
      throw new BadRequestError("invalid data");
    }

    await User.register(req.body);
    {
      let _token = jwt.sign({ username: req.body.username }, SECRET_KEY);
      return res.json({ _token });
    }
  });

module.exports = router;