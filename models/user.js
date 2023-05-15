"use strict";

/** User of the site. */
const BCRYPT_WORK_FACTOR = 12;


const { SECRET_KEY } = require("../config");
const db = require("../db");
const bcrypt = require("bcrypt");

class User {

  constructor(username, password, first_name, last_name, phone) {
    this.username = username;
    this.password =
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
      `INSERT INTO users (username, password, first_name, last_name, phone)
               VALUES ($1, $2, $3, $4, $5)
               RETURNING username, password, first_name, last_name, phone`,
      [username, hashedPass, first_name, last_name, phone]
    );
    return newUser;
  } //TODO: add username check? maybe not?


  /** Authenticate: is username/password valid? Returns boolean. */

  static async authenticate(username, password) {
    let user = db.query(`SELECT password
                         FROM users
                         WHERE username = $1`, [username]);

    return await bcrypt.compare(password, user.password);
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
    return await db.query(
      `SELECT (username, first_name, last_name)
      FROM users
      ORDER BY last_name, first_name`
    );
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
    return await db.query(
      `SELECT username,
              first_name,
              last_name,
               phone,
              join_at,
              last_login_at
       FROM users
       WHERE username = $1`, [username]
    );
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
      `SELECT (id, to_user, body, sent_at, read_at)
      FROM messages as m
      JOIN users as u
      On u.username = m.to_user
      WHERE m.from_username = $1`, [username]
    );
  }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesTo(username) {
  }
}


module.exports = User;
