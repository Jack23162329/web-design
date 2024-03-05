drop table if exists users;
drop table if exists loggedinusers;

create table loggedinusers(
    email text,
    token text
);

create table users(
    email text PRIMARY KEY,
    password text,
    firstname text,
    familyname text,
    gender text,
    city text,
    country text,
    messages text
);

