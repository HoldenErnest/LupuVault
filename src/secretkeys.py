import secrets
import string
from datetime import datetime, timedelta


onetimeUserKeys = {} # a list made up of a key and userlevel pair to determine a newly created user


def hasOTUserKey(key):
    """Returns if the key exists for a user"""
    if (key not in onetimeUserKeys):
        return False
    
    keyInfo = onetimeUserKeys.get(key)
    if (keyInfo["expires"] > datetime.now()):
        return True
    else:
        onetimeUserKeys.pop(key) # remove the key if its expired
    return False

def useOTUserKey(key):
    """Returns the userlevel from the key and removes it if needed (AKA onetime-use key) """
    if (key not in onetimeUserKeys):
        return False
    
    keyInfo = onetimeUserKeys.get(key)
    if (keyInfo["expires"] > datetime.now()):
        if (keyInfo["userlevel"] == "admin"): # admin URLS are one time use only
            onetimeUserKeys.pop(key)
        return keyInfo
    else:
        onetimeUserKeys.pop(key)
    return False



def newOTUserKey(userlevel): #TODO: get current time + 1 hour, to limit the key lifespan
    """Create a new onetime use key for a new user"""
    key = _generate_random_key(64)
    expireTime = datetime.now() + timedelta(hours=1)
    onetimeUserKeys[key] = {"userlevel": userlevel, "expires": expireTime}
    return key

def _generate_random_key(length=32):
    """Generates a random key of specified length using characters from ascii letters and digits."""
    alphabet = string.ascii_letters + string.digits
    return ''.join(secrets.choice(alphabet) for i in range(length))

def _generate_numeric_key(length=6):
    """Generates a random key of specified length using only digits."""
    alphabet = string.digits
    return ''.join(secrets.choice(alphabet) for i in range(length))