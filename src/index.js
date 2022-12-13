import express from 'express';
import session from 'express-session';
import dotenv from 'dotenv';
import pg from 'pg';
import bodyParser from 'body-parser';
import passport from './auth.js';

import { getUsers, findByUsername } from './db.js';
import { router } from './router.js';

dotenv.config();
const app = express();

const {
  PORT: port = 3000,
  SESSION_SECRET: sessionSecret,
} = process.env;

if (!sessionSecret) {
  console.error('Add SESSION_SECRET to .env');
  process.exit(1);
}

app.use(session({
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  maxAge: 30 * 24 * 60 * 1000,
}));
app.use(passport.initialize());
app.use(passport.session());
console.log(process.env)

app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
)

const viewsPath = new URL('./views', import.meta.url).pathname;

app.use(express.static('public'));
app.use(express.static('src'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set('./views', viewsPath);
app.set('view engine', 'ejs');

app.use('/', router);

app.listen(port, () => {
  console.log(`App running on port ${port}.`)
})