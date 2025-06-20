<p align="center">
  <img src="static/img/favicon-x256.png" />
</p>


# LupuVault
A redefined system for LupuVault. The Web App that holds list information defined by users. The app has an intuitive UI with extensive searching and sorting capability.

 - Apache + Flask WSGI for maintainable hosting capabilities.
 - MySQL + RegEx for quick loading, searching, and sorting.
 - Secure Web Sockets + Restful APIs for responsive loading and communication.
 - Typescript compilation for a more robust frontend.

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
- To serve via Apache(optional):
    - Create a linux service pointing to `app.run`
    - Create and enable a new site
        - Setup a reverse proxy pointing to the correct port for the created service.
        - Handle both `ws://localhost/socket.io/` and `http://localhost/` conditions
    - Ensure the directory ('LupuVault') and its subdirectory 'static' are granted access
    - Setup Secure Sockets by configuring the cert and key

## :red_car: Run

As Dev:

 - `$ ./dev.run`

As Apache WSGI:

 - `$ sudo ./apacheRefresh`