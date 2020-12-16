const _ = require('lodash');
const { getElemInnerText, getElemAttribute } = require('./utils');

const NUM_SCHEDE_F_SELECTOR = '.col-lg-6 > b:nth-child(10) > table:nth-child(2) > tbody:nth-child(1) > tr:nth-child(2) > td:nth-child(2)';
const FUORICORSO_F_SELECTOR = '.col-lg-6 > b:nth-child(10) > table:nth-child(2) > tbody:nth-child(1) > tr:nth-child(2) > td:nth-child(3)';
const NUM_SCHEDE_NF_SELECTOR = '.col-lg-6 > b:nth-child(10) > table:nth-child(2) > tbody:nth-child(1) > tr:nth-child(3) > td:nth-child(2)';
const FUORICORSO_NF_SELECTOR = '.col-lg-6 > b:nth-child(10) > table:nth-child(2) > tbody:nth-child(1) > tr:nth-child(3) > td:nth-child(3)';

const AGE_GRAPH_SELECTOR = '.col-lg-6 > div:nth-child(11) > img:nth-child(1)';
const STUDY_SELECTOR = '.col-lg-6 > div:nth-child(11) > img:nth-child(2)';
const MEAN_TRAVEL_SELECTOR = '.col-lg-6 > div:nth-child(11) > img:nth-child(3)';
const TOTAL_STUDY_SELECTOR = '.col-lg-6 > div:nth-child(11) > img:nth-child(4)';
const ATTENDING_STUD_SELECTOR = '.col-lg-6 > div:nth-child(11) > img:nth-child(5)';
const ENROLLMENT_YEAR_SELECTOR = '.col-lg-6 > div:nth-child(11) > img:nth-child(6)';

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
    console.log(i++);
    const src = getElemAttribute('src')(elem);
    console.log(src);
    const type = src.substring(15, src.indexOf('&'));
    const key = GRAPH_TYPE[type];
    const rawStats = filterGraph(src, type, key);

    return rawStats;
  }
  console.log("<--Elem is null-->" + elem);
  return null;
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

  const ageGraphSel = $(AGE_GRAPH_SELECTOR);
  const ageStats = getStatsFromSelector(ageGraphSel);
  const ageDict = UrlToDictionary(AGE_KEYS, ageStats);

  const studySel = $(STUDY_SELECTOR);
  const studyStats = getStatsFromSelector(studySel);
  const studyDict = UrlToDictionary(STUDY_KEYS, studyStats);

  const meanTravelSel = $(MEAN_TRAVEL_SELECTOR);
  const meanTravelStats = getStatsFromSelector(meanTravelSel);
  const meanTravelDict = UrlToDictionary(TRAVEL_KEYS, meanTravelStats);

  const totalStudySel = $(TOTAL_STUDY_SELECTOR);
  const totalStudyStats = getStatsFromSelector(totalStudySel);
  const totalStudyDict = UrlToDictionary(TOTAL_STUDY_KEYS, totalStudyStats);

  const attendingStudSel = $(ATTENDING_STUD_SELECTOR);
  const attendingStudStats = getStatsFromSelector(attendingStudSel);
  const attendingStudDict = UrlToDictionary(ATTENDING_STUD_KEYS, attendingStudStats);

  const enrollmentYearSel = $(ENROLLMENT_YEAR_SELECTOR);
  const enrollmentYearStats = getStatsFromSelector(enrollmentYearSel);
  const enrollmentYearDict = UrlToDictionary(ENROLLMENT_YEAR_KEYS, enrollmentYearStats);

  return {
    eta: ageDict,
    studio_gg: studyDict,
    ragg_uni: meanTravelDict,
    studio_tot: totalStudyDict,
    n_studenti: attendingStudDict,
    anno_iscr: enrollmentYearDict
  }
};

/**
   * Extract data from <tr> containing questions and returns an array
   * @param {*} elem
   */
const extractFromQuestion = (elem, $) => {
  let questions = [];

  const tds = $(elem).find('td');
  const descr = getElemInnerText($(tds[0]));
  const decisamenteNo = getElemInnerText($(tds[1]));
  const noCheSi = getElemInnerText($(tds[2]));
  const siCheNo = getElemInnerText($(tds[3]));
  const si = getElemInnerText($(tds[4]));
  const nonSo = getElemInnerText($(tds[5]));

  questions.push(descr, decisamenteNo, noCheSi, siCheNo, si, nonSo);

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

/**
   * Extract data from tables and push it onto an array
   * @param {*} $
   */
const extractFromTable = async ($) => {
  const questions = await getQuestionsData($);

  const reasons = await getReasonsData($);

  const suggestions = await getSuggestionsData($);
  
  return{
    domande: questions.splice(0,12),
    domande_nf: questions,
    motivi: reasons,
    suggerimenti: suggestions,
  }
};

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

const getSuggestionsData = ($) => {
  try {
    return Promise.all( $('b').map((i, el) => {
      if ($(el).text().indexOf('SCHEDE') > -1) {
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

const extractSchedeStats = ($) => {
  const numSchedeF = $(NUM_SCHEDE_F_SELECTOR);
  const fuoricorsoF = $(FUORICORSO_F_SELECTOR);

  const numSchedeNF = $(NUM_SCHEDE_NF_SELECTOR);
  const fuoricorsoNF = $(FUORICORSO_NF_SELECTOR);

  return {
    numSchedeF: getElemInnerText(numSchedeF),
    fuoricorsoF: getElemInnerText(fuoricorsoF),
    numSchedeNF: getElemInnerText(numSchedeNF),
    fuoricorsoNF: getElemInnerText(fuoricorsoNF),
  }
};

module.exports = {
  extractFromGraphs,
  extractFromTable,
  extractFromQuestion,
  extractFromReason,
  extractFromSuggestion,
  extractSchedeStats
};
