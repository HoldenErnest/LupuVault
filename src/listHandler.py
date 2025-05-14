# Holden Ernest - 5/14/2025
# Convert Lists to different formats and vice-versa to what you need. User has a CSV? no problem, we can put that in the database

import csv
import json

def csv_to_json(csv_filepath, json_filepath):#! untested
    data = []
    with open(csv_filepath, 'r') as csvfile:
        csv_reader = csv.DictReader(csvfile)
        for row in csv_reader:
            data.append(row)

    with open(json_filepath, 'w') as jsonfile:
        json.dump(data, jsonfile, indent=4)


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