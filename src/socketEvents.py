# Holden Ernest - 5/16/2025
# Handles all the socketio events

from main import *

@socketio.on('connect')
def handle_connect():
    print('Client connected')

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')

@socketio.on('save-listItem')
def sendListItem(listItem):
    # You cant trust the client, ensure the sessioned user has access to this list
    if (not userCanAccessCurrentList()):
        return
    
    database.saveItemToCurList()
    socketio.emit('edit-listItem', {'data': 'Server response'})