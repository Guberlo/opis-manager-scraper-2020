const _ = require('lodash');
const {
  getElemInnerText, getElemAttribute, addslashes,
} = require('./utils');
const { pool } = require('./db-try');

/**
 * Takes a <tr> containing info about a cds as an argument.
 * Returns a dict where all cds informations are stored.
 * @param {*} elem
 */
const extractCdsStats = async (elem, $) => {
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
    cdsID: _.isNull(cdsID) ? '' : cdsID,
    cdsName,
    cdsLink,
    cdsClass: _.isNull(cdsClass) ? '' : cdsClass,
  };
};

const insertCds = async (id, year, nome, classe, dbID) => {
  const queryStr = 'INSERT INTO corso_di_studi (unict_id, anno_accademico, nome, classe, id_dipartimento) VALUES (?,?,?,?,?)';
  try {
    return pool.query(queryStr, [addslashes(id), year, addslashes(nome), classe, dbID])
        .then(res => {
          console.log('##\t \033[36m\t' +  nome +'\033[0m');
          return res.insertId;
        });
  } catch (error) {
    console.error(error);
  }
};

module.exports = {
  extractCdsStats,
  insertCds,
};
