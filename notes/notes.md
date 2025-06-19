5/12/2025
configure apache wsgi:
 - create a python script `app.wsgi` which has a reference (sys.path.insert) to the main py script. `from mainscript import app`
 - ensure all paths are apache readable (755)
 - create a virtualHost site in `/etc/apache2/sites-available`:
    - configure this one to be on port 80 with an alias to the .wsgi script: `WSGIScriptAlias /list /project/path/LupuVault/app.wsgi`
    - create the environment `WSGIDaemonProcess lupuApp python-path=/<PATH>/LupuVault:/<PATH>/.venv/lib/python3.12/site-packages` `WSGIProcessGroup lupuApp`
    - make sure to make directories LupuVault and LupuVault/static have `Require all granted`
    - HTTPS works the same way but needs the cert/chain/key files included

5/13/2025
 - Configured MySQL
 - Configured a OneTime-use URL system for creating new users
    - as an admin you can generate a url with a onetime use key
    - the key is stored with additional info like new userlevel and expire time
    - when the url is used, remove the onetime key from the system.

5/14/2025
 - using porkbun: you can configure a dns record for any domain(including subdomains) to point to your server
 - new domain:
 - Edit the Apache Virtual Sites you want to use the domains as their ServerName
 - `$ sudo certbot --apache -d newdomain.com --force-renewal` - to add a new cert for this domain

 5/15/2025
 - made a website builder, which allows notifications to be passed in and jinja in the HTML will take care of it

 5/16/2025
 - restructuring the list interaction.
 - SOCKETIO sockets are encrypted when using https so thats good to use!
 - SocketIO sends small keepalive packets even when its not in use (this would be the cost of using this instead of ajax). Overall it looks fine
 - `pingTimeout`: 20000ms (20 sec)
 - `pingInterval`: 25000ms (25 sec)
 - SocketIO allows you to send to a single user with `emit('my event', my_data, to=user_sid)` (not useful in this case)
 - "rooms" can be created which users can join given the room code.

5/21/2025
 - Continuing to refactor to have sockets control the new changes
 - Only the new changes are sent to these list groups. When requested to open a new list, use js to fetch the list json.

5/22/2025
 - Making the full loop on the backend (list changes can be sent to the server, full lists are close to being able to get pulled from the API)

```
Python:
  775 total
TypeScript:
  639 total
HTML:
 223 total
CSS:
  702 total
```

5/23/2025
 - Setup the API calls, which completes the full loop (GET/SAVE lists).
 - !!! SQL connections get sad when its used by everyone at the same time.
    - instead, try `connection pooling` or a `query queue`

5/29/2025
 - Python is weird and runs all scripts instead of a normal "import", this makes it pretty annoying to refrence the main script since it will reset all app config stuff.
 - Instead: try to never circular import, call methods to pass the variables into the script

 6/17/2025
 - its been a minute but ive been chipping away at things.
 - most of the core functionality is in place including list socket communication.
 - I also added a timeout to my connection pooling and it works pretty well, doesnt matter how many concurent connections there are.
 - Added threading locks when requesting for images since `gis` is global which means requests and recieves can be interpreted out of sync.

6/18/2025
 - holy shit I thought I was finished with import hell. Why do I need to reload imported methods. (I guess it makes sense if python reloads everything on any import but man is the whole idea annoying)

6/19/2025
 - I should have guessed. Socketio doesnt work through the wsgi I had setup. Apaches `mod_wsgi` only manages HTTPS. WSS connections should be managed through another wsgi (essentially as a seperate server). [Deployment options](https://flask-socketio.readthedocs.io/en/latest/deployment.html#embedded-server)
 - gunicorn wouldnt work through apache which is kind of annoying or some other wsgi