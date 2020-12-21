const _ = require('lodash');
const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Compose function arguments starting from right to left
 * to an overall function and returns the overall function
 */
const compose = (...fns) => (arg) => _.flattenDeep(fns).reduceRight((current, fn) => {
  if (_.isFunction(fn)) return fn(current);
  throw new TypeError('compose() expects only functions as parameters.');
}, arg);

/**
 * Compose async function arguments starting from right to left
 * to an overall async function and returns the overall async function
 */
const composeAsync = (...fns) => (arg) => _.flattenDeep(fns).reduceRight(async (current, fn) => {
  if (_.isFunction(fn)) return fn(await current);
  throw new TypeError('compose() expects only functions as parameters.');
}, arg);

/**
 * Using axios to get html code, if succeeds uses cheerio to load html
 * In order to work with CSS Selectors and jQuery.
 * @param {String} url
 */
// eslint-disable-next-line no-return-await
const getHtmlFromUrl = async (url) => await axios.get(url)
  .then((response) => cheerio.load(response.data))
  .catch((error) => {
    error.status = (error.response && error.response.status) || 500;
    throw error;
  });

/**
 * If elem has text, returns the trimmed text
 * @param {*} elem
 */
const getElemInnerText = (elem) => (elem.text && elem.text().trim()) || null;

/**
 * If elem has the given attribute, returns a function
 * That returns the value of the attribute
 * @param {*} attribute
 */
const getElemAttribute = (attribute) => (elem) => (elem.attr && elem.attr(attribute)) || null;

const isTextEmpty = (extractor) => (elem) => _.isNull(extractor(elem));

/**
 * Formats the string to avoid problems with MYSQL
 * @param {*} string
 */
const addslashes = (string) => string.replace(/\\/g, '\\\\')
  .replace(/\u0008/g, '\\b')
  .replace(/\t/g, '\\t')
  .replace(/\n/g, '\\n')
  .replace(/\f/g, '\\f')
  .replace(/\r/g, '\\r')
  .replace(/'/g, '\\\'')
  .replace(/"/g, '\\"');

const sleep = ms => {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

module.exports = {
  getHtmlFromUrl,
  getElemInnerText,
  getElemAttribute,
  isTextEmpty,
  addslashes,
  sleep,
};
