# Holden Ernest - 5/12/2025
# A Flask based web server for LupuVault
# Production uses a wsgi to serve this

from flask import Flask, render_template
from flask_socketio import SocketIO, send, emit
import hashlib
import mysql.connector
import os
import sys
sys.path.insert(0, '/home/lupu/LupuVault/src')
from mod import test

from dotenv import load_dotenv
load_dotenv()
import mimetypes
mimetypes.add_type('application/javascript', '.js')
mimetypes.add_type('application/typescript', '.ts')

### Database initialization
USER_TABLE = "users"
LIST_TABLE = "lists"

masdydb = mysql.connector.connect(
    host="localhost", # localhost
    user=os.getenv('DB_USER'), # user
    password=os.getenv('DB_PASS'), # pass
    database=os.getenv('DB_NAME') # DB
)

def createUser(username, password):
    mydb = mysql.connector.connect(
        host="localhost", # localhost
        user=os.getenv('DB_USER'), # user
        password=os.getenv('DB_PASS'), # pass
        database=os.getenv('DB_NAME') # DB
    )
    mycursor = mydb.cursor()

    # hash the password

    sql = "INSERT INTO users (username, password) VALUES (%s, %s)"
    vals = (username, password)
    test() #! test module remove
    mycursor.execute(sql, vals)
    mydb.commit()
    print(mycursor.rowcount, " user added")

def generate_salt():
    return os.urandom(16)


### APP WEB PAGES
app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('FLASK_KEY')
socketio = SocketIO(app)

@app.route("/")
def index():
    createUser("bill", "pass")
    return render_template("listView.html")


if __name__ == '__main__':
    socketio.run(app, debug=True) # debug=True, , ssl_context=('./cert.pem', './key.pem')
# Enable the venv: $ source /home/lupu/LupuVault/.venv/bin/activate