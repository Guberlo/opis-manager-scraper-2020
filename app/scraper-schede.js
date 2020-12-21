const _ = require('lodash');
const { getElemInnerText, getElemAttribute, addslashes } = require('./utils');
const { pool } = require('./db-try');

const AGE_KEYS = ['18-19', '20-21', '22-23', '24-25', '26-27', '28-29', '30 e oltre'];
const STUDY_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
const TRAVEL_KEYS = ['fino 0.5', '0.5-1', '1-2', '2-3', 'oltre 3'];
const TOTAL_STUDY_KEYS = ['fino a 50', '51-100', '101-150', '151-200', '201-250', '251-300', '301-350', 'oltre 350'];
const ATTENDING_STUD_KEYS = ['fino 25', '26-50', '51-75', '76-100', '101-151', '151-200', 'oltre 200'];
const ENROLLMENT_YEAR_KEYS = ['1', '2', '3', '4', '5', '6', 'FC'];
const GRAPH_TYPE = {
  eta: 'eta',
  ore_giornaliere: 'o',
  tempo_univ: 'tmp',
  ore_esame: 'ore',
  freq: 'stud',
  anno: 'iscr',
};

const YEAR = '2020/2021';
let i = 0;

/**
 * Filter graph's link to return the number of answer per category (Ex. eta1=22...)
 * @param {*} url
 */
const filterGraph = (url, type, key) => {
  url = url.replace(`graph.php?tipo=${type}&`, '');
  url = url.replace(new RegExp(key, 'g'), '');
  let urlStats = url.split('&');
  urlStats = urlStats.map((x) => x.replace(new RegExp('^[0-9]+='), ''));

  return urlStats;
};

/**
 * Take the values from filtergraph and create a key-value dict
 * With graph labels as key (Ex. fino 50:22)
 * @param {*} keys
 */
const UrlToDictionary = (keys, elements) => {
  const dict = elements.reduce((result, field, index) => {
    result[keys[index]] = field;
    return result;
  }, {});

  return dict;
};

/**
 * Extract url, type of graph and also get key (Ex. ore=o, tempo=tmp_univ...)
 * @param {*} elem
 */
const getStatsFromSelector = (elem) => {
  if (elem) {
    const src = getElemAttribute('src')(elem);
    const type = src.substring(15, src.indexOf('&'));
    const key = GRAPH_TYPE[type];
    const rawStats = filterGraph(src, type, key);

    return rawStats;
  }
  console.log("<--Elem is null-->" + elem);
  return null;
};

/**
 * Finds the table containing the number
 * Of students who gave a response and scans it 
 * @param {*} $ 
 */
const extractSchedeStats = ($) => {
  return Promise.all($('b').map( (i, el) => {
    if ($(el).text().indexOf('Riepilogo') > -1) {
      const trs = $(el).find('tr');

      const schedeF = $(trs[1]).find('td');
      const schedeNF = $(trs[2]).find('td');
      
      return {
        numSchedeF: getElemInnerText($(schedeF[1])),
        fuoricorsoF: getElemInnerText($(schedeF[2])),
        numSchedeNF: getElemInnerText($(schedeNF[1])),
        fuoricorsoNF: getElemInnerText($(schedeNF[2])),
      }
    }
  }).get());
};

/**
 * Extract from <tr> containing suggestions an returns an array
 * @param {*} elem
 */
const extractFromSuggestion = (elem, $) => {
  let suggestions = [];

  const tds = $(elem).find('td');
  const suggestion = getElemInnerText($(tds[0]));
  const percentage = getElemInnerText($(tds[1]));

  suggestions.push(suggestion, percentage);
  suggestions = suggestions.map((x) => (_.isNull(x) ? '0' : x));

  return JSON.stringify(suggestions);
};

/**
   * Extract data from each graph an push it onto an array containing dicts
   * @param {*} $
   */
const extractFromGraphs = ($) => {
  const graphsSelector = getGraphsSelector($);

  const ageGraphSel = $(graphsSelector[0]);
  const ageStats = getStatsFromSelector(ageGraphSel);
  const ageDict = UrlToDictionary(AGE_KEYS, ageStats);

  const studySel = $(graphsSelector[1]);
  const studyStats = getStatsFromSelector(studySel);
  const studyDict = UrlToDictionary(STUDY_KEYS, studyStats);

  const meanTravelSel = $(graphsSelector[2]);
  const meanTravelStats = getStatsFromSelector(meanTravelSel);
  const meanTravelDict = UrlToDictionary(TRAVEL_KEYS, meanTravelStats);

  const totalStudySel = $(graphsSelector[3]);
  const totalStudyStats = getStatsFromSelector(totalStudySel);
  const totalStudyDict = UrlToDictionary(TOTAL_STUDY_KEYS, totalStudyStats);

  const attendingStudSel = $(graphsSelector[4]);
  const attendingStudStats = getStatsFromSelector(attendingStudSel);
  const attendingStudDict = UrlToDictionary(ATTENDING_STUD_KEYS, attendingStudStats);

  const enrollmentYearSel = $(graphsSelector[5]);
  const enrollmentYearStats = getStatsFromSelector(enrollmentYearSel);
  const enrollmentYearDict = UrlToDictionary(ENROLLMENT_YEAR_KEYS, enrollmentYearStats);

  return {
    eta: JSON.stringify(ageDict),
    studio_gg: JSON.stringify(studyDict),
    ragg_uni: JSON.stringify(meanTravelDict),
    studio_tot: JSON.stringify(totalStudyDict),
    n_studenti: JSON.stringify(attendingStudDict),
    anno_iscr: JSON.stringify(enrollmentYearDict),
  }
};

/**
   * Extract data from <tr> containing questions and returns an array
   * @param {*} elem
   */
const extractFromQuestion = (elem, $) => {
  let questions = [];

  const tds = $(elem).find('td');
  const decisamenteNo = getElemInnerText($(tds[1]));
  const noCheSi = getElemInnerText($(tds[2]));
  const siCheNo = getElemInnerText($(tds[3]));
  const si = getElemInnerText($(tds[4]));
  const nonSo = getElemInnerText($(tds[5]));

  questions.push(decisamenteNo, noCheSi, siCheNo, si, nonSo);

  questions = questions.map((x) => (_.isNull(x) ? '0' : x));

  return JSON.stringify(questions);

  // returns an array
};

/**
   * Extract from <tr> containing reasons an returns an array
   * @param {*} elem
   */
const extractFromReason = (elem, $) => {
  let reasons = [];

  const tds = $(elem).find('td');
  const reason = getElemInnerText($(tds[0]));
  const percentage = getElemInnerText($(tds[1]));

  reasons.push(reason, percentage);
  reasons = reasons.map((x) => (_.isNull(x) ? '0' : x));

  return JSON.stringify(reasons);
  // returns an array
};

// <!----- REFACTOR THIS IS PURE SHIT -------!>
/**
   * Extract data from tables and push it onto an array
   * @param {*} $
   */
const extractFromTable = async ($) => {
  const questions = await getQuestionsData($);

  const reasons = await getReasonsData($);

  const suggestions_f = await getSuggestionsData($, 1);

  const suggestions_nf = await getSuggestionsData($, 3);
  
  return{
    domande: JSON.stringify(questions.splice(0,12)),
    domande_nf: JSON.stringify(questions),
    motivi: JSON.stringify(reasons),
    suggerimenti_f: JSON.stringify(suggestions_f),
    suggerimenti_nf: JSON.stringify(suggestions_nf),
  }
};
// <!----- REFACTOR THIS IS PURE SHIT -------!>

const getQuestionsData = ($) => {
  try {
    return Promise.all( $('b').map((i, el) => {
      if ($(el).text().indexOf('SCHEDE') > -1) {
        const table = $(el).next().next();
  
        if ($(el).text().indexOf('valutaz. studenti') > -1) {
          return table.find('tr:not(:first-child)').map((i, el) => {
            return extractFromQuestion(el, $);
          }).get();
  
        }
      }
      
    }).get());
  } catch(e) {
    console.error(e);
  }
};

const getReasonsData = ($) => {
  try {
    return Promise.all( $('b').map((i, el) => {
      if ($(el).text().indexOf('SCHEDE') > -1) {
        const table = $(el).next().next();
  
        if ($(el).text().indexOf('motivo') > -1) {
          return table.find('tr:not(:first-child)').map((i, el) => {
            return extractFromReason(el, $);
          }).get();
  
        }
      }
      
    }).get());
  } catch(e) {
    console.error(e);
  }
};

/**
 * 
 * @param {*} $ 
 * @param {int} fcCode 1 for frequentanti 3 for non frequentanti
 */
const getSuggestionsData = ($, fcCode) => {
  try {
    return Promise.all( $('b').map((i, el) => {
      if ($(el).text().indexOf(`SCHEDE ${fcCode}`) > -1) {
        const table = $(el).next().next();
  
        if ($(el).text().indexOf('Suggerimenti') > -1) {
          return table.find('tr:not(:first-child)').map((i, el) => {
            return extractFromSuggestion(el, $);
          }).get();
  
        }
      }
      
    }).get());
  } catch(e) {
    console.error(e);
  }
};

/**
 * Gets the div containg the graphs and 
 * gets the src value
 * @param {*} $ 
 */
const getGraphsSelector = ($) => {
  let array = []
  $('b').map( (i, el) => {
    if ($(el).text().indexOf('Riepilogo') > -1) {
      graphs = ($(el).next().find('img'));

      graphs.map( (j,element) => {
        array.push(element);
      });
    }
  });

  return array;
};

const insertScheda = async (schedeStats, grafici, questions, id_insegnamento) => {
  const queryStr = 'INSERT INTO schede_opis (totale_schede, totale_schede_nf, fc, inatt_nf, eta, anno_iscr, num_studenti, ragg_uni, studio_gg, studio_tot, domande, domande_nf, motivo_nf, sugg, sugg_nf, id_insegnamento, anno_accademico) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
  try {
    pool.query(queryStr, [schedeStats[0].numSchedeF,
                          schedeStats[0].numSchedeNF,
                          schedeStats[0].fuoricorsoF,
                          schedeStats[0].fuoricorsoNF,
                          grafici.eta,
                          grafici.anno_iscr,
                          grafici.n_studenti,
                          grafici.ragg_uni,
                          grafici.studio_gg,
                          grafici.studio_tot,
                          questions.domande,
                          questions.domande_nf,
                          questions.motivi,
                          questions.suggerimenti_f,
                          questions.suggerimenti_nf,
                          id_insegnamento,
                          YEAR])
        .then(() => {
          console.log('#### \t\t\t \033[34m\t' +  id_insegnamento +'\033[0m' + ' [' + schedeStats[0].numSchedeF + ']');
        });
  } catch (error) {
    console.error(error);
  }
};

module.exports = {
  extractFromGraphs,
  extractFromTable,
  extractFromQuestion,
  extractFromReason,
  extractFromSuggestion,
  extractSchedeStats,
  insertScheda
};
