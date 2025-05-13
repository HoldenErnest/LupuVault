
### users:

Stores the password for each user, to make sure theyre valid
```
CREATE TABLE users (
username varchar(32) PRIMARY KEY,
password char(100) NOT NULL,
userlevel ENUM("guest","normal","admin","owner") DEFAULT "normal"
);
```

UserLevels:

 - 3: guest users, read only
 - 2: normal users
 - 1: admin, can give out links for new normal users
 - 0: owner, can give out admin links and manager user settings

### listData:

each users entry must be unique if its in the same 
```
CREATE TABLE listData (
owner varchar(32) NOT NULL,
listname varchar(64) NOT NULL,
title varchar(64) NOT NULL,
notes varchar(1000),
rating tinyint DEFAULT 0,
date datetime DEFAULT (CURRENT_DATE),
PRIMARY KEY (owner, listname, title)
);
```

### guests:

The owner is a part of the list name, therefore it is always the combined primary key
```
CREATE TABLE guests (
owner varchar(32) NOT NULL,
listname varchar(64) NOT NULL,
guest varchar(32) NOT NULL
perms ENUM('write', 'read') DEFUALT "read"
PRIMARY KEY (owner, listname)
);
```