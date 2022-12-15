import dotenv from 'dotenv';
import pg from 'pg';
import bcrypt from 'bcrypt'

dotenv.config();

const {
  DATABASE_URL: connectionString,
  NODE_ENV: nodeEnv = 'development',
} = process.env;


if (!connectionString) {
  console.error('Vantar DATABASE_URL');
  process.exit(1);
}

const ssl = nodeEnv !== 'development' ? { rejectUnauthorized: false } : false;

const pool = new pg.Pool({ connectionString, ssl });

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export async function getUsers(request, response) {
  pool.query('SELECT * FROM users ORDER BY id ASC', (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows)
  })
}

export async function query(q, v = []) {
  const client = await pool.connect();

  try {
    const result = await client.query(q, v);
    return result.rows;
  } catch (e) {
    throw new Error(e);
  } finally {
    client.release();
  }
}

export async function findById(id) {
  const q = 'SELECT * FROM users WHERE id = $1';

  try {
    const result = await query(q, [id]);

    if (result.length === 1) {
      return result[0];
    }
  } catch (e) {
    console.error('Gat ekki fundið notanda eftir id');
  }

  return null;
}

export async function findByUsername(username) {
  const q = 'SELECT * FROM users WHERE username = $1';

  try {
    const result = await query(q, [username]);
    return result[0];
  } catch (e) {
    console.error('Gat ekki fundið notanda eftir notendnafni');
    return null;
  }
}

export async function createUser(data) {
  const q = 'INSERT INTO users(username, password, admin, smlycoins) VALUES ($1, $2, $3, $4)';
  const values = [data.username, bcrypt.hashSync(data.password, 10), 0, 0];

  try {
    await query(q, values);
  } catch (e) {
    console.error('Error', e);
    return 'error';
  }

  return null;
}

export async function updateBalance(data) {
  const q = 'UPDATE USERS SET smlycoins = smlycoins + $1 WHERE username like $2';
  const values = [data.bet_amount, data.username];

  console.info(values);

  try {
    await query(q, values);
  } catch (e) {
    console.error('Error', e);
    return 'error'
  }

  return null;
}
