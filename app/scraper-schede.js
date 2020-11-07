const { getHtmlFromUrl, getElemInnerText,getElemAttribute } = require('./utils')
const _ = require("lodash")

const NUM_SCHEDE_F_SELECTOR = '.col-lg-6 > b:nth-child(10) > table:nth-child(2) > tbody:nth-child(1) > tr:nth-child(2) > td:nth-child(2)'
const FUORICORSO_F_SELECTOR = '.col-lg-6 > b:nth-child(10) > table:nth-child(2) > tbody:nth-child(1) > tr:nth-child(2) > td:nth-child(3)'
const NUM_SCHEDE_NF_SELECTOR = '.col-lg-6 > b:nth-child(10) > table:nth-child(2) > tbody:nth-child(1) > tr:nth-child(3) > td:nth-child(2)'
const FUORICORSO_NF_SELECTOR = '.col-lg-6 > b:nth-child(10) > table:nth-child(2) > tbody:nth-child(1) > tr:nth-child(3) > td:nth-child(3)'

const AGE_GRAPH_SELECTOR = '.col-lg-6 > div:nth-child(11) > img:nth-child(1)'
const STUDY_TIME_SELECTOR = '.col-lg-6 > div:nth-child(11) > img:nth-child(2)'
const MEAN_TRAVEL_TIME_SELECTOR = '.col-lg-6 > div:nth-child(11) > img:nth-child(3)'
const TOTAL_STUDY_TIME_SELECTOR = '.col-lg-6 > div:nth-child(11) > img:nth-child(4)'
const ATTENDING_STUD_SELECTOR = '.col-lg-6 > div:nth-child(11) > img:nth-child(5)'
const ENROLLMENT_YEAR_SELECTOR = '.col-lg-6 > div:nth-child(11) > img:nth-child(6)'


const AGE_KEYS = ["18-19", "20-21", "22-23", "24-25", "26-27", "28-29", "30 e oltre"]
const STUDY_TIME_KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]
const TRAVEL_KEYS = ["fino 0.5", "0.5-1", "1-2", "2-3", "oltre 3"]
const TOTAL_STUDY_KEYS = ["fino a 50", "51-100", "101-150", "151-200", "201-250", "251-300", "301-350", "oltre 350"]
const ATTENDING_STUD_KEYS = ["fino 25", "26-50", "51-75", "76-100", "101-151", "151-200", "oltre 200"]
const ENROLLMENT_YEAR_KEYS = ["1","2","3","4","5","6","FC"]
const GRAPH_TYPE = {
    "eta":"eta",
    "ore_giornaliere":"o",
    "tempo_univ":"tmp",
    "ore_esame":"ore",
    "freq":"stud",
    "anno":"iscr"
}

// IMPLEMENT TABLE NON FREQ, TABLE FOR REASONS, TABLE FOR SUGGETIONS FREQ AND NOT FREQ

const extractSchedeStats = $ => {
    const num_schede_f = $(NUM_SCHEDE_F_SELECTOR)
    const fuoricorso_f = $(FUORICORSO_F_SELECTOR)

    const num_schede_nf = $(NUM_SCHEDE_NF_SELECTOR)
    const fuoricorso_nf = $(FUORICORSO_NF_SELECTOR)

    const graph_info = extractFromGraphs($)
    const table_info = extractFromTable($)
}

/**
 * Extract data from each graph an push it onto an array containing dicts
 * @param {*} $ 
 */
const extractFromGraphs = $ => {
    let graph_stats = []

    const age_graph = $(AGE_GRAPH_SELECTOR)
    const age_stats = getStatsFromSelector(age_graph)
    const age_dict = UrlToDictionary(AGE_KEYS)(age_stats)
    graph_stats.push(age_dict)

    const study_time = $(STUDY_TIME_SELECTOR)
    const study_time_stats = getStatsFromSelector(study_time)
    const study_dict = UrlToDictionary(STUDY_TIME_KEYS)(study_time_stats)
    graph_stats.push(study_dict)

    const mean_travel_time = $(MEAN_TRAVEL_TIME_SELECTOR)
    const mean_travel_time_stats = getStatsFromSelector(mean_travel_time)
    const mean_travel_dict = UrlToDictionary(TRAVEL_KEYS)(mean_travel_time_stats)
    graph_stats.push(mean_travel_dict)

    const total_study_time = $(TOTAL_STUDY_TIME_SELECTOR)
    const total_study_time_stats = getStatsFromSelector(total_study_time)
    const total_study_dict = UrlToDictionary(TOTAL_STUDY_KEYS)(total_study_time_stats)
    graph_stats.push(total_study_dict)

    const attending_stud = $(ATTENDING_STUD_SELECTOR)
    const attending_stud_stats = getStatsFromSelector(attending_stud)
    const attending_stud_dict = UrlToDictionary(ATTENDING_STUD_KEYS)(attending_stud_stats)
    graph_stats.push(attending_stud_dict)

    const enrollment_year = $(ENROLLMENT_YEAR_SELECTOR)
    const enrollment_year_stats = getStatsFromSelector(enrollment_year)
    const enrollment_year_dict = UrlToDictionary(ENROLLMENT_YEAR_KEYS)(enrollment_year_stats)
    graph_stats.push(enrollment_year_dict)

    return graph_stats;
    // returns an array containing dicts <CHANGE TO RETURNING JUST ONE DICT>
}

/**
 * Extract data from tables and push it onto an array
 * @param {*} $ 
 */
const extractFromTable = $ => {
    let table_stats = []

    $('b').each(function() {
        if( $(this).text().indexOf('SCHEDE') > -1) {
            const table = $(this).next().next()

            if( $(this).text().indexOf('valutaz. studenti') > -1) {
                table.find('tr:not(:first-child)').each( (i, el) => {
                    let questions = extractFromQuestion(el)($)
                    console.log(questions)
                })
            }

            else if( $(this).text().indexOf('motivo') > -1) {
                table.find('tr:not(:first-child)').each( (i, el) => {
                    let reasons = extractFromReason(el)($)
                    console.log(reasons)
                })
            }

            else if( $(this).text().indexOf('Suggerimenti') > -1) {
                table.find('tr:not(:first-child)').each( (i, el) => {
                    let suggestions = extractFromSuggestion(el)($)
                    console.log(suggestions)
                })
            }
        }
    })

    return table_stats;
    // returns an array
}

/**
 * Extract data from <tr> containing questions and returns an array
 * @param {*} elem 
 */
const extractFromQuestion = elem => $ => {
    let questions = []

    const tds = $(elem).find('td')
    const descr = getElemInnerText($(tds[0]))
    const decisamente_no = getElemInnerText($(tds[1]))
    const no_che_si = getElemInnerText($(tds[2]))
    const si_che_no = getElemInnerText($(tds[3]))
    const si = getElemInnerText($(tds[4]))
    const non_so = getElemInnerText($(tds[5]))

    questions.push(descr, decisamente_no, no_che_si, si_che_no, si, non_so)


    return questions.map(x => _.isNull(x) ? '0' : x)

    // returns an array
}

/**
 * Extract from <tr> containing reasons an returns an array
 * @param {*} elem 
 */
const extractFromReason = elem => $ => {
    let reasons = []

    const tds = $(elem).find('td')
    const reason = getElemInnerText($(tds[0]))
    const percentage = getElemInnerText($(tds[1]))

    reasons.push(reason, percentage)

    return reasons.map(x => _.isNull(x) ? '0' : x)
    //returns an array
}

/**
 * Extract from <tr> containing suggestions an returns an array
 * @param {*} elem 
 */
const extractFromSuggestion = elem => $ => {
    let suggestions = []

    const tds = $(elem).find('td')
    const suggestion = getElemInnerText($(tds[0]))
    const percentage = getElemInnerText($(tds[1]))

    suggestions.push(suggestion, percentage)

    return suggestions.map(x => _.isNull(x) ? '0' : x)
    // returns an array
}

/**
 * Filter graph's link to return the number of answer per category (Ex. eta1=22...)
 * @param {*} url 
 */
const filterGraph = url => type => key => {
    url = url.replace("graph.php?tipo=" + type + "&", "")
    url = url.replace(new RegExp(key, "g"), "")
    let url_stats = url.split("&")
    url_stats = url_stats.map(x => x.replace(new RegExp("^[0-9]+="), ""))

    return url_stats;
}

/**
 * Take the values from filtergraph and create a key-value dict
 * With graph labels as key (Ex. fino 50:22)
 * @param {*} keys 
 */
const UrlToDictionary = keys => elements => {
    const dict = elements.reduce( (result, field, index) => {
        result[keys[index]] = field;
        return result;
    }, {})
    
    return dict;
}

/**
 * Extract url, type of graph and also get key (Ex. ore=o, tempo=tmp_univ...)
 * @param {*} elem 
 */
const getStatsFromSelector = elem => {
    if(elem) {
        const src = getElemAttribute('src')(elem)
        const type = src.substring(15, src.indexOf("&"))
        const key = GRAPH_TYPE[type]
        const raw_stats = filterGraph(src)(type)(key)

        return raw_stats;
    }
    return null;
}

module.exports = {
    extractFromGraphs,
    extractFromTable,
    extractFromQuestion
}
