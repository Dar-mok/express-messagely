"use strict";

const Router = require("express").Router;
const router = new Router();

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
router.get('/:id', async function(req, res, next){
  let message = await Message.get(req.params.id);

  const tokenFromRequest = req.query._token || req.body._token;
  
  const token = jwt.decode(tokenFromRequest);

  if (token.username === message.from_user.username)
})


/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/
//any logged in user can send a message to any other user


/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Makes sure that the only the intended recipient can mark as read.
 *
 **/
//only the recipient of a message can mark it as read


module.exports = router;