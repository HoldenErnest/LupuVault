from flask import Flask, render_template
from flask_socketio import SocketIO, send, emit
import os
from dotenv import load_dotenv
load_dotenv()

import mimetypes
mimetypes.add_type('application/javascript', '.js')
mimetypes.add_type('application/typescript', '.ts')



app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('FLASK_KEY')
socketio = SocketIO(app)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/draw")
def draw():
    return render_template("draw.html")


if __name__ == '__main__':
    socketio.run(app, debug=True)