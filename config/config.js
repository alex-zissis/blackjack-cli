'use strict';
/*
    controls all of the user configurable options.
*/
const { prompt } = require('inquirer');
const fs = require('fs');
const YAML = require('yaml');

const { fg, bg } = require('./colours');

/**
 * Reads the config.yml file into a JSON object.
 * @exports
 * @returns {Object} JSON object of the config.yml file.
 */
const read_config = () => {
    const contents = fs.readFileSync('config/config.yml', { encoding: 'utf8' });
    return YAML.parse(contents);
};

/**
 * Writes a JSON object to the config.yml file. Must be passed the entire config object.
 * @param {Object} config - JSON object of the config.yml file.
 */
const write_config = config => {
    fs.writeFileSync('config/config.yml', YAML.stringify(config), {
        encoding: 'utf8',
    });
};

/**
 * Gets all of the available foreground/background ansi colours from the colours.js file.
 * @param {string} colour_type - 'fg' or 'bg'. Defines which colour set to return.
 * @returns {Object[]} arr - an array of colour choice objects, with name and value being equal (quirk of framework).
 */
const get_colour_choices = colour_type => {
    const col_arr = colour_type === 'fg' ? fg : bg;
    let arr = [];
    for (const colour in col_arr) {
        arr.push({ name: colour, value: colour });
    }
    return arr;
};

/**
 * Gets the current colour assigned to a suit.
 * @param {string} suit - the suit that we are looking up.
 * @param {Object} config - the current config object, from read_config().
 * @param {string} colour_type - 'fg' or 'bg'. Whether to get the foreground or background colour.
 * @returns {string} a string of the colour.
 */
const get_default_colour = (suit, config, colour_type) => {
    for (let suit_obj in config.colours) {
        if (suit_obj === suit) {
            for (let type in config.colours[suit_obj]) {
                if (type === colour_type) {
                    return config.colours[suit_obj][type];
                }
            }
        }
    }
    return null;
};

/**
 * Prompts the user to choose new fg and bg colours for each suit.
 * @async
 * @exports
 */
const set_colours = async () => {
    const config = read_config();
    const fg_choices = get_colour_choices('fg');
    const bg_choices = get_colour_choices('bg');
    bg_choices.unshift({ name: 'null', value: null });
    for (const suit in config.colours) {
        const fg_colour = get_default_colour(suit, config, 'fg');
        const bg_colour = get_default_colour(suit, config, 'bg');
        await prompt([
            {
                type: 'list',
                name: 'fg',
                message: `Choose the foreground for colour ${suit}`,
                choices: fg_choices,
                default:
                    //if the colour is already defined set that index as default, else 0.
                    fg_colour !== null
                        ? fg_choices.findIndex(x => x.name === fg_colour)
                        : 0,
            },
            {
                type: 'list',
                name: 'bg',
                message: `Choose the background for colour ${suit}`,
                choices: bg_choices,
                default:
                    //if the colour is already defined set that index as default, else 0.
                    bg_colour !== null
                        ? bg_choices.findIndex(x => x.name === bg_colour)
                        : 0,
            },
        ]).then(answers => {
            config.colours[suit]['fg'] = answers.fg;
            //as bg is optional.
            if (answers.bg !== null) {
                config.colours[suit]['bg'] = answers.bg;
            } else {
                delete config.colours[suit]['bg'];
            }
        });
    }
    write_config(config);
};

module.exports = { set_colours, read_config };
