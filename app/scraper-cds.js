const {
  getElemInnerText, getElemAttribute, addslashes,
} = require('./utils');
const { pool } = require('./db');
const cdsMap = require('../map');

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
  // let linkOpis = $(tds[8]).find('a'); NOT USED

  cdsID = getElemInnerText(cdsID);
  cdsName = getElemInnerText(cdsName);
  cdsLink = getElemAttribute('href')(cdsLink);
  cdsClass = getElemInnerText(cdsClass);
  // linkOpis = getElemAttribute('href')(linkOpis); NOT USED

  return {
    cdsUrlID: cdsID,
    cdsID: mapCdsId(cdsID) || '',
    cdsName,
    cdsLink,
    cdsClass: cdsClass || '',
  };
};

const insertCds = async (id, year, nome, classe, dbID) => {
  const queryStr = 'INSERT INTO corso_di_studi (unict_id, anno_accademico, nome, classe, id_dipartimento) VALUES (?,?,?,?,?)';
  try {
    return pool.query(queryStr, [id, year, nome, classe, dbID])
        .then(res => {
          console.log('##\t \033[36m\t' +  nome +'\033[0m');
          return res.insertId;
        });
  } catch (error) {
    console.error(error);
  }
};

/**
 * Converts a new alphanumerical cds ID into the corrisponding (if exists) numerical ID.
 * This is needed because the front-end needs the old cds ID in order to compare different years.
 * @param {String} cdsID 
 * @returns converted cds ID
 */
const mapCdsId = (cdsID) => {
  if (cdsMap.MAP[cdsID])
    return cdsMap.MAP[cdsID];
  return cdsID;
};

module.exports = {
  extractCdsStats,
  insertCds,
};
