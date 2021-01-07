const { getHtmlFromUrl, sleep } = require('./app/utils');
const { extractDipStats, insertDip } = require('./app/scraper-dipartimento');
const { extractCdsStats, insertCds } = require('./app/scraper-cds');
const { extractInsStats, insertInsegnamento } = require('./app/scraper-insegnamento');
const { extractFromGraphs, extractFromTable, extractSchedeStats, insertScheda } = require('./app/scraper-schede');
const { getPrimaryID, getPrimaryIdIns, getPrimaryIdInsTest } = require('./app/db-try');
const _ = require('lodash');


const tableSelectorDip = '.col-lg-6 > table > tbody > tr:not(:first-child):not(:last-child)';
const tableSelectorCds = '.col-lg-6 > table > tbody > tr:not(:first-child)';
const tableSelectorIns = '.col-lg-6 > table > tbody > tr:not(:first-child)';

const url = 'https://pqa.unict.it/opis/';
const year = '2020/2021';

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
        try {
    
          // Push dbid to scrape cds
          return {
            dbID:  await insertCds(obj.cdsID, year, obj.cdsName, obj.cdsClass, dbID),
            cdsID: obj.cdsID,
            cdsClass: obj.cdsClass,
          };
        } catch(e) {
          console.error(e);
        }
      }).toArray());
    } catch (error) {
      console.error(error);
      return -1;
    }
  }

  async function insAsync(cdsID, cdsClass, dbID) {
    // Try to fix ECONNRESET
    let randsleep = (Math.random() * (3000 - 1500) ) + 1500;
    console.log(`sleeping for: ${randsleep}`);
    await sleep(randsleep);

    const insUrl = `${url}insegn_cds.php?aa=2019&cds=${cdsID}&classe=${cdsClass}`;
  
    const $ = await getHtmlFromUrl(insUrl);
  
    try {
      // Process departments data
      return Promise.all($(tableSelectorIns).map(async (i, el) => {
        // Scrape data from departments
        const obj = await extractInsStats($(el), $);
       
        try {
          // Push dbid to scrape cds
          return {
            dbID: await insertInsegnamento(obj, dbID),
            linkOpis: obj.linkOpis,
          };
        } catch(e) {
          console.error(e);
        }
      }).toArray());
    } catch (error) {
      console.error(error);
      return -1;
    }
  }

  async function schedeAsync(dbID, link) {
    // Try to fix ECONNRESET
    let randsleep = (Math.random() * (30000 - 9000) ) + 9000;
    console.log(`sleeping for: ${randsleep}`);
    await sleep(randsleep);

    const $ = await getHtmlFromUrl(link);
  
    const schedeStats = await extractSchedeStats($);
  
    const grafici = extractFromGraphs($);
  
    const questions = await extractFromTable($);
  
    await insertScheda(schedeStats, grafici, questions, dbID);
  
    return [schedeStats, grafici, questions];
  
  }

  depsAsync().then(depsArray => {
    depsArray.forEach(dep => {
      cdsAsync(dep.depID, dep.dbID).then(cdsArray => {
        cdsArray.forEach(async cds => {
          insAsync(cds.cdsID, cds.cdsClass, cds.dbID).then(insArray => {
            insArray.forEach(async ins => {
              if(ins.linkOpis !== 'Scheda non autorizzata alla pubblicazione') {
                const link = url + (ins.linkOpis);
                schedeAsync(ins.dbID, link);
              }
            });
          });
        })
      });
    })
  })