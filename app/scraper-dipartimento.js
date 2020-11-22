const { getElemInnerText, getElemAttribute } = require('./utils');
const { pool } = require('./db-try');

/**
 * Gets the id from the url
 * @param {*} url
 */
const parseID = (url) => {
  url = url.replace('cds_dip.php?', '').split('&');
  const id = url[0].replace('id=', '');

  return id;
};

/**
 * Takes a <tr> containing info about a department as an argument.
 * Creates a dict and pushes it onto an array where all deps are stored.
 * @param {*} elem
 */
const extractDipStats = async (elem, $) => {
  const tds = $(elem).find('td');
  const depLink = ($(tds[0]).find('a')); // Department's link
  let name = $(tds[0]); // Deparment's name
  let opisLink = ($(tds[7]).find('a')); // Department's opis link

  name = getElemInnerText(name);
  opisLink = getElemAttribute('href')(opisLink);
  const unictId = parseID(getElemAttribute('href')(depLink));

  return {
    name,
    unictId,
  };
};

const insertDip = async (id, anno, nome) => {
  const queryString = 'INSERT INTO dipartimenti (unict_id, anno_accademico, nome) VALUES (?, ?, ?)';
  try {
    pool.query(queryString, [id, anno, nome])
        .then(() => {
          //console.log("Done inserti on dipartimenti");
        });
  } catch (error) {
    console.error(error);
  }
};

module.exports = {
  extractDipStats,
  insertDip,
};
