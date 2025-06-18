# Holden Ernest - 5/12/2025
# A Flask based web server for LupuVault
# Production uses a wsgi to serve this

from flask import *
from flask_socketio import SocketIO, join_room, leave_room, send, emit
import os
import sys
from google_images_search import GoogleImagesSearch
import threading

# src/ MODULES
sys.path.insert(0, '/home/lupu/LupuVault/src') # this is needed for the dotenv as well.
import database
import secretkeys
import apis


# load the .env variables into the environment
from dotenv import load_dotenv
load_dotenv()

# ensure the templates know the mime types of the downloaded script files
import mimetypes
mimetypes.add_type('application/javascript', '.js')
mimetypes.add_type('application/typescript', '.ts')


gis = GoogleImagesSearch(os.getenv('IMG_API_KEY'), os.getenv('CSE_ID'))
gis_lock = threading.Lock()

app = Flask(__name__)
app.url_map.strict_slashes = False
app.config['SECRET_KEY'] = os.getenv('FLASK_KEY')
app.config["SESSION_PERMANENT"] = True

socketio = SocketIO(app)

import socketEvents # make sure the script is loaded to recieve the events

database.setG(g)


###
### Types
###
class Notification:
    def __init__(self, stat = "", msg = ""):
        self.status = stat
        self.message = msg
    
    def getMsg(self):
        return self.message
    
    def getStat(self):
        return self.status
    
class PageExtras:
    def __init__(self, noti:Notification = Notification(), funMsg: str = ""):
        self.notification = noti
        self.funMsg = funMsg
    
    def getNoti(self):
        return self.notification
    
    def getFunMsg(self):
        if (self.funMsg == ""):
            return self.generateFunMsg()
        return self.funMsg
    
    def generateFunMsg(self):
        return ""
    
###
### END Types
###

def getCurList():
    """Returns current list, if there is none, assign one
    {owner, listname}
    """
    if ("curList" in session):
        return session["curList"]
    session["curList"] = database.getFirstList(getUsername()) #inherently you have access to this list
    return session["curList"]

def dontUseList(owner, listname):
    """If you are currently using this list somewhere, STOP. most likely its being removed"""
    curList = getCurList()

    if (curList[0] == owner and curList[1] == listname):
        del session["curList"]

def getUsername():
    return session["username"]

def getPassword():
    return session["password"]

def signedIn():
    """Check to make sure the user is signed in on the session variable"""
    if (not "username" in session or not "password" in session):
        return False
    return database.hasUser(session["username"], session["password"])

def createNotification(status, message):
    apis.saveNotification(getUsername(), status, message)

def createDetailedPage(template, pageExtra:PageExtras):
    """Use the template more thourougly by passing in extra parameters like 'error message'"""

    notification = {
        'message': pageExtra.notification.getMsg(),
        'status': pageExtra.notification.getStat()
    }
    return render_template(template, notification=notification, funMsg=pageExtra.getFunMsg())



@app.teardown_appcontext
def close_db(error):
    """Close the pooling for the database"""
    database.close_db(error)

### Main
@app.route("/")
def indexPage():
    """Go to your default list"""
    if (not signedIn()):
        return redirect("/login") #! warning noti
    currentList = getCurList()
    return render_template("listView.html", curListUsr=currentList[1], curListList = currentList[0], whoAmI=getUsername())

### END Main

### APIS
@app.route("/api/notifications/<user>")
def getNotifications(user):
    if (not signedIn()):
        return jsonify([])
    """Returns a json list of all notifications, to be grabbed from ajax calls"""
    apis.getNotifications(user)

@app.route("/api/lists/<owner>/<listname>")
def getList(owner, listname):
    """Strictly API route"""
    if (not signedIn()):
        return jsonify([])
    currentUser = getUsername()
    
    return jsonify(database.getListDict(currentUser, owner, listname))

@app.route("/api/lists")
def getAllLists():
    if (not signedIn()):
        return jsonify([]) #TODO: SETUP ERROR CODES?
    currentUser = getUsername()
    return jsonify(database.getListsInOrder(currentUser))

@app.route("/api/img/<query>")
def getImgFor(query):
    if (not signedIn()):
        return jsonify([])
    
    allurls = []

    with gis_lock:
        gis.search({'q': query, 'num': 5,})
        for image in gis.results():
            allurls.append(image.url)

    return allurls
### END APIS

@app.route("/login", methods=['get'])
def loginPageGet():
    """Send the Login Page to the User"""
    return render_template("login.html")

@app.route("/login", methods=['post'])
def loginPagePost():
    """Get the login info back from the user"""
    username = request.form.get('username', False)
    password = request.form.get('password', False)

    if (not username or not password):
        return redirect("/login") #! warning noti

    if (database.hasUser(username, password)):
        session["username"] = username
        session["password"] = password
        if ("curList" in session):
            del session["curList"]
        return redirect("/")

    return createDetailedPage(template="login.html", pageExtra=PageExtras(noti=Notification(stat="warning", msg="Incorrect username or password")))

@app.route("/newuser")
def generateURL():
    """Generate a new user URL if you can"""
    if (not signedIn()):
        return redirect("/login")
    
    username = session["username"]
    _ul = database.getUserLevel(username)
    if (not _ul == "admin" and not _ul == "owner"):
        return render_template("errors/incorrectPerms.html")
    
    key = secretkeys.newOTUserKey("normal")
    normalkeyurl = request.url + "/" + key
    adminkeyurl = ""
    if (_ul == "owner"):
        adminkey = secretkeys.newOTUserKey("admin")
        adminkeyurl = request.url + "/" + adminkey
    return render_template("generateURL.html", normalkeyurl=normalkeyurl, adminkeyurl=adminkeyurl)

@app.route("/newuser/<key>", methods=['get'])
def newUserGet(key):
    """ensure the key is real, allow the user to post a username and password to be associated with the one time key"""
    if (not secretkeys.hasOTUserKey(key)):
        return render_template("errors/incorrectKey.html")
    return render_template("addUser.html")

@app.route("/newuser/<key>", methods=['post'])
def newUserPost(key):
    """A limited time access url with a key generated by an _admin_ user that allows for a new user to be created"""
    username = request.form['username']
    password = request.form['password']

    madeUser = database.hasUsername(username) #TODO: do some kinda ajax instead
    if (madeUser):
        return createDetailedPage(template="addUser.html", pageExtra=PageExtras(noti=Notification(stat="warning", msg="Username already taken")))

    keyInfo = secretkeys.useOTUserKey(key) # only remove the key when the user is made
    if (not keyInfo):
        return render_template("errors/incorrectKey.html")
    
    madeUser = database.createUser(username, password, keyInfo["userlevel"])
    
    return redirect("/login")

socketEvents.register_events(socketio, getCurList, getUsername, join_room, leave_room, emit)


if __name__ == '__main__':
    socketio.run(app, debug=True, port=2001)