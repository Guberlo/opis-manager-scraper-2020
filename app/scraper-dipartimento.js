const { getElemInnerText,getElemAttribute } = require('./utils')


/**
 * Takes a <tr> containing info about a department as an argument.
 * Creates a dict and pushes it onto an array where all deps are stored.
 * @param {*} elem 
 */
const extractDipStats = elem => arr => $ => {
    const tds = $(elem).find('td');
    const name = $(tds[0]); // Deparment's name
    const dep_link = ($(tds[0]).find('a')); // Department's link
    const opis_link = ($(tds[7]).find('a')); // Department's opis link

    const dep = {
        name: getElemInnerText(name),
        dep_link: getElemAttribute('href')(dep_link),
        opis_link: getElemAttribute('href')(opis_link)
    };

    arr.push(dep);
}


module.exports = {
    extractDipStats
}