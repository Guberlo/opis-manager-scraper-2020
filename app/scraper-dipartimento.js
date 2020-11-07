const { getElemInnerText,getElemAttribute, addslashes } = require('./utils')
const { pool, get_primary_id } = require('./db-try'); 
const year = "2020/2021"

/**
 * Gets the id from the url
 * @param {*} url 
 */
const parseID = url => {
    url = url.replace('cds_dip.php?', "").split('&')
    let id = url[0].replace('id=', "")

    return id;
}

/**
 * Takes a <tr> containing info about a department as an argument.
 * Creates a dict and pushes it onto an array where all deps are stored.
 * @param {*} elem 
 */
const extractDipStats = async (elem, $) => {
    const tds = $(elem).find('td');
    const dep_link = ($(tds[0]).find('a')); // Department's link
    let name = $(tds[0]); // Deparment's name
    let opis_link = ($(tds[7]).find('a')); // Department's opis link

    name = getElemInnerText(name);
    opis_link = getElemAttribute('href')(opis_link);
    const unict_id = parseID(getElemAttribute('href')(dep_link));

    await insert_dip(unict_id, year, name);
    const id = await get_primary_id(unict_id, 'dipartimenti');

    console.log("id: " + id)
    return id;

}

const insert_dip = async (id, anno, nome) => {
    const query_string = "INSERT INTO dipartimenti (unict_id, anno_accademico, nome) VALUES (?, ?, ?)";
    pool.query(query_string, [id, anno, nome], (err, result, fields) => {
        if(err) throw err;
        console.log("Data inserted.");
    })

    return
}


module.exports = {
    extractDipStats
}
