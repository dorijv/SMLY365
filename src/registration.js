import express from 'express';
import xss from 'xss';
import { body, validationResult } from 'express-validator';
import { createUser } from './db.js';
import { catchErrors } from './utils.js';

const errorMessages = {};
const errorParameters = {};

export const validations = [
  body('username')
    .isLength({ min: 1 })
    .withMessage('Username cannot be empty!'),
  body('username')
    .isLength({ max: 12 })
    .withMessage('Username cannot be longer than 12 characters!'),
  body('password')
    .isLength({ min: 1 })
    .withMessage('Password cannot be empty!'),
  body('password')
    .isLength({ max: 24 })
    .withMessage('Password cannot be longer than 24 characters!')
];

function sanitizeXss(fieldName) {
  return (req, res, next) => {
    if (!req.body) {
      next();
    }
    const field = req.body[fieldName];
    if (field) {
      req.body[fieldName] = xss(field);
    }
    next();
  };
}

export const sanitizations = [
  sanitizeXss('username'),
  sanitizeXss('password'),
];

export async function showErrors(req, res, next) {
  const data = {
    title: 'Create a new account!',
    errorMessages,
    errorParameters,
    errors: [],
    bool: 0
  };

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    data.errorMessages = errors.array().map((i) => i.msg);
    data.errorParameters = errors.array().map((x) => x.param);
    data.errors = errors.array();
    data.bool = 1;
    return res.render('signup', { data, title: data.title });
  }

  return next();
}

export async function createNewUser(req, res) {
	const {
    	username,
    	password
    } = req.body;

    if(await createUser({username, password}) === 'error') {
    	res.render('error', {error: false, title: null})
    }

    return res.redirect('/');

}