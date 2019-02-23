'use strict';
const { Card } = require('./card');

/**
 * Class representing a Deck of cards.
 * @typedef {Object} Deck
 */
class Deck {
    /**
     * Creates a deck.
     * @param {Number} amt - Amount of 52-card decks to be inculded in the game deck.
     */
    constructor(amt) {
        this.cards = [];
        this.suits = {
            clubs: 'blue',
            spades: 'black',
            diamonds: 'green',
            hearts: 'red',
        };
        for (let i = 0; i < amt; i++) {
            Object.entries(this.suits).forEach(([key]) => {
                this.cards.push(new Card(key, 'A', [1, 11]));
                this.cards.push(new Card(key, '2', [2]));
                this.cards.push(new Card(key, '3', [3]));
                this.cards.push(new Card(key, '4', [4]));
                this.cards.push(new Card(key, '5', [5]));
                this.cards.push(new Card(key, '6', [6]));
                this.cards.push(new Card(key, '7', [7]));
                this.cards.push(new Card(key, '8', [8]));
                this.cards.push(new Card(key, '9', [9]));
                this.cards.push(new Card(key, '10', [10]));
                this.cards.push(new Card(key, 'J', [10]));
                this.cards.push(new Card(key, 'Q', [10]));
                this.cards.push(new Card(key, 'K', [10]));
            });
        }
    }
}

module.exports = { Deck };
