"use strict";

const Router = require("express").Router;
const router = new Router();
const User = require("../models/user");
const { ensureCorrectUser } = require("../middleware/auth");


/** GET / - get list of users.
 *
 * => {users: [{username, first_name, last_name}, ...]}
 *
 **/

router.get("/",
  async function (req, res, next) {
    return await res.json(User.all());
  });


/** GET /:username - get detail of users.
 *
 * => {user: {username, first_name, last_name, phone, join_at, last_login_at}}
 *
 **/
//only that user can view their get-user-detail route, or their from-messages or to-messages routes
router.get("/:username",
  ensureCorrectUser,
  async function (req, res, next) {
    return await res.json(User.get(req.params.username));
  });


/** GET /:username/to - get messages to user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 from_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/
router.get("/:username/to",
  ensureCorrectUser,
  async function (req, res, next) {
    return await res.json(User.messagesTo(req.params.username));
  });

/** GET /:username/from - get messages from user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 to_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/
router.get("/:username/from",
  ensureCorrectUser,
  async function (req, res, next) {
    return await res.json(User.messagesFrom(req.params.username));
  });



module.exports = router;