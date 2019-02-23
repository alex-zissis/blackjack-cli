'use strict';
const { gen_suits } = require('../config/suits');
const { control } = require('../config/colours');

/**
 * Represents a Hand, containing cards and having a bet attached.
 * @typedef {Object} Hand
 */
class Hand {
    /**
     * Creates a new hand.
     */
    constructor() {
        this.cards = [];
        this.history = [];
        this.value = [];
        this.bet = 0;
        this.playing = true;
        this.blackjack = false;
    }

    /**
     * Adds a card to the hand.
     * @param {Card} card - Card to be added.
     */
    add_card(card) {
        this.cards.push(card);
        this.calc_value();
    }

    /**
     * Gets the value of the hand by adding cards. If an ace is present, count it as 11.
     * @returns {Number} The highest value of the hand.
     * @async
     */
    async get_highest_val() {
        let high = 0;
        for (let val of this.value) {
            if (val > high) {
                high = val;
            }
        }
        return high;
    }

    /**
     * Gets a string representation of the cards in the hand, including colours and unicode symbols.
     * @returns {string} Cards in the hand.
     */
    disp_cards() {
        const suits = gen_suits();
        let outstr = '';
        for (let card of this.cards) {
            if (!card.hidden) {
                outstr += suits[card.suit] + card.name + control.reset + ' ';
            }
        }
        outstr += `- (${this.value})\n`;
        return outstr;
    }

    /**
     * Calculates the value(s) of a hand.
     */
    calc_value() {
        this.value = [];
        this.disp_value = [];
        let card_vals = [];
        for (let card of this.cards) {
            if (!card.hidden) {
                card_vals.push(card.val);
            }
        }
        card_vals = card_vals.sort((a, b) => {
            if (a.length < b.length) return -1;
            if (a.length > b.length) return 1;
        });
        for (let vals of card_vals) {
            let val_cnt = 0;
            for (let val of vals) {
                if (typeof this.value[val_cnt] === 'undefined') {
                    if (val_cnt > 0) {
                        this.value[val_cnt] = this.value[val_cnt - 1] + val - 1;
                        if (this.value[val_cnt] == 21) {
                            this.value = [21];
                        } else if (this.value[val_cnt] > 21) {
                            this.value.splice(val_cnt);
                        }
                    } else {
                        this.value[val_cnt] = val;
                    }
                } else {
                    this.value[val_cnt] = val + this.value[val_cnt];
                }
                val_cnt++;
            }
        }
    }

    /**
     * Resets a hand for the next round.
     */
    reset_hand() {
        if (this.cards.length > 0) {
            this.history.push(this.cards);
        }
        this.value = [];
        this.disp_value = [];
        this.cards = [];
        this.bet = 0;
        this.playing = true;
        this.blackjack = false;
    }
}

module.exports = { Hand };
