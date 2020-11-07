const { getHtmlFromUrl, getElemInnerText,getElemAttribute, isTextEmpty } = require('./utils');
const _ = require("lodash")


 // <--! TODO ! --> IMPLEMENT METHOD TO JOIN MULTIPLE PIECES OF THE SAME TEACHING

 /**
 * Takes a <tr> containing info about a taching as an argument.
 * Returns a dict where all info are stored.
 * @param {*} elem 
 */
const extractInsStats = elem => $ => {
    // If the <tr> contains all the needed informations about teaching
    const tds = $(elem).find('td');
    if(!isTextEmpty(getElemInnerText)($(tds[0]))){
        const ins_id = $(tds[1]);
        const ins_name = $(tds[2]);
        const ins_canale = $(tds[3]);
        const ins_cod_modulo = $(tds[4]);
        //const ins_modulo = $(tds[5]);
        const ins_assegnazione = $(tds[6])
        const ins_ssd = $(tds[7]);
        const ins_anno = $(tds[8]);
        const ins_semestre = $(tds[9]);
        const ins_cfu = $(tds[10]);
        const ins_docente = $(tds[11]);
        const link_opis = $(tds[15]).find('a');

        return  {
            ins_id: getElemInnerText(ins_id),
            ins_name: getElemInnerText(ins_name),
            ins_canale: (_.isNull(getElemInnerText(ins_canale)) ? 'no' : getElemInnerText(ins_canale)),
            //ins_modulo: (_.isNull(getElemInnerText(ins_modulo)) ? '0' : getElemInnerText(ins_canale)),
            ins_cod_modulo: (_.isNull(getElemInnerText(ins_cod_modulo)) ? '0' : getElemInnerText(ins_cod_modulo)),
            ins_assegnazione: getElemInnerText(ins_assegnazione),
            ins_ssd: getElemInnerText(ins_ssd),
            ins_anno: getElemInnerText(ins_anno),
            ins_semestre: getElemInnerText(ins_semestre),
            ins_cfu: getElemInnerText(ins_cfu),
            ins_docente: getElemInnerText(ins_docente),
            link_opis: getElemAttribute('href')(link_opis)
        };
            // Missing tipo
    }
    // If the <tr> is without some attributes (Ex. teaching with multiple professors, only one td will contain all informations, the others will contain just some different infos)
    else {
        const parent = $(tds).parent()
        let prev_td = $(parent).prev()
        
        while(isTextEmpty(getElemInnerText)($(prev_td[0]))) {
            prev_td = $(prev_td).prev()
        }
        prev_td = $(prev_td).find('td')
        console.log("********************************************")

        const ins_id = $(prev_td[1]);
        const ins_name = $(prev_td[2]);
        const ins_canale = $(prev_td[3]);
        const ins_cod_modulo = $(prev_td[4]);
        //const ins_modulo = $(prev_td[5]);
        const ins_assegnazione = $(tds[1]);
        const ins_ssd = $(tds[2]);
        const ins_anno = $(tds[3]);
        const ins_semestre = $(tds[4]);
        const ins_cfu = $(tds[5]);
        const ins_docente = $(tds[6]);

        return insegnamento = {
            ins_id: getElemInnerText(ins_id),
            ins_name: getElemInnerText(ins_name),
            ins_canale: (_.isNull(getElemInnerText(ins_canale)) ? 'no' : getElemInnerText(ins_canale)),
            //ins_modulo: (_.isNull(getElemInnerText(ins_modulo)) ? '0' : getElemInnerText(ins_canale)),
            ins_cod_modulo: (_.isNull(getElemInnerText(ins_cod_modulo)) ? '0' : getElemInnerText(ins_cod_modulo)),
            ins_assegnazione: getElemInnerText(ins_assegnazione),
            ins_ssd: getElemInnerText(ins_ssd),
            ins_anno: getElemInnerText(ins_anno),
            ins_semestre: getElemInnerText(ins_semestre),
            ins_cfu: getElemInnerText(ins_cfu),
            ins_docente: getElemInnerText(ins_docente)
        };
    }
}

module.exports = {
    extractInsStats
}