
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

### allLists:

```
CREATE TABLE allLists (
owner varchar(32) NOT NULL,
listname varchar(64) NOT NULL,
lastwrite TIMESTAMP Default (CURRENT_TIMESTAMP),
PRIMARY KEY (owner, listname)
);
```

any time you save to the list, update the `lastwrite` time.

Lists will be shown in the following order:
 - All owned lists. Recency dec
 - All guest lists. Recency dec

### listData:

each users entry must be unique if its in the same 
```
CREATE TABLE listData (
itemID int UNSIGNED NOT NULL AUTO_INCREMENT,
owner varchar(32) NOT NULL,
listname varchar(64) NOT NULL,
title varchar(64) NOT NULL,
notes varchar(1000),
rating tinyint DEFAULT 0,
date datetime DEFAULT (CURRENT_DATE),
imageURL varchar(350),
PRIMARY KEY (itemID, owner, listname)
);
```

`Insert into listData (owner, listname, title) values ('jim','aList','listItem1');` - Create a new list item in /list/jim/aList

### guests:

The owner is a part of the list name, therefore it is always the combined primary key
```
CREATE TABLE guests (
owner varchar(32) NOT NULL,
listname varchar(64) NOT NULL,
guest varchar(32) NOT NULL,
perms ENUM('write', 'read') DEFAULT 'read',
PRIMARY KEY (owner, listname, guest)
);
```
`Insert into guests (owner, listname, guest) values ('jim','aList','dean');` - Give dean read permissions on /list/jim/aList