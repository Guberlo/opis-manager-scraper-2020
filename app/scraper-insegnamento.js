const _ = require('lodash');
const { getElemInnerText, getElemAttribute, isSpace, addslashes, year} = require('./utils');
const { pool } = require('./db');

/**
 * Takes a <tr> containing info about a teaching as an argument.
 * Returns a dict where all info are stored.
 * @param {*} elem
 */
const extractInsStats = async (elem, $) => {
  // If the <tr> contains all the needed informations about teaching
  const tds = $(elem).find('td');
  
  if (!isSpace( $(tds) )) {
    const insID = $(tds[1]);
    const insName = $(tds[2]);
    const insCanale = $(tds[3]);
    const insCodModulo = $(tds[4]);
    // const ins_modulo = $(tds[5]);
    const insAssegnazione = $(tds[6]);
    const insTipo = $(tds[7]);
    const insSSD = $(tds[8]);
    const insAnno = $(tds[9]);
    const insSemestre = $(tds[10]);
    const insCfu = $(tds[11]);
    const insDocente = $(tds[12]);
    const s1 = $(tds[13]);
    const s3 = $(tds[14]);
    const linkOpis = $(tds[16]).find('a');

    return {
      insID: getElemInnerText(insID),
      insName: getElemInnerText(insName),
      insCanale: getElemInnerText(insCanale) || 'no',
      // ins_modulo: (_.isNull(getElemInnerText(ins_modulo)) ? '0' : getElemInnerText(insCanale)),
      insCodModulo: getElemInnerText(insCodModulo) || '0',
      insAssegnazione: getElemInnerText(insAssegnazione),
      insTipo: getElemInnerText(insTipo) || 'no',
      insSSD: getElemInnerText(insSSD) || 'no',
      insAnno: getElemInnerText(insAnno),
      insSemestre: getElemInnerText(insSemestre) || 'non previsto',
      insCfu: getElemInnerText(insCfu),
      insDocente: getElemInnerText(insDocente) || 'non assegnato',
      s1: getElemInnerText(s1),
      s3: getElemInnerText(s3),
      linkOpis: getElemAttribute('href')(linkOpis) || 'Scheda non autorizzata alla pubblicazione',
    };
  }
  // Some rows (the case in which many professors are assigned to that teaching) are half-filled, containing just some information leaving the rest blank (they are the same as the previous).
  // Hence we look for the first fully-filled row before the one we are scraping, taking this information in order to save it to the database.

  const parent = $(tds).parent();
  let prevTd = $(parent).prev();

  while (isSpace( $(prevTd).find('td') )) {
    prevTd = $(prevTd).prev();
  }

  prevTd = $(prevTd).find('td');

  const insID = $(prevTd[1]);
  const insName = $(prevTd[2]);
  const insCanale = $(prevTd[3]);
  const insCodModulo = $(prevTd[4]);
  // const ins_modulo = $(prevTd[5]);
  const insAssegnazione = $(tds[1]);
  const insTipo = $(tds[2]);
  const insSSD = $(tds[3]);
  const insAnno = $(tds[4]);
  const insSemestre = $(tds[5]);
  const insCfu = $(tds[6]);
  const insDocente = $(tds[7]);
  const s1 = $(prevTd[13]);
  const s3 = $(prevTd[14]);
  const linkOpis = $(prevTd[16]).find('a');
  
  return {
    insID: getElemInnerText(insID),
    insName: getElemInnerText(insName),
    insCanale: getElemInnerText(insCanale) || 'no',
    // ins_modulo: (_.isNull(getElemInnerText(ins_modulo)) ? '0' : getElemInnerText(insCanale)),
    insCodModulo: getElemInnerText(insCodModulo) || '0',
    insAssegnazione: getElemInnerText(insAssegnazione),
    insTipo: getElemInnerText(insTipo) || 'no',
    insSSD: getElemInnerText(insSSD),
    insAnno: getElemInnerText(insAnno),
    insSemestre: getElemInnerText(insSemestre) || 'non previsto',
    insCfu: getElemInnerText(insCfu),
    insDocente: getElemInnerText(insDocente) || 'non assegnato',
    s1: getElemInnerText(s1),
    s3: getElemInnerText(s3),
    linkOpis: getElemAttribute('href')(linkOpis) || 'Scheda non autorizzata alla pubblicazione',
  };
};

const insertInsegnamento = async (obj, dbID) => {
  const queryStr = 'INSERT INTO insegnamento (codice_gomp, nome, canale, id_modulo, tipo, ssd, anno, semestre, cfu, docente, assegn, id_cds, anno_accademico) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)';

  try {
    if (!obj.insAnno)
      console.warn(JSON.stringify(obj), "is null");
      
    return pool.query(queryStr, [obj.insID,
                obj.insName,
                obj.insCanale,
                obj.insCodModulo,
                obj.insTipo,
                obj.insSSD,
                obj.insAnno,
                obj.insSemestre,
                obj.insCfu,
                obj.insDocente,
                obj.insAssegnazione,
                dbID,
                year]).then(res => {
                  console.log('### \t\t \033[35m\t' +  obj.insName +'\033[0m');
                  return res.insertId;
              });
  } catch (error) {
    console.error(error);
  }
};

module.exports = {
  extractInsStats,
  insertInsegnamento,
};
