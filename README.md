# LupuVault
A redefined system for LupuVault. The Web App that holds list information defined by users. The app has an intuitive UI with extensive searching and sorting capability.

## :globe_with_meridians: How its going: [Lupu.app](https://lupu.app)

Login to [LupuVault](https://lupu.app/login) to view as a guest! Or Message an admin to give you a link to create a user.

 - username: `guest`
 - password: `guest`


## Setup

- Clone Repository
- Ensure Python and pip are installed
- Create the Virtual Environment: `$ python3 -m venv .venv ` & `$ source .venv/bin/activate`
- To serve via Apache:
    - Create and enable a new site
    - Include an `WSGIScriptAlias` for the app.wsgi
    - Ensure the directory ('LupuVault') and its subdirectory 'static' are granted access
    - Setup HTTPS by configuring the cert and key

## Run

As Dev:

 - `$ python3 main.py`

As Apache WSGI:

 - `$ sudo service apache2 restart`