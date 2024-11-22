# use sqlite to store data
# use flask to create the server

# https://docs.python.org/3/library/sqlite3.html
# https://flask.palletsprojects.com/en/stable/

import sqlite3
from werkzeug.security import generate_password_hash, check_password_hash
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS 
import logging
import json
logging.basicConfig(level=logging.DEBUG)

def get_db():
    conn = sqlite3.connect('database.db')
    conn.row_factory = sqlite3.Row  # Enables column access by name
    return conn

# conn = get_db()
# cursor = conn.cursor()
# cursor.execute('DROP TABLE IF EXISTS users')
# cursor.execute('DROP TABLE IF EXISTS events')
# cursor.execute('DROP TABLE IF EXISTS participants')
# cursor.execute('DROP TABLE IF EXISTS messages')
# conn.commit()
# conn.close()

def init_database():
    conn = get_db()
    cursor = conn.cursor()

    # cursor.execute('DROP TABLE IF EXISTS messages')
    
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
                FOREIGN KEY (username) REFERENCES users (username))''')
    cursor.execute(
        '''CREATE TABLE IF NOT EXISTS messages(
                message_id INTEGER PRIMARY KEY AUTOINCREMENT,
                sender TEXT NOT NULL,
                reciever TEXT NOT NULL,
                contents TEXT NOT NULL,
                datetime DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (sender) REFERENCES users(username),
                FOREIGN KEY (reciever) REFERENCES users(username))''')
    conn.commit()
    conn.close()
    
init_database()
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes
@app.after_request
def after_request(response):
    logging.debug(f"Response: {response.status_code} - {response.get_data(as_text=True)}")
    return response

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/messages')
def messages_page():
    return render_template('messages.html')

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

@app.route("/users/<username>/events", methods=["GET"]) # get all events a user is participating in
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

@app.route('/register', methods=["POST"])  # user registration
def registerUser():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    name = data.get('name')
    total_budget = data.get('total_budget')

    if total_budget is None:
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
        ''', (username, generate_password_hash(password), name, total_budget))
    
        conn.commit()
    except sqlite3.IntegrityError:
        return jsonify({"error": "User already exists"}), 409
    finally:
        conn.close()

    return jsonify({"message": "User registered successfully"}), 201
    
@app.route('/login', methods=['POST']) # user login
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'error': 'Username and password are required'}), 400

    conn = get_db()
    validate = conn.execute('''
        SELECT *
        FROM 
            users 
        WHERE username = ?''',
    (username,)).fetchone()

    conn.close()

    if validate is None:
        return jsonify({'error': 'Invalid username or password'}), 401

    user_data = {
        'username': validate['username'],
        'name': validate['name'],
        'total_budget': validate['total_budget']
    }
    if check_password_hash(validate['password'], password):
        return jsonify(user_data), 200

    else:
        return jsonify({'error': 'Invalid username or password'}), 401

@app.route('/users', methods=['GET'])
def get_users():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT username, name FROM users')
    users = [dict(row) for row in cursor.fetchall()]
    return jsonify(users)

@app.route('/messages', methods=['POST'])
def send_message():
    data = request.get_json()
    conn = get_db()
    cursor = conn.cursor()

    try:
        # Make sure all required fields are present
        if not all(k in data for k in ['sender', 'reciever', 'contents']):
            return jsonify({"error": "Missing required fields"}), 400

        cursor.execute('''
            INSERT INTO messages (sender, reciever, contents)
            VALUES (?, ?, ?)
        ''', (data['sender'], data['reciever'], data['contents']))

        conn.commit()
        return jsonify({"message": "Message sent successfully"}), 201
    except Exception as e:
        print(f"Error sending message: {str(e)}")  # Add debug logging
        return jsonify({"error": str(e)}), 400
    finally:
        conn.close()

@app.route('/messages/recieved/<username>', methods=['GET']) # gets all messages a user has recieved
def get_messages(username):
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute('''
        SELECT *
        FROM messages
        WHERE reciever = ?
        ORDER BY datetime ASC
    ''', (username,))

    messages = [dict(row) for row in cursor.fetchall()]
    return jsonify(messages)

@app.route('/messages/sent/<username>', methods=['GET']) # gets all messages a user has sent
def get_sent_messages(username):
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute('''
        SELECT *
        FROM messages
        WHERE sender = ?
        ORDER BY datetime ASC
    ''', (username,))

    messages = [dict(row) for row in cursor.fetchall()]
    return jsonify(messages)

# route to get messages between two users
@app.route('/messages/<sender>/<reciever>', methods=['GET'])
def get_messages_between(sender, reciever):
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute('''
        SELECT *
        FROM messages
        WHERE (sender = ? AND reciever = ?)
        OR (sender = ? AND reciever = ?)
        ORDER BY datetime ASC
    ''', (sender, reciever, reciever, sender))

    messages = [dict(row) for row in cursor.fetchall()]
    return jsonify(messages)

# Add to your existing Flask routes:

@app.route('/events/invite', methods=['POST'])
def invite_to_event():
    data = request.get_json()
    conn = get_db()
    cursor = conn.cursor()
    
    try:
        # Verify event exists and sender is a participant
        cursor.execute('''
            SELECT e.* FROM events e
            JOIN participants p ON e.event_id = p.event_id
            WHERE e.event_id = ? AND p.username = ?
        ''', (data['event_id'], data['sender']))
        
        event = cursor.fetchone()
        if not event:
            return jsonify({"error": "Event not found or you're not a participant"}), 404

        # Create invitation message with event details
        message_content = {
            "type": "event_invitation",
            "event_id": data['event_id'],
            "event_details": dict(event)
        }
        
        cursor.execute('''
            INSERT INTO messages (sender, reciever, contents)
            VALUES (?, ?, ?)
        ''', (data['sender'], data['recipient'], json.dumps(message_content)))
        
        conn.commit()
        return jsonify({"message": "Invitation sent"}), 201
        
    except Exception as e:
        return jsonify({"error": str(e)}), 400
    finally:
        conn.close()

@app.route('/events/<int:event_id>/join', methods=['POST'])
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
        
        # Send response message to inviter
        if 'inviter' in data:
            response_content = {
                "type": "invitation_response",
                "event_id": event_id,
                "status": "accepted"
            }
            cursor.execute('''
                INSERT INTO messages (sender, reciever, contents)
                VALUES (?, ?, ?)
            ''', (data['username'], data['inviter'], json.dumps(response_content)))
        
        conn.commit()
        return jsonify({"message": "Joined event successfully"}), 200
    except sqlite3.IntegrityError:
        return jsonify({"error": "Already joined this event"}), 400
    finally:
        conn.close()

if __name__ == "__main__":
    conn = get_db()
    cursor = conn.cursor()
    
    # TEST USERS
    users = [
        ('a', generate_password_hash('a'), 'test1', '100'),
        ('b', generate_password_hash('b'), 'test2', '50')
    ]

    cursor.executemany('''INSERT OR REPLACE INTO users(username, password, name, total_budget) 
                         VALUES (?,?,?,?)''', users)

    conn.commit()
    conn.close()
    
    app.run(debug=True) # run and wait for requests 
    #flask --app .\Server\main.py run