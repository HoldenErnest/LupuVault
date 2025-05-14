# Holden Ernest - 5/13/2025

import database
import json

def getListJSON(username, listname):
    """Returns a parsed list in the form of a dictionary, retrieved from the database"""
    
    res = database.getList()
    
    listData = {
        "title": "",
        "notes": "",
        "rating": 1,
        "tags": ["", ""],
        "date": "Date",
        "imageURL": ""
    }
    return listData