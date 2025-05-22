# Holden Ernest - 5/13/2025
# This module is used for handling anything that directly talks with the database acting as an interface

import os
import hashlib
import uuid
import mysql.connector
from pathlib import Path
import listHandler

dotenv_path = Path(__file__).resolve().parent.parent / '.env'
from dotenv import load_dotenv, find_dotenv
load_dotenv(dotenv_path)

### Database initialization
USER_TABLE = "users"
LIST_TABLE = "lists"

MY_DB = mysql.connector.connect(
    host="localhost", # localhost
    user=os.getenv('DB_USER'), # user
    password=os.getenv('DB_PASS'), # pass
    database=os.getenv('DB_NAME') # DB
)
dbCursor = MY_DB.cursor()

def _checkDBConnection():
    global dbCursor
    if (not MY_DB.is_connected()):
        print("DB was disconnected, reconnecting..")
        MY_DB.connect(
            host="localhost", # localhost
            user=os.getenv('DB_USER'), # user
            password=os.getenv('DB_PASS'), # pass
            database=os.getenv('DB_NAME') # DB
        )
        dbCursor = MY_DB.cursor()

def _tryInsert(sql, vals):
    """Build all SQL inserts through this"""
    _checkDBConnection()
    try:
        dbCursor.execute(sql, vals)
        MY_DB.commit()
        return True
    except (mysql.connector.Error, mysql.connector.Warning) as e:
        print("SQL Insert Error: ")
        print(e)
        return False

def _trySelect(sql, vals):
    """Build all SQL selects through this"""
    _checkDBConnection()
    try:
        dbCursor.execute(sql, vals)
        res = dbCursor.fetchall()
        if res:
            return res
        return None
    except (mysql.connector.Error, mysql.connector.Warning) as e:
        print("SQL Select Error: ")
        print(e)
        return None

def hasUsername(username):
    sql = "SELECT username FROM users WHERE username = %s limit 1"
    vals = (username,)
    if (_trySelect(sql, vals)):
        return True
    return False

def hasUser(username, password):
    sql = "SELECT password FROM users WHERE username = %s limit 1"
    vals = (username,)
    res = _trySelect(sql, vals)
    if (res):
        _hashPass = res[0][0]
        if (matchHashedText(_hashPass, password)):
            return True
        return False
    return False

def getUserLevel(username):
    sql = "SELECT userlevel FROM users WHERE username = %s limit 1"
    vals = (username,)
    res = _trySelect(sql, vals)
    if (res):
        _ul = res[0][0]
        return _ul
    return False

def userHasAccess(connectedUser, listOwner, listname, write = False):
    if (connectedUser == listOwner):
        return True
    
    sql = "SELECT guest, perms FROM guests WHERE owner = %s AND listname = %s AND guest = %s"
    vals = (listOwner,listname,connectedUser)
    res = _trySelect(sql, vals)
    if (res):
        if (write): # if you NEED write perms
            if (res[0][1] == "write"):
                return True
            else:
                return False
        return True
    return False

def setGuestPermsForList(connectedUser, newGuest, listOwner, listname, perms):
    if (connectedUser != listOwner):
        return False
    
    if (perms == "none"):
        return removeGuestForList(connectedUser, newGuest, listOwner, listname)
    
    sql = "INSERT INTO guests (owner, listname, guest, perms) VALUES (%s, %s, %s, %s)"
    vals = (listOwner, listname, newGuest, perms)
    return _tryInsert(sql, vals)

def removeGuestForList(connectedUser, newGuest, listOwner, listname):
    if (connectedUser != listOwner):
        return False
    sql = "DELETE FROM guests where owner = %s AND listname = %s AND guest = %s"
    vals = (listOwner, listname, newGuest)
    return _tryInsert(sql, vals)

def getFirstList(user):
    """Get the last opened list"""
    lists = getListsInOrder(user)
    if (len(lists) > 0):
        return lists[0]
    else:
        createList(user, "firstList")
        return {"owner": user, "listname":"firstList"}

def getListsInOrder(user):
    """Returns the lists in an order that they will be displayed for the user"""
    # dec from recency. First all user owned lists, then all guest lists
    sql = "SELECT listname, owner FROM allLists WHERE owner = %s order by lastwrite desc"
    vals = (user,)

    res = _trySelect(sql, vals)
    if (res):
        sql = "SELECT listname, owner FROM guests WHERE guest = %s order by listname asc"
        vals = (user,)

        res2 = _trySelect(sql, vals)
        if (res2):
            return res + res2
        else:
            return res
    else:
        return () #! TEST

def ensureListExists(connectedUser, owner, listname):
    """Add a list if it doesnt exist so there will never be problems"""

    if (connectedUser == owner):
        createList(owner, listname)
    #TODO: make this not as computational on the database?

def updateListItem(connectedUser, listItem):
    """Update a list item, if it doesnt have an item with that uid, make one"""
    listOwner = listItem["owner"]
    listname = listItem["listname"]
    if (not userHasAccess(connectedUser, listOwner, listname, True)):
        return False
    
    ensureListExists(connectedUser, listOwner, listname) # since we know userHasAccess, this list already exists if its from another user

    (sql, vals) = getQueryFromListItem(listItem)
    print(sql, " :: ", vals)
    return _tryInsert(sql, vals)

def getQueryFromListItem(listItem):
    """Returns a usable query for mysql which allows ommiting certain fields"""

    update_fields = []
    insert_fields = []
    val_fields = []

    update_fields.append("owner=%s")
    insert_fields.append("owner")
    val_fields.append(listItem["owner"])
    update_fields.append("listname=%s")
    insert_fields.append("listname")
    val_fields.append(listItem["listname"])

    if "title" in listItem:
        update_fields.append("title=%s")
        insert_fields.append("title")
        val_fields.append(listItem["title"])
    if "notes" in listItem:
        update_fields.append("notes=%s")
        insert_fields.append("notes")
        val_fields.append(listItem["notes"])
    if "rating" in listItem:
        update_fields.append("rating=%s")
        insert_fields.append("rating")
        val_fields.append(listItem["rating"])
    if "tags" in listItem:
        update_fields.append("tags=%s")
        insert_fields.append("tags")
        val_fields.append(listItem["tags"])
    if "date" in listItem:
        update_fields.append("date=%s")
        insert_fields.append("date")
        val_fields.append(listItem["date"])
    if "imageURL" in listItem:
        update_fields.append("imageURL=%s")
        insert_fields.append("imageURL")
        val_fields.append(listItem["imageURL"])
    

    if ("itemID" not in listItem or listItem["itemID"] < 0):
        sql = "INSERT INTO listData (" + ", ".join(insert_fields) + ") VALUES (" + ("%s,"*len(insert_fields))[:-1] + ");"
        vals = tuple(val_fields)
        return (sql, vals)
    else:
        sql = "UPDATE listData SET " + ", ".join(update_fields) + " WHERE itemID=%s AND owner=%s AND listname=%s"
        val_fields.append(listItem["itemID"])
        val_fields.append(listItem["owner"])
        val_fields.append(listItem["listname"])
        vals = tuple(val_fields)
        return (sql, vals)
    

def getListItemDict(connectedUser, listOwner, listname, itemID):
    """Returns a JSON object of the requested list"""
    if (not userHasAccess(connectedUser, listOwner, listname, False)):
        return listHandler.createError(403, "Forbidden: '" + connectedUser + "' does not have access to this list")

    sql = "SELECT * FROM listData WHERE owner = %s AND listname = %s AND itemID = %s"
    vals = (listOwner,listname, itemID)
    res = _trySelect(sql, vals)
    if (res):
        return listHandler.listSQLToDict(dbCursor, res)

def getListDict(connectedUser, listOwner, listname):
    """Returns a JSON object of the requested list"""
    if (not userHasAccess(connectedUser, listOwner, listname, False)):
        return listHandler.createError(403, "Forbidden: '" + connectedUser + "' does not have access to this list")

    sql = "SELECT * FROM listData WHERE owner = %s AND listname = %s"
    vals = (listOwner,listname)
    res = _trySelect(sql, vals)
    if (res):
        return listHandler.listSQLToDict(dbCursor, res)

def createUser(username, password):
    """Create a new user, username MUST be unique. Password is salted and hashed"""
    _hashPassword = newHashText(password)
    sql = "INSERT INTO users (username, password) VALUES (%s, %s)"
    vals = (username, _hashPassword)
    return _tryInsert(sql, vals)

def removeUser(username):
    """Remove a user from the database"""
    sql = "DELETE FROM users WHERE username = %s"
    vals = (username,)
    return _tryInsert(sql, vals)

def createUser(username, password, userlevel):
    """Create a new user, username MUST be unique. Password is salted and hashed"""
    _hashPassword = newHashText(password)
    sql = "INSERT INTO users (username, password, userlevel) VALUES (%s, %s, %s)"
    vals = (username, _hashPassword, userlevel)
    return _tryInsert(sql, vals)

def createList(username, listname):
    """Create a new list"""
    sql = "INSERT INTO allLists (owner, listname) VALUES (%s, %s)"
    vals = (username, listname)
    return _tryInsert(sql, vals)

def removeList(connectedUser, owner, listname):
    """Remove a list from the database, including all its lists items"""
    if (owner != connectedUser):
        return False
    
    sql = """DELETE allLists, listData
 FROM allLists
 LEFT JOIN listData
 ON allLists.listname = listData.listname AND allLists.owner = listData.owner
 WHERE allLists.owner = %s AND allLists.listname = %s;"""
    vals = (owner, listname)

    if (_tryInsert(sql, vals)):
        #TODO: remove all guests from this list
        #dontUseList(owner, listname)
        return

def _generate_salt():
    """Generate a random Unique salt for newly created users"""
    return uuid.uuid4().hex
def newHashText(text):
    """Basic hashing function for a text using random unique salt. [Reference](https://gist.github.com/markito/30a9bc2afbbfd684b31986c2de305d20)"""
    salt = _generate_salt()
    return hashlib.sha256(salt.encode() + text.encode()).hexdigest() + ':' + salt
def matchHashedText(hashedText, providedText):
    """Check for the text in the hashed text. [Reference](https://gist.github.com/markito/30a9bc2afbbfd684b31986c2de305d20)"""
    try:
        _hashedText, salt = hashedText.split(':')
        return _hashedText == hashlib.sha256(salt.encode() + providedText.encode()).hexdigest()
    except Exception as e:
        print("HASHING ERROR: ")
        print(e)
        return False