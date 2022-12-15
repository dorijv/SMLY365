import express from 'express';
import { catchErrors } from './utils.js';
export const router = express.Router();
import passport, { ensureLoggedIn } from './auth.js';
import { createNewUser, validations, sanitizations, showErrors } from './registration.js';
import { updateBalance } from './db.js';

router.use(express.static('public'));

async function login(req, res) {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }

  let message = '';

  if (req.session.messages && req.session.messages.length > 0) {
    message = req.session.messages.join(', ');
    req.session.messages = [];
  }

  return res.render('login', { title: 'Sign in to your account', message });
}

async function indexPage(req, res) {

  const data = {}
  const errors = {}

  return res.render('index', { data, errors });
}

async function signup(req, res) {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }

  const errorMessages = {};
  const errorParameters = {};

  const data = {
    title: 'Create a new account!',
    errorMessages,
    errorParameters,
    errors: []
  };

  return res.render('signup', { title: 'Create a new account', data });
}

async function bet(req, res) {
  let number_generated = Math.round(Math.random() * 10);
  let error = '';

  const data = {
    number_generated,
    bet_amount: req.body.bet_amount,
    button_pressed: req.body.button_pressed
  }

  const errors = {
    error
  }

  let {
    bet_amount
  } = req.body;

  const {
    username,
    smlycoins
  } = req.user;

  if(bet_amount > parseInt(smlycoins)) {
    errors.error = 'You cannot bet more than you have!';
    return res.render('index', { data, errors });
  }

  if( data.button_pressed == "Less than 5" && number_generated < 5) {
    // Notandi vann
    console.info('user won');
  }
  else if ( data.button_pressed == "More than 5" && number_generated > 5) {
    // Notandi vann
    console.info('user won');
  } else {
    // Notandi tapar!
    console.info('casino won');
    bet_amount = -bet_amount;
  }

  await updateBalance({ username, bet_amount })

  return res.render('index', { data, errors } );
}

async function funds(req, res) {
  return res.render('funds');
}


router.use((req, res, next) => {
  res.locals.user = req.isAuthenticated() ? req.user : null;
  next();
});

router.get('/', ensureLoggedIn, catchErrors(indexPage));
router.post('/', ensureLoggedIn, catchErrors(bet));
router.get('/login', catchErrors(login));
router.get('/signup', catchErrors(signup));
router.post('/signup', validations, showErrors, sanitizations, catchErrors(createNewUser));
router.get('/addfunds', ensureLoggedIn, catchErrors(funds));


router.get('/logout', function(req, res, next) {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

router.post(
  '/login',
  passport.authenticate('local', {
    failureMessage: 'Incorrect username or password!',
    failureRedirect: '/login'
  }),

  (req, res) => {
    res.redirect('/');
  }
);