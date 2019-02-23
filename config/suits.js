'use strict';
const { fg, bg } = require('./colours');
const { read_config } = require('./config');

/**
 * Unicode suit representations.
 */
const suits_unicode = {
    diamonds: '\u2666',
    hearts: '\u2665',
    spades: '\u2663',
    clubs: '\u2660',
};

/**
 * Generates a string of ansi characters containing the foreground and background
 * colours used to display a card.
 * @exports
 * @returns {string} ansi foreground and ansi background.
 */
const gen_suits = () => {
    const config = read_config();
    let suits = {};
    for (let suit in config.colours) {
        let outstr = '';
        if ('bg' in config.colours[suit]) {
            outstr += bg[config.colours[suit].bg];
        }
        outstr += fg[config.colours[suit].fg] + suits_unicode[suit];
        suits[suit] = outstr;
    }
    return suits;
};

module.exports = { gen_suits };
