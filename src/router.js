import express from 'express';
import { catchErrors } from './utils.js';
export const router = express.Router();
import passport, { ensureLoggedIn } from './auth.js';
import { findByUsername, createUser, getUsers} from './db.js';
import { createPoolCluster } from 'mysql';
router.use(express.static('public'));

async function login(req, res) {
  if (req.isAuthenticated()) {
    return res.redirect('/isauth');
  }

  let message = '';

  if (req.session.messages && req.session.messages.length > 0) {
    message = req.session.messages.join(', ');
    req.session.messages = [];
  }

  return res.render('login', { title: 'Innskráning', message });
}

router.get('/login', catchErrors(login));

router.get('/signup',(req, res) => {
  let message = '';
  res.render('signup', { title: 'Signup', message  });
});

router.post('/signup',(req, res) => {
    const {username, password} = req.body
    createUser(username, password);
    res.redirect('/login');
  },
);
router.post('/login',(req, res) => {
    const {username, password} = req.body
    if(username == 'test' && password == 'test123') {
      return res.redirect('/sucess');
    }else{
     return res.redirect('/tryagain');
    }
  },
);

