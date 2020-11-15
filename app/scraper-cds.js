const _ = require('lodash');
const {
  getElemInnerText, getElemAttribute, addslashes,
} = require('./utils');
const { pool } = require('./db-try');

const year = '2020/2021';

/**
 * Takes a <tr> containing info about a cds as an argument.
 * Returns a dict where all cds informations are stored.
 * @param {*} elem
 */
const extractCdsStats = (elem, $) => {
  const tds = $(elem).find('td');

  let cdsID = $(tds[0]);
  let cdsName = $(tds[1]);
  let cdsLink = $(tds[1]).find('a');
  let cdsClass = $(tds[2]);
  let linkOpis = $(tds[8]).find('a');

  cdsID = getElemInnerText(cdsID);
  cdsName = getElemInnerText(cdsName);
  cdsLink = getElemAttribute('href')(cdsLink);
  cdsClass = getElemInnerText(cdsClass);
  linkOpis = getElemAttribute('href')(linkOpis);

  return {
    cdsID: _.isNull(cdsID) ? '0' : cdsID,
    cdsName,
    cdsLink,
    cdsClass: _.isNull(cdsClass) ? 'no' : cdsID,
  };
};

const insCds = (id, nome, classe, dbID) => {
  const queryStr = 'INSERT INTO corso_di_studi (unict_id, anno_accademico, nome, classe, id_dipartimento) VALUES (?,?,?,?,?)';

  try {
    pool.query(queryStr, [addslashes(id), year, addslashes(nome), addslashes(classe), dbID], (err, results, fields) => {
      if (err) throw err;
    }).then(() => {
      console.log('Done insert cds.');
    });
  } catch (error) {
    console.error(error);
  }
};

module.exports = {
  extractCdsStats,
  insCds,
};
