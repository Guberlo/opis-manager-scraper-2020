const { getHtmlFromUrl, getElemInnerText,getElemAttribute } = require('./utils')

/**
 * Takes a <tr> containing info about a cds as an argument.
 * Returns a dict where all cds informations are stored.
 * @param {*} elem 
 */
const extractCdsStats = elem => $ => {
    const tds = $(elem).find('td');
    
    const cds_id = $(tds[0]);
    const cds_name = $(tds[1]);
    const cds_link = $(tds[1]).find('a');
    const cds_class = $(tds[2]); 
    const link_opis = $(tds[8]).find('a');

    return cds = {
        cds_id: getElemInnerText(cds_id),
        cds_name: getElemInnerText(cds_name),
        cds_link: getElemAttribute('href')(cds_link),
        cds_class: getElemInnerText(cds_class),
        link_opis: getElemAttribute('href')(link_opis)
    };
}

module.exports = {
    extractCdsStats
}