# Holden Ernest - 5/14/2025
# Convert Lists to different formats and vice-versa to what you need. User has a CSV? no problem, we can put that in the database

import csv
import json
import io
from datetime import date, datetime, time

def csv_to_json(csvString, owner, listname):#! untested
    csv_file = io.StringIO(csvString)
    csv_reader = csv.DictReader(csv_file)
    data = list(csv_reader)

    for item in data:
        item["owner"] = owner
        item["listname"] = listname
        if ("image" in item):
            item["imageURL"] = item["image"]
            del item["image"]
    
    print(str(data))
    return data


def listSQLToDict(cursor, sqlData):
    """SQL list info to JSON object. [Reference Page](https://stackoverflow.com/questions/43796423/python-converting-mysql-query-result-to-json)"""
    row_headers=[x[0] for x in cursor.description]
    json_data=[]
    
    for result in sqlData:
        json_data.append(dict(zip(row_headers,result)))
    return json_data

def createError(code, message):
    error = {
        'error': message,
        'code': code
    }
    return error

def toDateTime(olddate):
    try:
        datetime_object = datetime.strptime(olddate, '%b %d %Y')
    except:
        return olddate

    # Format the datetime object into a MySQL DATETIME string
    return datetime_object.strftime('%Y-%m-%d %H:%M:%S')