"use strict";

const Router = require("express").Router;
const router = new Router();
const Message = require("../models/message");
const { ensureCorrectUser, ensureLoggedIn } = require("../middleware/auth");
const { UnauthorizedError } = require("../expressError");



/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Makes sure that the currently-logged-in users is either the to or from user.
 *
 **/
//only the sender or recipient of a message can view the message-detail route
router.get('/:id',
  ensureCorrectUser,
  async function (req, res, next) {
    const message = await Message.get(req.params.id);
    console.log(message); //FIXME: delete later
    const username = res.locals.user.username;

    if (username !== message.from_username && username !== message.to_username) {
      throw new UnauthorizedError;
    }
    return res.json({ message });
  }
);

/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/
//any logged in user can send a message to any other user
router.post('/',
  ensureLoggedIn,
  async function (req, res, next) {
    const from_username = res.locals.user.username;

    const to_username = req.body.to_username;
    const body = req.body.body;

    const message = await Message.create({ from_username, to_username, body });

    return res.json({ message });
  }
);



/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Makes sure that the only the intended recipient can mark as read.
 *
 **/
//only the recipient of a message can mark it as read


module.exports = router;