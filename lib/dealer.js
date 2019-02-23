'use strict';
const { Hand } = require('./hand');

/**
 * Class representing a dealer.
 */
class Dealer {
    /**
     * Creates a new dealer.
     * @typedef {Object} Dealer
     * @todo have dealer and player classes extend Person class.
     */
    constructor() {
        this.name = 'Dealer';
        this.hand = new Hand();
    }

    /**
     * Deals a card from the deck to a hand.
     * @param {Hand} hand - Hand for the card to be dealt into.
     * @param {Deck} deck - Deck to take the card from.
     * @param {boolean} hidden - Whether the card is hidden. True for the Dealer's second card.
     * @async
     * @returns {Deck} The deck with the card removed.
     */
    async deal(hand, deck, hidden) {
        const card_idx = Math.floor(Math.random() * deck.length);
        let card = deck[card_idx];
        card.hidden = hidden;
        hand.add_card(card);
        deck.splice(card_idx, 1);
        return deck;
    }

    /**
     * Reveals hidden cards in a hand. Used for the Dealer's second card.
     * @async
     * @returns {Card} The dealer's hidden card.
     */
    async reveal_card() {
        let hidden_card;
        for (let card of this.hand.cards) {
            if (card.hidden) {
                card.hidden = false;
                hidden_card = card;
                this.hand.calc_value();
                return hidden_card;
            }
        }
    }
}

module.exports = { Dealer };
