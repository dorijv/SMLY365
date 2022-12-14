import dotenv from 'dotenv';
import pg from 'pg';
import express from 'express';
import mysql from 'mysql';
const app = express()

dotenv.config();

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'username',
  password: 'password',
  database: 'database_name'
})

app.get('/', (req, res) => {
  // Read the contents of your SQL file
  const sql = fs.readFileSync('schema.sql').toString()

  // Execute the SQL query
  connection.query(sql, (error, results) => {
    if (error) throw error
    res.send('SQL file successfully executed')
  })
})

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

export async function createUser(username, password) {
  const q = 'INSERT INTO users (username, password) VALUES ($1, $2)';
  const values = [username, password];
  try {
    await query(q, values);
  } catch (e) {
    console.error('Error', e);
    return 'error';
  }
  console.info("User Created");
  findByUsername(username);
  return null;
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
