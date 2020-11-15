const { result } = require('lodash');
const mysql = require('mysql');
const util = require('util');

const year = '2020/2021';
const { user, pass } = require('./config');

const config = {
  user,
  password: pass,
  database: 'opis_manager',
  connectionLimit: 5,
  connectionTimeout: 10000,
  acquireTimeout: 10000,
  waitForConnections: true,
  queueLimit: 0,
};

const pool = mysql.createPool(config);

pool.getConnection((err, connection) => {
  if (err) throw err;

  if (connection) connection.release();
});

pool.query = util.promisify(pool.query).bind(pool);

const getPrimaryID = async (unictID, table) => {
  const queryStr = 'SELECT id FROM ?? WHERE unict_id = ? AND anno_accademico = ?';
  try {
    return await pool.query(queryStr, [table, unictID, year]);
  } catch (error) {
    console.error(error);
  }
};

module.exports = {
  pool,
  getPrimaryID,
};
