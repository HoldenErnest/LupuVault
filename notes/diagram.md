### notifications: #! todo

- **SAVE**: Server can create notifications whenever
- **GET**: AJAX to pull from the API `/api/notifications/<user>`

### warning messages: #! todo

Context: on failed login, or successful list save

- **SAVE/GET**: Send them directly to the templates

### lists: #! todo

- **SAVE**: AJAX on the 'save' button. POST full list to `/list/<owner>/<listname> /save?`
- !!! make sure the post is secure, so to doesnt wipe lists on extraneous visits
- include the `version` with the post. Only save if its newest; if not make sure to send back an error
- **GET**: When you visit `/` it will pull up your most recent list.
- save this `list` and `version` to the session.
- on the JS side, parse the list from the session