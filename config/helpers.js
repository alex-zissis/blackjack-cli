'use strict';

/**
 * Converts a string to title case.
 * @param {string} str - string to convert.
 * @exports
 * @returns {string} title case str.
 */
const title = str => {
    return str
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

/**
 * Converts a string to lower case.
 * @param {string} str - string to convert.
 * @exports
 * @returns {string} lower case str.
 */
const lower = str => str.toLowerCase();

module.exports = { title, lower };
