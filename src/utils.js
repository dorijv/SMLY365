import moment from 'moment';
import bcrypt from 'bcrypt';

export function formatDate(date) {
  return moment(date).format('DD.MM.YYYY');
}
export function catchErrors(fn) {
  return (req, res, next) => fn(req, res, next).catch(next);
}

export async function comparePasswords(password, hash) {
  try {
    return await bcrypt.compare(password, hash);
  } catch (e) {
    console.error('Villa við samanburð lykilorða', e);
  }

  return false;
}