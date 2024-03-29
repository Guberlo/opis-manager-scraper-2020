const mysql = require('mysql');
const util = require('util');
const { addslashes, year } = require('./utils');

const { user, pass, host } = require('./config');

const config = {
  user: user,
  password: pass,
  host: host,
  database: 'opis_manager',
  connectionLimit: 20,
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

const closeConnection = () => {
  pool.end();
}

const getPrimaryID = (unictID, table) => {
  const queryStr = 'SELECT id FROM ?? WHERE unict_id = ? AND anno_accademico = ?';
  try {
    return pool.query(queryStr, [table, unictID, year]);
  } catch (error) {
    console.error(error);
  }
};

const getDeps = (table) => {
  const queryStr = 'SELECT id FROM ??';
  try {
    return pool.query(queryStr, table);
  } catch (error) {
    console.error(error);
  }
};

const getPrimaryIdIns = (codice, canale, docente) => {
  const queryStr = 'SELECT id FROM insegnamento WHERE codice_gomp = ? AND anno_accademico = ? AND canale = ? AND docente = ?';
  try {
    return pool.query(queryStr, [codice, year, canale, addslashes(docente)]);
  } catch (error) {
    console.error(error);
  }
};

// <!--JUST FOR DEBUGGING !-->
const getPrimaryIdInsTest = async (codice, canale, docente) => {
  const queryStr = 'SELECT id FROM insegnamento WHERE codice_gomp = ? AND anno_accademico = ? AND canale = ? AND docente = ?';
  try {
    return pool.query(queryStr, [codice, year, canale, addslashes(docente)]);
  } catch (error) {
    console.error(error);
  }
};

module.exports = {
  pool,
  getPrimaryID,
  getPrimaryIdIns,
  getPrimaryIdInsTest,
  getDeps,
  closeConnection,
};
