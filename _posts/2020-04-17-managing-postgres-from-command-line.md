---
layout: post
title: "Managing Postgres from Command Line"
category: 'Postgresql'
description: "Useful commands for Postgres."
image: postgresql.jpg
---

# Accessing the command line

```
sudo su postgres
psql
```

# List
```
# List all databases
\l
# List all users
\du
```

# Dropping a role
```
DROP OWNED BY role;
DROP ROLE role;
```

# Dropping a database
```
DROP DATABASE db_name;
```
