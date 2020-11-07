const { getHtmlFromUrl, getElemInnerText,getElemAttribute, isTextEmpty } = require('./app/utils'); 
const { extractDipStats } = require('./app/scraper-dipartimento');
const { extractCdsStats } = require('./app/scraper-cds');
const _ = require("lodash");
const { extractInsStats } = require('./app/scraper-insegnamento');
const { extractFromGraphs, extractFromTable, extractFromQuestion } = require('./app/scraper-schede');
const { pool } = require('./app/db-try')


const url = "https://pqa.unict.it/opis/";
const tableSelectorDip = '.col-lg-6 > table > tbody > tr:not(:first-child):not(:last-child)';
const tableSelectorCds = '.col-lg-6 > table > tbody > tr:not(:first-child)';
const tableSelectorIns = '.col-lg-6 > table > tbody > tr:not(:first-child)';
const emptyTd = '.col-lg-6 > table:nth-child(8) > tbody:nth-child(1) > tr:nth-child(58) > td:nth-child(1)';

const dipartimenti = [];



// Test request

const resultPromise  = getHtmlFromUrl(url)

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
const allTdTest = resultPromise.then($ => {
    $(tableSelectorDip).each(async (i, el) => {
        const id = await extractDipStats($(el), $)
        //console.log(id)
        console.log("FINISHED DB")
    });

    //process.exit() // Otherwise it won't close connections wit mysql
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


/*

// Test insegnamenti

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
        console.log(extractInsStats($(el))($));
    });
});

*/



/*
// Test graphs

const TABLEF_SELECTOR = '.col-lg-6 > table:nth-child(14) > tbody > tr:not(:first-child)'
const resultPromiseGraph = getHtmlFromUrl('https://pqa.unict.it/opis/_val_insegn.php?aa=2019&ins=1001527&mod=&canale=&s1=24&s3=0&id=1&classe=LM-7&cds=O38')

resultPromiseGraph.then($ => {
    g_stats = extractFromGraphs($)
    console.log(g_stats)
})

/*resultPromiseGraph.then($ => {
    if(!_.isNull($(TABLEF_SELECTOR))) {
        console.log("F NOT NULL")
        $(TABLEF_SELECTOR).each((i, el) => {
            var questions_f = extractFromQuestion(el)($)
            console.log(questions_f)
        })
    }
})

resultPromiseGraph.then($ => {
    extractFromTable($)
})
*/