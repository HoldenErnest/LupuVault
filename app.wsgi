#!/usr/bin/python3

### This is for Apache to deploy this as a website

import sys
import os

#sys.path.insert(0,"/home/lupu/LupuVault/.venv/lib/python3.12/site-packages") # import the 
sys.path.insert(0, '/home/lupu/LupuVault')

from main import app as application  # Update according to your app structure