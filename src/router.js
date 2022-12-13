import express from 'express';
import { catchErrors } from './utils.js';
export const router = express.Router();
import passport, { ensureLoggedIn } from './auth.js';

router.use(express.static('public'));

async function login(req, res) {
  if (req.isAuthenticated()) {
    return res.redirect('/admin');
  }

  let message = '';

  if (req.session.messages && req.session.messages.length > 0) {
    message = req.session.messages.join(', ');
    req.session.messages = [];
  }

  return res.render('login', { title: 'Innskráning', message });
}

router.get('/login', catchErrors(login));