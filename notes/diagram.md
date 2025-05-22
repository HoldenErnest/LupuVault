### notifications: #! todo

- **SAVE**: Server can create notifications whenever
- **GET**: AJAX to pull from the API `/api/notifications/<user>`

### warning messages:

- **SAVE/GET**: Send them directly to the templates
- `notification`
- `funMsg`

### lists: #! todo

- **SAVE**: SOCKET on the 'save' button. (or maybe even on each change now).
- !!! make sure the socket is secure (not as much of an issue since its only 1 item being changed)
- push to all SOCKETS that have access to your list to update their lists accordingly
- **GET**: on `/` the socket connection will make sure to join whatever curList you are apart of. If any edits are made by other users it will be passed via sockets.
- **SELECT**: If you select a different list a fetch will grab the json from the API. After that, a socket request will tell the server to change `curList` which will leave_room() before and join_room() after.
- !!! make sure to change the socket groupping if the user changes lists. (this is handled by '/')
- **NEWLIST**: literally just select a list like normal, the server will interpret the missing list as it needing to create it. (this way Saving is exactly the same)

socketio will leave the last room it was in on refresh

```
curList = {
    owner: str,
    listname: str,
    ...?
}

```