const _ = require('lodash');
const {
  getElemInnerText, getElemAttribute, isTextEmpty, addslashes,
} = require('./utils');
const { pool } = require('./db-try');

const year = '2020/2021';

// <--! TODO ! --> IMPLEMENT METHOD TO JOIN MULTIPLE PIECES OF THE SAME TEACHING

/**
 * Takes a <tr> containing info about a taching as an argument.
 * Returns a dict where all info are stored.
 * @param {*} elem
 */
const extractInsStats = (elem) => ($) => {
  // If the <tr> contains all the needed informations about teaching
  const tds = $(elem).find('td');
  if (!isTextEmpty(getElemInnerText)($(tds[0]))) {
    const insID = $(tds[1]);
    const insName = $(tds[2]);
    const insCanale = $(tds[3]);
    const insCodModulo = $(tds[4]);
    // const ins_modulo = $(tds[5]);
    const insAssegnazione = $(tds[6]);
    const insSSD = $(tds[7]);
    const insAnno = $(tds[8]);
    const insSemestre = $(tds[9]);
    const insCfu = $(tds[10]);
    const insDocente = $(tds[11]);
    const linkOpis = $(tds[15]).find('a');

    return {
      insID: getElemInnerText(insID),
      insName: getElemInnerText(insName),
      insCanale: (_.isNull(getElemInnerText(insCanale)) ? 'no' : getElemInnerText(insCanale)),
      // ins_modulo: (_.isNull(getElemInnerText(ins_modulo)) ? '0' : getElemInnerText(insCanale)),
      insCodModulo: (_.isNull(getElemInnerText(insCodModulo)) ? '0' : getElemInnerText(insCodModulo)),
      insAssegnazione: getElemInnerText(insAssegnazione),
      insSSD: getElemInnerText(insSSD),
      insAnno: getElemInnerText(insAnno),
      insSemestre: getElemInnerText(insSemestre),
      insCfu: getElemInnerText(insCfu),
      insDocente: getElemInnerText(insDocente),
      linkOpis: getElemAttribute('href')(linkOpis),
    };
    // Missing tipo
  }
  // If the <tr> is without some attributes (Ex. teaching with multiple professors, only one td will contain all informations, the others will contain just some different infos)

  const parent = $(tds).parent();
  let prevTd = $(parent).prev();

  while (isTextEmpty(getElemInnerText)($(prevTd[0]))) {
    prevTd = $(prevTd).prev();
  }
  prevTd = $(prevTd).find('td');
  console.log('********************************************');

  const insID = $(prevTd[1]);
  const insName = $(prevTd[2]);
  const insCanale = $(prevTd[3]);
  const insCodModulo = $(prevTd[4]);
  // const ins_modulo = $(prevTd[5]);
  const insAssegnazione = $(tds[1]);
  const insSSD = $(tds[2]);
  const insAnno = $(tds[3]);
  const insSemestre = $(tds[4]);
  const insCfu = $(tds[5]);
  const insDocente = $(tds[6]);

  return {
    insID: getElemInnerText(insID),
    insName: getElemInnerText(insName),
    insCanale: (_.isNull(getElemInnerText(insCanale)) ? 'no' : getElemInnerText(insCanale)),
    // ins_modulo: (_.isNull(getElemInnerText(ins_modulo)) ? '0' : getElemInnerText(insCanale)),
    insCodModulo: (_.isNull(getElemInnerText(insCodModulo)) ? '0' : getElemInnerText(insCodModulo)),
    insAssegnazione: getElemInnerText(insAssegnazione),
    insSSD: getElemInnerText(insSSD),
    insAnno: getElemInnerText(insAnno),
    insSemestre: getElemInnerText(insSemestre),
    insCfu: getElemInnerText(insCfu),
    insDocente: getElemInnerText(insDocente),
  };
};

const insInsegnamento = (obj, dbID) => {
  const queryStr = 'INSERT INTO insegnamento (codice_gomp, nome, canale, id_modulo, ssd, anno, semestre, cfu, docente, assegn, id_cds, anno_accademico) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)';

  try {
    pool.query(queryStr, [obj.insID,
      addslashes(obj.insName),
      addslashes(obj.insCanale),
      obj.cod_modulo,
      addslashes(obj.insSSD),
      addslashes(obj.insAnno),
      addslashes(obj.insSemestre),
      addslashes(obj.insCfu),
      addslashes(obj.insDocente),
      addslashes(obj.insAssegnazione),
      dbID,
      year], (err, results, fields) => {
      if (err) throw err;
    }).then(() => {
      console.log('Done insert ins.');
    });
  } catch (error) {
    console.error(error);
  }
};

module.exports = {
  extractInsStats,
  insInsegnamento,
};
