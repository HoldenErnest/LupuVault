# Holden Ernest - 5/15/2025
# Handles all Interfaces for resources

import json

notifications = {"key": []}

def getNotifications(user):
    return json.dumps(notifications.pop(user, []))

def saveNotification(user, status, message):
    notifications[user].append(
        {"status": status, "message": message}
    )