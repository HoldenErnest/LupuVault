# Holden Ernest - 5/12/2025
# A Flask based web server for LupuVault
# Production uses a wsgi to serve this

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
    return render_template("listView.html")


if __name__ == '__main__':
    socketio.run(app, debug=True) # debug=True, , ssl_context=('./cert.pem', './key.pem')
# Enable the venv: $ source /home/lupu/LupuVault/.venv/bin/activate