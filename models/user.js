"use strict";

/** User of the site. */

const { SECRET_KEY, BCRYPT_WORK_FACTOR, authToken } = require("../config");
const db = require("../db");
const bcrypt = require("bcrypt");
const { NotFoundError } = require("../expressError");

const accountSid = 'AC07992bdb12b2893a0f93ca6c107bc789';

const twilio = require('twilio')(accountSid, authToken);

class User {

  constructor(username, password, first_name, last_name, phone) {
    this.username = username;
    this.password = password;
    this.first_name = first_name;
    this.last_name = last_name;
    this.phone = phone;
  };

  /** Register new user. Returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register({ username, password, first_name, last_name, phone }) {

    const hashedPass = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

    const newUser = await db.query(
      `INSERT INTO users (username, password, first_name, last_name, phone, join_at, last_login_at)
               VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
               RETURNING username, password, first_name, last_name, phone`,
      [username, hashedPass, first_name, last_name, phone]
    );

    twilio.messages
  .create({ body: "You have been registered!", from: "+18337161028", to: "+19702371215" })
    .then(message => console.log(message.sid));

    return newUser.rows[0];
  }


  /** Authenticate: is username/password valid? Returns boolean. */

  static async authenticate(username, password) {
    let user = await db.query(`SELECT password
                         FROM users
                         WHERE username = $1`, [username]);


    return user && await bcrypt.compare(password, user.rows[0].password) === true;
  }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) {


    let user = await db.query(`UPDATE users
    SET last_login_at = CURRENT_TIMESTAMP
    WHERE username = $1
    RETURNING username`, [username]);

    if (!user.rows[0]) throw new NotFoundError(`No such user: ${username}`);
  }
  /** All: basic info on all users:
   * [{username, first_name, last_name}, ...] */

  static async all() {
    let users = await db.query(
      `SELECT username, first_name, last_name
      FROM users
      ORDER BY last_name, first_name`
    );
    return users.rows;
  }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) {
    let user = await db.query(
      `SELECT username,
              first_name,
              last_name,
               phone,
              join_at,
              last_login_at
       FROM users
       WHERE username = $1`, [username]
    );

    if (!user.rows[0]) throw new NotFoundError(`No such user: ${username}`);

    return user.rows[0];
  }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) {
    let messages = await db.query(
      `SELECT id,
              to_username,
              body,
              sent_at,
              read_at,
              username,
              first_name,
              last_name,
              phone
      FROM messages as m
      JOIN users as u
      ON (m.to_username = u.username)

      WHERE from_username = $1`, [username]
    );
    return messages.rows.map(message => {
      return {
        id: message.id,
        to_user: {
          username: message.username,
          first_name: message.first_name,
          last_name: message.last_name,
          phone: message.phone
        },
        body: message.body,
        sent_at: message.sent_at,
        read_at: message.read_at
      };
    });
  }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesTo(username) {
    let messages = await db.query(
      `SELECT id,
              from_username,
              body,
              sent_at,
              read_at,
              username,
              first_name,
              last_name,
              phone
      FROM messages as m
      JOIN users as u
      ON (m.from_username = u.username)

      WHERE to_username = $1`, [username]
    );

    return messages.rows.map(message => {
      return {
        id: message.id,
        from_user: {
          username: message.username,
          first_name: message.first_name,
          last_name: message.last_name,
          phone: message.phone
        },
        body: message.body,
        sent_at: message.sent_at,
        read_at: message.read_at
      };
    });
  }
}
module.exports = User;
