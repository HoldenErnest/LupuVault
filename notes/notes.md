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