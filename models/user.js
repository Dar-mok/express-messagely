"use strict";

/** User of the site. */



const { SECRET_KEY, BCRYPT_WORK_FACTOR } = require("../config");
const db = require("../db");
const bcrypt = require("bcrypt");
const { NotFoundError } = require("../expressError");

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
    return newUser.rows[0];
  }


  /** Authenticate: is username/password valid? Returns boolean. */

  static async authenticate(username, password) {
    let user = await db.query(`SELECT password
                         FROM users
                         WHERE username = $1`, [username]);

    return await bcrypt.compare(password, user.rows[0].password) === true;
  }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) {
    await db.query(`UPDATE users
    SET last_login_at = CURRENT_TIMESTAMP
    WHERE username = $1`, [username]);
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
      `SELECT id, to_username as to_user, body, sent_at, read_at
      FROM messages
      WHERE from_username = $1`, [username]
    );
    // console.log('messages messagesFrom ======', messages.rows);

    if (!messages.rows[0]) throw new NotFoundError(`No messages for such user: ${username}`);

    for (let message of messages.rows) {
      let toUserData = await db.query(
        `SELECT username, first_name, last_name, phone
        FROM users
        WHERE username = $1`, [message.to_user]);

      message.to_user = toUserData.rows[0];
    }
    // console.log('messages messagesFrom AFTER LOOP ======', messages.rows);

    return messages.rows;
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
      `SELECT id, from_username as from_user, body, sent_at, read_at
      FROM messages as m
      WHERE m.to_username = $1`, [username]
    );

    if (!messages.rows[0]) throw new NotFoundError(`No messages for such user: ${username}`);

    for (let message of messages.rows) {
      const fromUserData = await db.query(
        `SELECT username, first_name, last_name, phone
        FROM users
        WHERE username = ${message.from_user}`);

      message.from_user = fromUserData.rows[0];
    }

    return messages.rows;
  }

}
module.exports = User;
