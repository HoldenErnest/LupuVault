### notifications: #! todo

- **SAVE**: Server can create notifications whenever
- **GET**: AJAX to pull from the API `/api/notifications/<user>`

### warning messages:

- **SAVE/GET**: Send them directly to the templates
- `notification`
- `funMsg`

### lists: #! todo

- **SAVE**: AJAX on the 'save' button. POST full list to `/list/<owner>/<listname> /save?`
- !!! make sure the post is secure, so to doesnt wipe lists on extraneous visits
- include the `version` with the post. Only save if its newest; if not make sure to send back an error
- **GET**: When you visit `/` it will send along your last used list which is stored in a session.
- `session[lastListInfo] = { listname="", version="", listData=[{},{}] }`
- save this `list` and `version` to the session.
- on the JS side, parse the list from the session

OR use sockets to change things on demand

- **SAVE**: AJAX OR SOCKET on the 'save' button. (or maybe even on each change now), POST only the changed items.. using their UID to `/list/<owner>/<listname> /save?`
- !!! make sure the post is secure (not as much of an issue since its only 1 item being changed)
- push to all SOCKETS that have access to your list to update their lists accordingly
- **GET**: on `/` use jinja to get your last accessed list from the database. If any edits are made by other users it will be passed via sockets.
- !!! make sure to change the socket groupping if the user changes lists. (this is handled by '/')
- socketio will leave the last room it was in on refresh

Room Code: 
```
list = session["curList]
if (user has access to list)
session["groupCode"] = list.owner + list.listname
```

```
curList = {
    owner: str,
    listname: str,
    ...?
}

```