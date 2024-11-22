# use sqlite to store data
# use flask to create the server

# https://docs.python.org/3/library/sqlite3.html
# https://flask.palletsprojects.com/en/stable/

import sqlite3
from flask import Flask, request, jsonify

conn = sqlite3.connect('database.db') # create database
cursor = conn.cursor()

cursor.execute("CREATE TABLE IF NOT EXISTS users(username TEXT PRIMARY KEY, password, name, total_budget)")
cursor.execute("CREATE TABLE IF NOT EXISTS users_to_events(username TEXT PRIMARY KEY, event_id)") #make sure time of same user don't overlap
cursor.execute("CREATE TABLE IF NOT EXISTS events(event_id INTEGER PRIMARY KEY, time_begin, time_end, location, cost)") # 

app = Flask(__name__)

@app.route("/")
def hello_world():
    return "<p>Ping successful, server is running</p>" 



# flask --app main run



# INSERT STATEMENT
cursor.execute("""INSERT INTO users(username, password, name, total_budget)""")