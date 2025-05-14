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

def userHasAccess(connectedUser, listOwner, listname, write):
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

def addGuestToList(connectedUser, newGuest, listOwner, listname):
    if (not connectedUser == listOwner):
        return listHandler.createError(403, "Forbidden: '" + connectedUser + "' is not the owner of this list")

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
    print("adding user ", username)
    return _tryInsert(sql, vals)

def createUser(username, password, userlevel):
    """Create a new user, username MUST be unique. Password is salted and hashed"""
    _hashPassword = newHashText(password)
    sql = "INSERT INTO users (username, password, userlevel) VALUES (%s, %s, %s)"
    vals = (username, _hashPassword, userlevel)
    print("adding user ", username)
    return _tryInsert(sql, vals)

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