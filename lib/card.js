'use strict';
/**
 * Class representing a card.
 * @typedef {Object} Card
 */
class Card {
    /**
     * Create a card.
     * @param {string} suit - suit of the card e.g. Diamond
     * @param {string} name - one letter name of the card e.g. A
     * @param {Number[]} val - value of the card e.g. [1,11]
     */
    constructor(suit, name, val) {
        this.suit = suit;
        this.name = name;
        this.val = val;
        this.hidden = false;
    }
}

module.exports = { Card };
