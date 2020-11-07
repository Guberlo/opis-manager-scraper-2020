const { getHtmlFromUrl, getElemInnerText,getElemAttribute, addslashes } = require('./utils')
const { pool } = require('./db-try');
const year = "2020/2021"

/**
 * Takes a <tr> containing info about a cds as an argument.
 * Returns a dict where all cds informations are stored.
 * @param {*} elem 
 */
const extractCdsStats = (elem, primary_id_dip, $) => {
    const tds = $(elem).find('td');
    
    let cds_id = $(tds[0]);
    let cds_name = $(tds[1]);
    let cds_link = $(tds[1]).find('a');
    let cds_class = $(tds[2]); 
    let link_opis = $(tds[8]).find('a');

    cds_id = getElemInnerText(cds_id);
    cds_name = getElemInnerText(cds_name);
    cds_link = getElemAttribute('href')(cds_link),
    cds_class = getElemInnerText(cds_class),
    link_opis = getElemAttribute('href')(link_opis)

    const query_string = "INSERT INTO corso_di_studi (unict_id, anno_accademico, nome, classe, id_dipartimento) VALUES (?,?,?,?,?)"

    pool.query(query_string, [addslashes(cds_id), year, addslashes(cds_name), addslashes(cds_class), primary_id_dip], (err, result, fields) => {
        if(err) throw err;
    })
}

module.exports = {
    extractCdsStats
}
