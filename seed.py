"""Seed Messagely system with fake data.

must install requirements.txt in venv to run


"""


import random
import faker
import psycopg2
import datetime
import bcrypt

NUM_USERS = 20 # change num users
NUM_MESSAGES = 50 # change num messages

fake = faker.Faker()

conn = psycopg2.connect("postgresql:///messagely")
curs = conn.cursor()


curs.execute("TRUNCATE users, messages RESTART IDENTITY CASCADE")
usernames = []  # This list will store all the usernames

for i in range(NUM_USERS):
    username = fake.user_name()
    usernames.append(username)
    password = bcrypt.hashpw("password".encode('utf-8'), bcrypt.gensalt())
    first_name = fake.first_name()
    last_name = fake.last_name()
    phone = fake.phone_number()
    join_at = fake.date_time_this_year(before_now=True, after_now=False)
    last_login_at = fake.date_time_this_year(before_now=True, after_now=False)

    curs.execute(
        "INSERT INTO users (username, password, first_name, last_name, phone, join_at, last_login_at)"
        " VALUES (%s, %s, %s, %s, %s, %s, %s)",
        (username, password, first_name, last_name, phone, join_at, last_login_at)
    )

for i in range(NUM_MESSAGES):
    from_username = random.choice(usernames)
    to_username = random.choice(usernames)
    body = fake.text()
    sent_at = fake.date_time_this_year(before_now=True, after_now=False)
    read_at = fake.date_time_this_year(before_now=True, after_now=False) if random.random() < .6 else None

    curs.execute(
        "INSERT INTO messages (from_username, to_username, body, sent_at, read_at)"
        " VALUES (%s, %s, %s, %s, %s)",
        (from_username, to_username, body, sent_at, read_at)
    )

conn.commit()
