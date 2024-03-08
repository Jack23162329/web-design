create table loggedinusers(
    email text PRIMARY KEY,
    token text
);

create table users(
    email text PRIMARY KEY,
    password text,
    firstname text,
    familyname text,
    gender text,
    city text,
    country text
);

CREATE TABLE messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    token TEXT,
    email TEXT,
    message TEXT
);
