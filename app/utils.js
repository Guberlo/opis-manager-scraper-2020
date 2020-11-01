const _ = require("lodash")
const axios = require("axios")
const cheerio = require("cheerio")

/**
 * Compose function arguments starting from right to left
 * to an overall function and returns the overall function
 */
const compose = (...fns) => arg => {
    return _.flattenDeep(fns).reduceRight((current, fn) => {
        if(_.isFunction(fn)) return fn(current);
        throw new TypeError ("compose() expects only functions as parameters.")
    }, arg);
};

/**
 * Compose async function arguments starting from right to left
 * to an overall async function and returns the overall async function
 */
const composeAsync = (...fns) => arg => {
    return _.flattenDeep(fns).reduceRight(async (current, fn) => {
        if(_.isFunction(fn)) return fn(await current);
        throw new TypeError ("compose() expects only functions as parameters.")
    }, arg);
};

/**
 * Using axios to get html code, if succeeds uses cheerio to load html 
 * In order to work with CSS Selectors and jQuery.
 * @param {String} url 
 */
const getHtmlFromUrl = async url => {
    return await axios.get(url) 
                .then(response => cheerio.load(response.data)) 
                .catch(error => {
                    error.status = (error.response && error.response.status) || 500;
                    throw error;
                });
}

/**
 * If elem has text, returns the trimmed text
 * @param {*} elem 
 */
const getElemInnerText = elem => (elem.text && elem.text().trim()) || null;

/**
 * If elem has the given attribute, returns a function
 * That returns the value of the attribute
 * @param {*} attribute 
 */
const getElemAttribute = attribute => elem => 
        (elem.attr && elem.attr(attribute)) || null;

const isTextEmpty = extractor => elem => {
    return _.isNull(extractor(elem));
}

module.exports = {
    getHtmlFromUrl,
    getElemInnerText,
    getElemAttribute,
    isTextEmpty
}