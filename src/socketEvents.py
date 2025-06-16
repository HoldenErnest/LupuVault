# Holden Ernest - 5/16/2025
# Handles all the socketio events
#import sys

#sys.path.insert(0, '/home/lupu/LupuVault')
#from main import * # these are so the ide is happy
#from flask_socketio import join_room, leave_room #
import database

def register_events(socketio, getCurList, getUsername, join_room, leave_room, emit):

    @socketio.on('connect')
    def handle_connect():
        print('Client connected')

    @socketio.on('disconnect')
    def handle_disconnect():
        print('Client disconnected')

    @socketio.on('join_group')
    def on_join():
        roomCode = getRoomCode() #your room code is a combination of the listOwner-listname
        print("joining room: ", roomCode)
        join_room(roomCode)

    @socketio.on('leave_group')
    def on_leave():
        """ I dont think this should really be called, leaving should happen when you try to join a new group"""
        leave_room(getRoomCode())

    def getRoomCode():
        """ Your room code is a hash of the list youre currently visiting"""
        currentList = getCurList()
        return "\n~" + currentList[1] + "~\n~" + currentList[0] + "~\n"


    @socketio.on('save-listItem')
    def sendListItem(listItem):
        print("saving list Item")
        # You cant trust the client, ensure the sessioned user has access to this list
        createdItem = database.updateListItem(getUsername(), listItem)

        if (createdItem):
            emit('push-noti', {'status': 'success', 'message': "Saved list.."})
            
            # only emmit to everyone if the changes are in place.
            if (isinstance(createdItem, list)):
                # if this is a new item, make sure to grab its id to send to anyone else on the socket
                listItem["itemID"] = createdItem[0][0]
                print(createdItem, " is the item")
            print ("sending", listItem)
            socketio.emit('update-listItem', {'item': listItem}, room=getRoomCode(), include_self=False)
            #package listItem into an object in case you want to read other info like status.
        else:
            emit('push-noti', {'status': 'error', 'message': "Save failed.."})
