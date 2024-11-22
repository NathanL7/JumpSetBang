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
                FOREIGN KEY (event_id) REFERENCES events(event_id),
                FOREIGN KEY (username) REFERENCES users (username)''')
    cursor.execute(
        '''CREATE TABLE IF NOT EXISTS messages(
                message_id INTEGER PRIMARY KEY AUTOINCREMENT,
                event_id INTEGER NOT NULL,
                username TEXT NOT NULL,
                message TEXT NOT NULL,
                FOREIGN KEY (username) REFERENCES users(username)'''
    )

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

# Join event
@app.route("/events/<int:event_id>/join", methods=["POST"])
def join_event(event_id):
    data = request.get_json()
    conn = get_db()
    cursor = conn.cursor()
    
    try:
        # Check if event exists
        cursor.execute("SELECT cost FROM events WHERE event_id = ?", (event_id,))
        event = cursor.fetchone()
        if not event:
            return jsonify({"error": "Event not found"}), 404
            
        # Check user's budget
        cursor.execute("SELECT total_budget FROM users WHERE username = ?", (data['username'],))
        user = cursor.fetchone()
        if not user or user['total_budget'] < event['cost']:
            return jsonify({"error": "Insufficient budget"}), 400
            
        # Add participant
        cursor.execute('''
            INSERT INTO participants (event_id, username)
            VALUES (?, ?)
        ''', (event_id, data['username']))
        
        conn.commit()
        return jsonify({"message": "Joined event successfully"}), 200
    except sqlite3.IntegrityError:
        return jsonify({"error": "Already joined this event"}), 400
    finally:
        conn.close()

# Get event details
@app.route("/events/<int:event_id>", methods=["GET"])
def get_event(event_id):
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT e.*, GROUP_CONCAT(p.username) as participants
        FROM events e
        LEFT JOIN participants p ON e.event_id = p.event_id
        WHERE e.event_id = ?
        GROUP BY e.event_id
    ''', (event_id,))
    
    event = cursor.fetchone()
    if not event:
        return jsonify({"error": "Event not found"}), 404
        
    result = dict(event)
    result['participants'] = result['participants'].split(',') if result['participants'] else []
    
    return jsonify(result)

# Get user's events
@app.route("/users/<username>/events", methods=["GET"])
def get_user_events(username):
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT e.*
        FROM events e
        JOIN participants p ON e.event_id = p.event_id
        WHERE p.username = ?
    ''', (username,))
    
    events = [dict(row) for row in cursor.fetchall()]
    return jsonify(events)

@app.route('/register', method=["POST"])
def registerUser():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    name = data.get('name')
    total_budget = data.get('total_budget')

    if not total_budget:
        total_budget = 0

    conn = get_db()
    cursor = conn.cursor()
    
    try:
        cursor.execute('''
            INSERT INTO users(
                username,
                password,
                name,
                total_budget) 
                VALUES (?,?,?,?)
        ''', (username, password, name, total_budget))
    
        conn.commit()
    except sqlite3.IntegrityError:
        return jsonify({"error": "User already exists"}), 409
    finally:
        conn.close()

    return jsonify({"message": "User registered successfully"}), 201
    
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
    #flask --app .\Server\main.py run