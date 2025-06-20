# Holden Ernest - 5/16/2025
# Handles all the socketio events
#import sys

#sys.path.insert(0, '/home/lupu/LupuVault')
#from main import * # these are so the ide is happy
#from flask_socketio import join_room, leave_room #
import database

from flask import session

def getCurListA():
    """Returns current list, if there is none, assign one
    {owner, listname}
    """
    if ("curList" in session):
        return session["curList"]
    session["curList"] = database.getFirstList(getUsernameA()) #inherently you have access to this list
    return session["curList"]

def getUsernameA():
    return session["username"]

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


    @socketio.on('remove-listItem')
    def removeListItem(listItem):
        didRemove = database.removeListItem(getUsername(), listItem)
        if (didRemove):
            emit('push-noti', {'status': 'success', 'message': "Saved list.."})
            socketio.emit('update-remove', {'item': listItem}, room=getRoomCode(), include_self=False)
        else:
            emit('push-noti', {'status': 'error', 'message': "Failed Removing Item.."})

    @socketio.on('import-list')
    def importList(data):
        """import a CSV string, convert it to go into the database"""
        fileData = data["file"]
        if (not fileData or fileData["size"] > 1000000 or len(fileData["content"]) > 1000000): # socket transfer size doesnt allow anything over a meg
            print("Bad or too long file imported..")
            return
        if ("csv" in fileData["type"]):
            database.saveCSVItems(getUsername(), data["owner"], data["listname"], fileData["content"])

    @socketio.on('remove-list')
    def removeList(owner, listname):
        """Completely remove this list from the database. IMPORTANT to get this secure"""
        if (not getUsername() == owner):
            return
        
        print("PREPPING TO DELETE: ", listname, " by ", owner)

        database.removeList(getUsername(), owner, listname)

    @socketio.on('save-listItem')
    def sendListItem(listItem):
        # You cant trust the client, ensure the sessioned user has access to this list
        createdItem = database.updateListItem(getUsername(), listItem)

        if (createdItem):
            emit('push-noti', {'status': 'success', 'message': "Saved list.."})
            
            # only emmit to everyone if the changes are in place.
            if (isinstance(createdItem, list)):
                # if this is a new item, make sure to grab its id to send to everyone on the socket (including yourself to update ID)
                listItem["itemID"] = createdItem[0][0]
                socketio.emit('update-listItem', {'item': listItem}, room=getRoomCode(), include_self=True)
            else:
                socketio.emit('update-listItem', {'item': listItem}, room=getRoomCode(), include_self=False)
            #package listItem into an object in case you want to read other info like status.
        else:
            emit('push-noti', {'status': 'error', 'message': "Save failed.."})
