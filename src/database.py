# Holden Ernest - 5/13/2025
# This module is used for handling anything that directly talks with the database acting as an interface

import os
import hashlib
import uuid
import mysql.connector

from dotenv import load_dotenv
load_dotenv()

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

def getList(username, listname):
    sql = "SELECT * FROM lists WHERE username = %s AND listname = %s limit 1"
    vals = (username,listname)
    res = _trySelect(sql, vals)
    if (res):
        return res

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