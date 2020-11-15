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

// IMPLEMENT TABLE NON FREQ, TABLE FOR REASONS, TABLE FOR SUGGETIONS FREQ AND NOT FREQ

/**
 * Filter graph's link to return the number of answer per category (Ex. eta1=22...)
 * @param {*} url
 */
const filterGraph = (url) => (type) => (key) => {
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
const UrlToDictionary = (keys) => (elements) => {
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
    const rawStats = filterGraph(src)(type)(key);

    return rawStats;
  }
  return null;
};

/**
 * Extract from <tr> containing suggestions an returns an array
 * @param {*} elem
 */
const extractFromSuggestion = (elem) => ($) => {
  const suggestions = [];

  const tds = $(elem).find('td');
  const suggestion = getElemInnerText($(tds[0]));
  const percentage = getElemInnerText($(tds[1]));

  suggestions.push(suggestion, percentage);

  return suggestions.map((x) => (_.isNull(x) ? '0' : x));
  // returns an array
};

/**
   * Extract data from each graph an push it onto an array containing dicts
   * @param {*} $
   */
const extractFromGraphs = ($) => {
  const graphStats = [];

  const ageGraph = $(AGE_GRAPH_SELECTOR);
  const ageStats = getStatsFromSelector(ageGraph);
  const ageDict = UrlToDictionary(AGE_KEYS)(ageStats);
  graphStats.push(ageDict);

  const study = $(STUDY_SELECTOR);
  const studyStats = getStatsFromSelector(study);
  const studyDict = UrlToDictionary(STUDY_KEYS)(studyStats);
  graphStats.push(studyDict);

  const meanTravel = $(MEAN_TRAVEL_SELECTOR);
  const meanTravelStats = getStatsFromSelector(meanTravel);
  const meanTravelDicts = UrlToDictionary(TRAVEL_KEYS)(meanTravelStats);
  graphStats.push(meanTravelDicts);

  const totalStudy = $(TOTAL_STUDY_SELECTOR);
  const totalStudyStats = getStatsFromSelector(totalStudy);
  const totalStudyDict = UrlToDictionary(TOTAL_STUDY_KEYS)(totalStudyStats);
  graphStats.push(totalStudyDict);

  const attendingStud = $(ATTENDING_STUD_SELECTOR);
  const attendingStudStats = getStatsFromSelector(attendingStud);
  const attendingStudDict = UrlToDictionary(ATTENDING_STUD_KEYS)(attendingStudStats);
  graphStats.push(attendingStudDict);

  const enrollmentYear = $(ENROLLMENT_YEAR_SELECTOR);
  const enrollmentYearStats = getStatsFromSelector(enrollmentYear);
  const enrollmentYearDict = UrlToDictionary(ENROLLMENT_YEAR_KEYS)(enrollmentYearStats);
  graphStats.push(enrollmentYearDict);

  return graphStats;
  // returns an array containing dicts <CHANGE TO RETURNING JUST ONE DICT>
};

/**
   * Extract data from <tr> containing questions and returns an array
   * @param {*} elem
   */
const extractFromQuestion = (elem) => ($) => {
  const questions = [];

  const tds = $(elem).find('td');
  const descr = getElemInnerText($(tds[0]));
  const decisamenteNo = getElemInnerText($(tds[1]));
  const noCheSi = getElemInnerText($(tds[2]));
  const siCheNo = getElemInnerText($(tds[3]));
  const si = getElemInnerText($(tds[4]));
  const nonSo = getElemInnerText($(tds[5]));

  questions.push(descr, decisamenteNo, noCheSi, siCheNo, si, nonSo);

  return questions.map((x) => (_.isNull(x) ? '0' : x));

  // returns an array
};

/**
   * Extract from <tr> containing reasons an returns an array
   * @param {*} elem
   */
const extractFromReason = (elem) => ($) => {
  const reasons = [];

  const tds = $(elem).find('td');
  const reason = getElemInnerText($(tds[0]));
  const percentage = getElemInnerText($(tds[1]));

  reasons.push(reason, percentage);

  return reasons.map((x) => (_.isNull(x) ? '0' : x));
  // returns an array
};

/**
   * Extract data from tables and push it onto an array
   * @param {*} $
   */
const extractFromTable = ($) => {
  const tableStats = [];

  $('b').each(function () {
    if ($(this).text().indexOf('SCHEDE') > -1) {
      const table = $(this).next().next();

      if ($(this).text().indexOf('valutaz. studenti') > -1) {
        table.find('tr:not(:first-child)').each((i, el) => {
          const questions = extractFromQuestion(el)($);
          console.log(questions);
        });
      } else if ($(this).text().indexOf('motivo') > -1) {
        table.find('tr:not(:first-child)').each((i, el) => {
          const reasons = extractFromReason(el)($);
          console.log(reasons);
        });
      } else if ($(this).text().indexOf('Suggerimenti') > -1) {
        table.find('tr:not(:first-child)').each((i, el) => {
          const suggestions = extractFromSuggestion(el)($);
          console.log(suggestions);
        });
      }
    }
  });

  return tableStats;
  // returns an array
};

const extractSchedeStats = ($) => {
  const numSchedeF = $(NUM_SCHEDE_F_SELECTOR);
  const fuoricorsoF = $(FUORICORSO_F_SELECTOR);

  const numSchedeNF = $(NUM_SCHEDE_NF_SELECTOR);
  const fuoricorsoNF = $(FUORICORSO_NF_SELECTOR);

  const graphInfo = extractFromGraphs($);
  const tableInfo = extractFromTable($);
};
module.exports = {
  extractFromGraphs,
  extractFromTable,
  extractFromQuestion,
};
