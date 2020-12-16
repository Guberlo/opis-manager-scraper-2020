const { getHtmlFromUrl } = require('./app/utils');
const { extractDipStats, insertDip } = require('./app/scraper-dipartimento');
const { extractCdsStats, insertCds } = require('./app/scraper-cds');
const { extractInsStats, insertInsegnamento } = require('./app/scraper-insegnamento');
const { extractFromGraphs, extractFromTable, extractFromQuestion, extractFromReason, extractFromSuggestion, extractSchedeStats } = require('./app/scraper-schede');
const { getPrimaryID, getPrimaryIdIns } = require('./app/db-try');
const _ = require('lodash');

const url = 'https://pqa.unict.it/opis/';
const year = '2020/2021';

const tableSelectorDip = '.col-lg-6 > table > tbody > tr:not(:first-child):not(:last-child)';
const tableSelectorCds = '.col-lg-6 > table > tbody > tr:not(:first-child)';
const tableSelectorIns = '.col-lg-6 > table > tbody > tr:not(:first-child)';
// const emptyTd = '.col-lg-6 > table:nth-child(8) > tbody:nth-child(1) > tr:nth-child(58) > td:nth-child(1)';

// Test request

const depRequest = getHtmlFromUrl(url);

/*

resultPromise.then(result => {
    //console.log(result);
});

// Shitty test
const textTest = resultPromise.then($ => {
    console.log(getElemInnerText($('.col-lg-6 > p:nth-child(2)')));
});

// Shitty test
const attrTest = resultPromise.then($ => {
    var l = getElemAttribute('href')($('.col-lg-6 > table:nth-child(8) > tbody:nth-child(1) > tr:nth-child(2) > td:nth-child(8) > a:nth-child(1)'));
    console.log(l);
});

*/

// Test dipartimenti
/*
// Test information for one tr
const tdTest = resultPromise.then($ => {
    var k = extractDipStats($(tableSelectorDip))($);
});
*/

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
        dbID: await getPrimaryID(obj.unictId, 'dipartimenti'),
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
    // Process departments data
    return Promise.all($(tableSelectorCds).map(async (i, el) => {
      // Scrape data from departments
      const obj = await extractCdsStats($(el), $);
      // console.log(obj);

      // Insert data into DB
      await insertCds(obj.cdsID, year, obj.cdsName, obj.cdsClass, dbID);

      const id = await getPrimaryID(obj.cdsID, 'corso_di_studi');
      // console.log(`ID: ${id[0].id}`);
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

      // Insert data into DB - rm await
      await insertInsegnamento(obj, dbID);

      const id = await getPrimaryIdIns(obj.insID, obj.insCanale);

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

  const schedeStats = extractSchedeStats($);

  const grafici = extractFromGraphs($);

  const questions = await extractFromTable($);

  return [schedeStats, grafici, questions];

}


depsAsync().then((depsArray) => {
  depsArray.forEach((dep) => {
    // Get field vallue from RowPacket
    dep.dbID = dep.dbID[0].id;

    // Scrape and insert cds

    cdsAsync(dep.depID, dep.dbID).then(async (cdsArray) => {
      for await (const cds of cdsArray) {
        // Get field vallue from RowPacket
        // <---! ERROR Sometimes cbs.dbID is not recognized. inspect what the problem might be --->
        cds.dbID = cds.dbID[0].id;

        // Scrape and insert insegnamenti
        insAsync(cds.cdsID, cds.cdsClass, cds.dbID).then(async ins => {
          if(ins[1].linkOpis !== 'Scheda non autorizzata alla pubblicazione') {
            const id = ins[0].dbID[0].id;
            const link = url + (ins[1].linkOpis);

            console.log(link);
            
            console.log(await schedeAsync(id, link));
          }
        });
      }
    }).catch((error) => {
      console.log(error);
    });
  });
})
  .catch((err) => {
    console.error(err);
    return -1;
  });



/*

// Test cds

// Test cds scraper for one tr
const resultPromisecds = getHtmlFromUrl('https://pqa.unict.it/opis/cds_dip.php?id=601713&aa=2019')

resultPromisecds.then($ => {
    var j = extractCdsStats($(tableSelectorCds))($);
    console.log(j);
});

// Test cds scraper for all tr
const allCdsTest = resultPromisecds.then($ => {
    $(tableSelectorCds).each((i, el) => {
        console.log(extractCdsStats($(el))($));
    })
})
*/

// Test insegnamenti
/*
const resultPromiseIns = getHtmlFromUrl('https://pqa.unict.it/opis/insegn_cds.php?aa=2019&cds=L98&classe=LM-41');

// Test for empty td
const emptyTest = resultPromiseIns.then($ => {
    console.log(isTextEmpty(getElemInnerText)($(emptyTd)));
})

// Test insegnamento scraper for one tr
resultPromiseIns.then($ => {
    var g = extractInsStats($(tableSelectorIns))($);
    console.log(g);
});

// Test insegnamento scraper for all tr
resultPromiseIns.then($ => {
    $(tableSelectorIns).each((i, el) => {
        console.log(extractInsStats($(el) , $));
    });
});
*/


// Test graphs

const TABLEF_SELECTOR = '.col-lg-6 > table:nth-child(14) > tbody > tr:not(:first-child)'
const resultPromiseGraph = getHtmlFromUrl('https://pqa.unict.it/opis/_val_insegn.php?aa=2019&ins=1015126&mod=&canale=&s1=109&s3=23&id=1339&classe=L-31&cds=X81')

/*
resultPromiseGraph.then($ => {
    g_stats = extractFromGraphs($)
    console.log(g_stats)
})
*/
/*
resultPromiseGraph.then($ => {
    if(!_.isNull($(TABLEF_SELECTOR))) {
        console.log("F NOT NULL")
        $(TABLEF_SELECTOR).each((i, el) => {
            var questions_f = extractFromQuestion(el)($)
            console.log(questions_f)
        })
    }
})
*/


/*
const link = 'https://pqa.unict.it/opis/_val_insegn.php?aa=2019&ins=1015126&mod=&canale=&s1=109&s3=23&id=1339&classe=L-31&cds=X81';

resultPromiseGraph.then($ => {
  schedeAsync('1', link).then(res => console.log(res[2]));
})

*/
