# use sqlite to store data
# use flask to create the server

# https://docs.python.org/3/library/sqlite3.html
# https://flask.palletsprojects.com/en/stable/

import sqlite3
from flask import Flask, request, jsonify

def get_db():
    conn = sqlite3.connect('database.db')
    conn.row_factory = sqlite3.Row  # Enables column access by name
    return conn

def init_database():
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute(
        '''CREATE TABLE IF NOT EXISTS users(
                username TEXT PRIMARY KEY,
                password TEXT NOT NULL,
                name TEXT NOT NULL,
                total_budget REAL NOT NULL)''')
    cursor.execute(
        '''CREATE TABLE IF NOT EXISTS events(
                event_id INTEGER PRIMARY KEY AUTOINCREMENT, 
                time_begin DATETIME NOT NULL,
                time_end DATETIME NOT NULL,
                location TEXT NOT NULL,
                cost REAL NOT NULL)''')
    cursor.execute(
        '''CREATE TABLE IF NOT EXISTS participants(
            event_id INTEGER NOT NULL,
            username TEXT NOT NULL,
            PRIMARY KEY(event_id, username),
            FOREIGN KEY (event_id) REFERENCES events)''')

    conn.commit()
    conn.close()
    
init_database()
app = Flask(__name__)

@app.route("/")
def hello_world():
    return "<p>Ping successful, server is running</p>" 



# Create event
@app.route("/events", methods=["POST"])
def create_event():
    data = request.get_json()
    conn = get_db()
    cursor = conn.cursor()
    
    try:
        # Insert event
        cursor.execute('''
            INSERT INTO events (time_begin, time_end, location, cost)
            VALUES (?, ?, ?, ?)
        ''', (data['time_begin'], data['time_end'], data['location'], data['cost']))
        
        event_id = cursor.lastrowid
        
        # Add creator as participant
        cursor.execute('''
            INSERT INTO participants (event_id, username)
            VALUES (?, ?)
        ''', (event_id, data['username']))
        
        conn.commit()
        return jsonify({"message": "Event created", "event_id": event_id}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400
    finally:
        conn.close()




if __name__ == "__main__":
    conn = get_db()
    cursor = conn.cursor()
    
    # TEST USER
    users = [('a', 'a', 'test1', '100'), ('b', 'b', 'test2', '50')]
    # INSERT STATEMENT
    cursor.executemany('''INSERT INTO users(username, password, name, total_budget) VALUES (?,?,?,?)''', users)

    conn.commit()
    conn.close()
    
    app.run(debug=True) # run and wait for requests 
    # flask --app main run