CREATE TABLE IF NOT EXISTS users (
 id serial primary key,
 username character varying(255) UNIQUE NOT NULL,
 password character varying(255) NOT NULL,
 admin int,
 smlycoins decimal
);