<p align="center">
  <img src="static/img/favicon-x256.png" />
</p>


# LupuVault
A redefined system for LupuVault. The Web App that holds list information defined by users. The app has an intuitive UI with extensive searching and sorting capability.

## :globe_with_meridians: How its going: [Lupu.app](https://lupu.app)

Login to [LupuVault](https://lupu.app/login) to view as a guest! Or Message an admin to give you a link to create a user.

 - username: `guest`
 - password: `guest`


## :hammer: Setup

- Clone Repository
- Ensure Python and pip are installed
- Create the Virtual Environment: `$ python3 -m venv .venv ` & `$ source .venv/bin/activate`
- Create a `.env` and initialize the following variables for your needs:
    - `FLASK_KEY=`
    - `IMG_API_KEY=`
    - `CSE_ID=`
    - `SERVER_HOST=`
    - `DB_USER=`
    - `DB_PASS=`
    - `DB_NAME=`
- Create the MySQL database (or refactor for other). Follow the [Database Diagram](./notes/databases.md) for information on the tables
- To serve via Apache:
    - Create and enable a new site
    - Include an `WSGIScriptAlias` for the app.wsgi
    - Ensure the directory ('LupuVault') and its subdirectory 'static' are granted access
    - Setup HTTPS by configuring the cert and key

## :red_car: Run

As Dev:

 - `$ ./devRun`

As Apache WSGI:

 - `$ sudo ./apacheRefresh`