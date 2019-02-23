'use strict';
const { prompt } = require('inquirer');

const { Hand } = require('./hand');
const { Player } = require('./player');
const { Dealer } = require('./dealer');
const { Deck } = require('./deck');
const { rand_name } = require('../config/names');
const { title } = require('../config/helpers');

/**
 * Class representing a Game of Blackjack.
 * @typedef {Object} Game
 */
class Game {
    /**
     * Create a game.
     * @param {Number} cpus - How many CPU players at the table.
     * @param {Number} humans - How many human players at the table.
     * @param {Number} stake - Minimum bet of the table.
     */
    constructor(cpus, humans, stake) {
        this.players = [];
        this.stake = stake;
        this.dealer = new Dealer();
        this.deck = new Deck(2);
        /**
         * Generate the players and start the gameloop.
         * @inner
         * @async
         */
        const gen = async () => {
            await this.gen_players(humans, stake, true);
            this.gen_players(cpus, stake, false);
            this.gameloop();
        };
        gen();
    }

    /**
     * Generates a new player object.
     * @param {string} name - Name of the player.
     * @param {Number} cash - Amount of cash the player starts with (stake * 4). 
     * @param {boolean} human - Whether the player is human.
     * @returns {Player} Generated player.
     */
    gen_player(name, cash, human) {
        return new Player(name, cash, human);
    }

    /**
     * Generates multiple players using the gen_player() method.
     * @param {Number} number - Number of players to generate.
     * @param {Number} stake - Stake of the table. @todo remove (use this.stake).
     * @param {boolean} human - Whether the players will be human or not.
     * @async
     */
    async gen_players(number, stake, human) {
        let name = '';
        for (let i = 0; i < number; i++) {
            if (human) {
                const answers = await prompt([
                    {
                        type: 'input',
                        name: 'name',
                        message: `\n player ${i + 1}'s name`,
                        validate: ui => ui.trim() != '',
                    },
                ]);
                name = title(answers.name);
            } else {
                name = rand_name();
            }
            const p = this.gen_player(name, stake * 15, human);
            this.players.push(p);
        }
    }

    /**
     * Remove a player from the table.
     * @param {Player} player - player to be removed.
     */
    remove_player(player) {
        const idx = this.players.findIndex(x => x.name === player.name);
        this.players.splice(idx, 1);
    }

    /**
     * Prompt the user to get the amount of hands they are playing this round.
     * @param {Player} player - Player to ask.
     * @async
     * @returns {Number} Amount of hands being played.
     */
    async get_hands(player) {
        const answer = await prompt({
            type: 'list',
            name: 'hands',
            message: `${player.name} ($${
                player.cash
                }): How many hands do you want to play?`,
            choices: [
                { name: '0', value: 0 },
                { name: '1', value: 1 },
                { name: '2', value: 2 },
            ],
            default: 1,
        });
        return answer.hands;
    }

    /**
     * Gets the amount a player will bet on a certain hand.
     * @param {Player} player - Player to ask.
     * @param {Number} hand_no - Which hand to get the bet for - array index not object.
     * @async
     * @returns {Number} Amount of the bet.
     */
    async get_bet(player, hand_no) {
        const answer = await prompt({
            type: 'input',
            name: 'bet',
            message: `\n${player.name} ($${player.cash}) - Hand ${hand_no +
                1}: Enter your stake (must be a multiple of ${this.stake})\n`,
            default: this.stake,
            filter: ui => Number(ui),
            validate: ui => ui % this.stake === 0 && !isNaN(ui),
        });
        return answer.bet;
    }

    /**
     * Get the number of hands bets of all players.
     * @async
     */
    async get_initial_bets() {
        let queue_to_remove = [];
        for (let player of this.players) {
            let bet = 0;
            let hands = 1;
            if (player.human) {
                hands = await this.get_hands(player);
                if (hands == 0) {
                    queue_to_remove.push(player);
                    if (this.players.length - queue_to_remove.length === 0) {
                        process.exit();
                    }
                    continue;
                }
                player.set_hands(hands);
                for (let i = 0; i < hands; i++) {
                    bet = await this.get_bet(player, i);
                    player.bet(i, bet);
                }
            } else {
                bet =
                    Math.random() * 100 < 85
                        ? (bet = this.stake)
                        : (bet = this.stake * 2);
            }
        }
        for (let player of queue_to_remove) {
            this.remove_player(player);
        }
    }

    /**
     * Deal the initial two cards to each player, with the dealer's second card being hidden.
     * @param {Deck} deck - The deck to deal cards from.
     * @async
     * @todo fix blackjack logic
     * @returns {Deck} Updated deck with dealt cards removed.
     */
    async inital_deal(deck) {
        let _deck = deck;
        for (let i = 0; i < 2; i++) {
            for (let player of this.players) {
                for (let p_hand of player.hands) {
                    _deck = await this.dealer.deal(p_hand, _deck, false);
                    if (
                        p_hand.cards.length == 2 &&
                        p_hand.get_highest_val() == 21
                    ) {
                        p_hand.blackjack = true;
                        if (
                            !(
                                this.dealer.hand.cards[0].value[0] === [10] ||
                                this.dealer.hand.cards[0].value[1] === [11]
                            )
                        ) {
                            p_hand.playing = false;
                            player.blackjack(p_hand);
                        }
                    }
                }
            }
            _deck = await this.dealer.deal(this.dealer.hand, _deck, i == 1);
        }
        return _deck;
    }

    /**
     * Prompt a human player for their chocie of how to play.
     * @param {Player} player - Player to be asked.
     * @param {Hand} hand - Hand that the player is playing.
     * @async
     * @returns {string} Choice of action e.g. 'hit'.
     */
    async get_hand_choice(player, hand) {
        const answer = await prompt({
            type: 'list',
            name: 'action',
            message: `\n\n\n${
                this.dealer.name
                } has: \n  ${this.dealer.hand.disp_cards()} \n${
                player.name
                }: \n  ${hand.disp_cards()}\n`,
            choices: [
                { name: 'hit', value: 'hit' },
                { name: 'stand', value: 'stand' },
                { name: 'double down', value: 'double down' },
            ],
            default: 1,
        });
        return answer.action;
    }

    /**
     * Deal another card to a player.
     * @param {Player} player - Player in question.
     * @param {Deck} deck - Deck the card will be drawn from.
     * @param {Hand} hand - Hand the player is playing.
     * @param {Number} hand_no - Array index of the hand.
     * @async
     * @returns {(Deck[]|boolean[])} Updated deck with dealt card removed, boolean indicating whether the hand is still being played.
     */
    async hit(player, deck, hand, hand_no) {
        let _deck = deck;
        let stop = false;
        _deck = await this.dealer.deal(hand, _deck, false);
        if ((await hand.get_highest_val()) > 21) {
            console.log(
                `\n${player.name} (hand ${hand_no +
                1}) - bust on ${await hand.get_highest_val()})`
            );
            stop = true;
        }
        return [_deck, stop];
    }

    /**
     * Loop through players and get their choices on how to play their hands.
     * @param {Deck} deck - Deck to be used.
     * @async
     * @returns {Deck} Updated deck with dealt cards removed.
     */
    async player_choices(deck) {
        let _deck = deck;
        for (let player of this.players) {
            let hand_no = 0;
            for (let p_hand of player.hands) {
                let stop = false;
                while (!stop) {
                    let choice = '';
                    if (player.human) {
                        if (!p_hand.blackjack) {
                            choice = await this.get_hand_choice(player, p_hand);
                        } else {
                            continue;
                        }
                    } else {
                        choice = 'stand';
                    }

                    switch (choice) {
                        case 'hit':
                            const res = await this.hit(
                                player,
                                _deck,
                                p_hand,
                                hand_no
                            );
                            _deck = res[0];
                            stop = res[1];
                            break;
                        case 'stand':
                            console.log(
                                `\n${player.name} (hand ${hand_no +
                                1}) - stood on ${await p_hand.get_highest_val()}`
                            );
                            stop = true;
                            break;
                    }
                }
                hand_no++;
            }
        }
        return _deck;
    }

    /**
     * Pay all players who had a blackjack that wasn't paid instantly.
     * @async
     */
    async pay_blackjacks() {
        for (let player of this.players) {
            for (let p_hand of player.hands) {
                if (p_hand.blackjack && p_hand.playing) {
                    player.blackjack(p_hand);
                    p_hand.playing = false;
                }
            }
        }
    }

    /**
     * Reveal the dealer's hidden card.
     * @async
     * @returns {Number} - Value of the delaers hand.
     */
    async dealer_reveal() {
        const hidden_card = await this.dealer.reveal_card();
        let dealer_val = await this.dealer.hand.get_highest_val();
        if (dealer_val !== 21) {
            await this.pay_blackjacks();
        }
        console.log(
            `\nDealer revealed a ${
            hidden_card.name
            } to have a value of (${await this.dealer.hand.get_highest_val()})`
        );
        console.log(
            `\n${this.dealer.name} has: \n  ${this.dealer.hand.disp_cards()}`
        );
        return dealer_val;
    }

    /**
     * Play out the dealer's hand following the rules of blackjack.
     * @param {Number} dealer_val - The value of the dealers hand, from Hand.get_highest_val().
     * @param {Deck} deck - The deck to be used.
     * @async
     * @returns {(Number[]|Deck[])} Updated value of delaers hand, updated deck with dealt cards removed.
     */
    async dealer_logic(dealer_val, deck) {
        let _deck = deck;
        while (dealer_val < 17) {
            console.log('Dealer hits');
            _deck = await this.dealer.deal(this.dealer.hand, _deck, false);
            console.log(
                `\n${
                this.dealer.name
                } has: \n  ${this.dealer.hand.disp_cards()}`
            );
            dealer_val = await this.dealer.hand.get_highest_val();
        }

        if (dealer_val > 21) {
            console.log(`${this.dealer.name} busts on ${dealer_val}`);
        } else if (dealer_val >= 17) {
            console.log(`${this.dealer.name} stands on ${dealer_val}`);
        }
        return [dealer_val, _deck];
    }

    /**
     * Determine if a player won, lost or were pushed by the dealer.
     * @param {Player} player - Player to pay.
     * @param {Hand} hand - Hand that is being played.
     * @param {Number} dealer_val - Value of the dealers hand. From Hand.get_highest_val().
     * @param {Number} hand_no - Array index of the hand being played.
     * @async
     */
    async win_calculation(player, hand, dealer_val, hand_no) {
        let hand_val = await hand.get_highest_val();
        let p_busts = hand_val > 21;
        let d_busts = dealer_val > 21;
        if ((d_busts || hand_val > dealer_val) && !p_busts) {
            player.win(hand);
            console.log(
                `${player.name} (hand ${hand_no + 1}) wins with ${hand_val}`
            );
        } else if (hand_val === dealer_val && !p_busts && !d_busts) {
            player.standoff(hand);
            console.log(
                `${player.name} (hand ${hand_no +
                1}) stood off with ${hand_val}`
            );
        } else if (hand_val < dealer_val && !d_busts) {
            console.log(
                `${player.name} (hand ${hand_no + 1}) lost with ${hand_val}`
            );
        } else if (p_busts) {
            console.log(
                `${player.name} (hand ${hand_no + 1}) busted with ${hand_val}`
            );
        }
    }

    /**
     * Loop through all players and hands and determine the outcomes, then reset the hands for the next round.
     * @param {Number} dealer_val - Value of the dealers hand.
     * @async
     */
    async hand_outcome(dealer_val) {
        for (let player of this.players) {
            let hand_no = 0;
            for (let p_hand of player.hands) {
                if (p_hand.playing) {
                    await this.win_calculation(
                        player,
                        p_hand,
                        dealer_val,
                        hand_no
                    );
                }
                hand_no++;
            }
            player.reset_hands();
        }
        this.dealer.hand = new Hand();
    }

    /**
     * Plays a round of blackjack.
     * @param {Deck} deck - Deck to be used.
     * @async
     */
    async hand(deck) {
        await this.get_initial_bets();
        let _deck = await this.inital_deal(deck);
        _deck = await this.player_choices(_deck);
        let dealer_val = await this.dealer_reveal();
        let res = await this.dealer_logic(dealer_val, _deck);
        dealer_val = res[0];
        _deck = res[1];
        await this.hand_outcome(dealer_val);
    }

    /**
     * Plays a new round of blackjack until a user cancels operation.
     * @async
     */
    async gameloop() {
        while (true) {
            await this.hand(this.deck.cards);
        }
    }
}

module.exports = { Game };
