const { getHtmlFromUrl, getHtmlFromIndex, tableSelectorCds, tableSelectorIns, tableSelectorDip, url, year } = require('./app/utils');
const { extractDipStats, insertDip } = require('./app/scraper-dipartimento');
const { extractCdsStats, insertCds } = require('./app/scraper-cds');
const { extractInsStats, insertInsegnamento } = require('./app/scraper-insegnamento');
const { extractFromGraphs, extractFromTable, extractSchedeStats, insertScheda } = require('./app/scraper-schede');
const { closeConnection } = require('./app/db');
const _ = require('lodash');

const depRequest = getHtmlFromIndex(url);

async function depsAsync() {
  const $ = await depRequest;

  try {
    // Process departments data
    return Promise.all($(tableSelectorDip).map(async (i, el) => {
      // Scrape data from departments
      const obj = await extractDipStats($(el), $);

      // Insert data into DB
      return {
        dbID: await insertDip(obj.unictId, year, obj.name),
        depID: obj.unictId
      }
    }).toArray());
  } catch (error) {
    console.error(error);
    return -1;
  }
}

async function cdsAsync(depsArray) {
  return Promise.all(depsArray.map(async dep => {
    const cdsUrl = `${url}cds_dip.php?id=${dep.depID}&aa=${year.substr(0, 4)}`;
    const $ = await getHtmlFromUrl(cdsUrl);

    try {
      // Process cds data
      return Promise.all($(tableSelectorCds).map(async (i, el) => {
        // Scrape data from cds
        const obj = await extractCdsStats($(el), $);

        // Insert data into DB
        try {

          // Push dbid to scrape insegnamenti
          return {
            dbID: await insertCds(obj.cdsID, year, obj.cdsName, obj.cdsClass, dep.dbID),
            cdsID: obj.cdsID,
            cdsUrlID: obj.cdsUrlID,
            cdsClass: obj.cdsClass,
          };
        } catch (e) {
          console.error(e);
        }
      }).toArray());
    } catch (error) {
      console.error(error);
      return -1;
    }
  }));
}

async function insAsync(cdsArray) {
  return Promise.all(cdsArray.flat().map(async cds => {

    const insUrl = `${url}insegn_cds.php?aa=${year.substr(0, 4)}&cds=${cds.cdsUrlID}&classe=${cds.cdsClass}`;

    const $ = await getHtmlFromUrl(insUrl);

    try {
      // Process insegnamenti data
      return Promise.all($(tableSelectorIns).map(async (i, el) => {
        // Scrape data from insegnamenti
        const obj = await extractInsStats($(el), $);

        try {
          // Push dbid to scrape schede
          return {
            dbID: await insertInsegnamento(obj, cds.dbID),
            linkOpis: obj.linkOpis,
          };
        } catch (e) {
          console.error(e);
        }
      }).toArray());
    } catch (error) {
      console.error(error);
      return -1;
    }
  }));

}

async function schedeAsync(insArray) {
  for (const ins of insArray) {
    try {
      if (_.isUndefined(ins.linkOpis) || ins.linkOpis === 'Scheda non autorizzata alla pubblicazione')
        console.log(ins);

      else {
        const $ = await getHtmlFromUrl(url + ins.linkOpis);
        const schedeStats = await extractSchedeStats($);
        const grafici = await extractFromGraphs($);
        const questions = await extractFromTable($);

        await insertScheda(schedeStats, grafici, questions, ins.dbID);

      }
    } catch (e) {
      console.error(e);
    }
  }
}

(async () => {
  let depsArray = await depsAsync();

  let cdsArray = await cdsAsync(depsArray);

  let insArray = await insAsync(cdsArray);
  insArray = insArray.flat();

  await schedeAsync(insArray);

  closeConnection();
})();