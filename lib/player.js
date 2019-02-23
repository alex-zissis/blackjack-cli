'use strict';
const { Hand } = require('./hand');

/**
 * Represents a Player at the table.
 * @typedef {Object} Player
 */
class Player {
    /**
     * Creates a Player.
     * @param {string} name - Name of the player.
     * @param {Number} cash - Starting cash of the player.
     * @param {boolean} human - Whether the player is human or not.
     */
    constructor(name, cash, human) {
        this.name = name;
        this.cash = cash;
        this.human = human;
        this.hands = [new Hand()];
    }

    /**
     * Initialises the requested amount of hands for the player.
     * @param {Number} number - Amount of hands.
     */
    set_hands(number) {
        if (number == 0) {
            this.hands[0].playing = false;
        } else {
            for (let i = 0; i < number; i++) {
                if (typeof this.hands[i] === 'undefined') {
                    this.hands.push(new Hand());
                } else {
                    this.hands[i].playing = true;
                }
            }
        }
    }

    /**
     * Transfers money from the Player's cash reserve to a Hand's bet.
     * @param {Number} hand_no - Array index of the hand being played.
     * @param {Number} amt - Amount to bet.
     */
    bet(hand_no, amt) {
        this.cash -= amt;
        this.hands[hand_no].bet = amt;
    }

    /**
     * Returns the initial bet amount to the Player's cash.
     * @param {Hand} hand - Hand that has been played.
     */
    standoff(hand) {
        this.cash += hand.bet;
    }

    /**
     * Adds the winning bet amount to the Player's cash.
     * @param {Hand} hand - Hand that has been played.
     */
    win(hand) {
        this.cash += hand.bet * 2;
    }

    /**
     * Adds the winning bet amount at 3:2 to the Player's cash.
     * @param {Hand} hand - Hand that has been played.
     */
    blackjack(hand) {
        this.cash += hand.bet * 2 + hand.bet / 2;
    }

    /**
     * Resets the Player's hands for the next round.
     */
    reset_hands() {
        this.hands = [this.hands[0]];
        this.hands[0].reset_hand();
    }
}

module.exports = { Player };
