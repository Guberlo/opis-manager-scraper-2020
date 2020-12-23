const { getHtmlFromUrl } = require('./app/utils');
const { extractDipStats, insertDip } = require('./app/scraper-dipartimento');
const { extractCdsStats, insertCds } = require('./app/scraper-cds');
const { extractInsStats, insertInsegnamento } = require('./app/scraper-insegnamento');
const { extractFromGraphs, extractFromTable, extractSchedeStats, insertScheda } = require('./app/scraper-schede');
const { getPrimaryID, getPrimaryIdIns, getPrimaryIdInsTest } = require('./app/db-try');
const _ = require('lodash');

const url = 'https://pqa.unict.it/opis/';
const year = '2020/2021';

const tableSelectorDip = '.col-lg-6 > table > tbody > tr:not(:first-child):not(:last-child)';
const tableSelectorCds = '.col-lg-6 > table > tbody > tr:not(:first-child)';
const tableSelectorIns = '.col-lg-6 > table > tbody > tr:not(:first-child)';

// Test request

const depRequest = getHtmlFromUrl(url);


// Test information for all tr
async function depsAsync() {
  const $ = await depRequest;

  try {
    // Process departments data
    return Promise.all($(tableSelectorDip).map(async (i, el) => {
      // Scrape data from departments
      const obj = await extractDipStats($(el), $);

      // Insert data into DB
      await insertDip(obj.unictId, year, obj.name);

      // Push dbid to scrape cds
      return {
        dbID: await getPrimaryID(obj.unictId, 'dipartimento'),
        depID: obj.unictId,
      };
    }).toArray());
  } catch (error) {
    console.error(error);
    return -1;
  }
}

async function cdsAsync(depID, dbID) {
  const cdsUrl = `${url}cds_dip.php?id=${depID}&aa=2019`;

  const $ = await getHtmlFromUrl(cdsUrl);

  try {
    // Process cds data
    return Promise.all($(tableSelectorCds).map(async (i, el) => {
      // Scrape data from cds
      const obj = await extractCdsStats($(el), $);
      // console.log(obj);

      // Insert data into DB
      await insertCds(obj.cdsID, year, obj.cdsName, obj.cdsClass, dbID);

      const id = await getPrimaryID(obj.cdsID, 'corso_di_studi');

      // Push dbid to scrape cds
      return {
        dbID: id,
        cdsID: obj.cdsID,
        cdsClass: obj.cdsClass,
      };
    }).toArray());
  } catch (error) {
    console.error(error);
    return -1;
  }
}

async function insAsync(cdsID, cdsClass, dbID) {
  const insUrl = `${url}insegn_cds.php?aa=2019&cds=${cdsID}&classe=${cdsClass}`;

  const $ = await getHtmlFromUrl(insUrl);

  try {
    // Process departments data
    return Promise.all($(tableSelectorIns).map(async (i, el) => {
      // Scrape data from departments
      const obj = await extractInsStats($(el), $);

      // Insert data into DB
      await insertInsegnamento(obj, dbID);

      let id = await getPrimaryIdIns(obj.insID, obj.insCanale, obj.insDocente);

      // <--- JUST FOR DEBUGGING --->
      if(_.isEmpty(id)) {
        console.log(`ID INS NULL: ${obj.insID}, ${obj.insCanale}, ${obj.insDocente}`);
        id = await getPrimaryIdInsTest(obj.insID, obj.insCanale, obj.insDocente);
      }
      // <--- JUST FOR DEBUGGING --->

      // Push dbid to scrape cds
      return {
        dbID: id,
        linkOpis: obj.linkOpis,
      };
    }).toArray());
  } catch (error) {
    console.error(error);
    return -1;
  }
}

async function schedeAsync(dbID, link) {
  const $ = await getHtmlFromUrl(link);

  const schedeStats = await extractSchedeStats($);

  const grafici = extractFromGraphs($);

  const questions = await extractFromTable($);

  await insertScheda(schedeStats, grafici, questions, dbID);

  return [schedeStats, grafici, questions];

}


depsAsync().then((depsArray) => {
  depsArray.forEach((dep) => {
    // Get field value from RowPacket
    dep.dbID = dep.dbID[0].id;

    // Scrape and insert cds

    cdsAsync(dep.depID, dep.dbID).then(async (cdsArray) => {
      cdsArray.forEach(cds => {
        // Get field vallue from RowPacket
        // <---! ERROR Sometimes cbs.dbID is undefined. inspect what the problem might be --->
        cds.dbID = cds.dbID[0].id;

        // Scrape and insert insegnamenti
        insAsync(cds.cdsID, cds.cdsClass, cds.dbID).then(insArray => {
          insArray.forEach(async ins => {
            if(ins.linkOpis !== 'Scheda non autorizzata alla pubblicazione') {
              const id = ins.dbID[0].id;
              const link = url + (ins.linkOpis);
  
              //console.log(link);
              
              await schedeAsync(id, link);

              // Close connection
            }
          })
        });
      })
    }).catch((error) => {
      console.log(error);
      return -1;
    });
  });
})
  .catch((err) => {
    console.error(err);
    return -1;
  });
