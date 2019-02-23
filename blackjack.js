#!/usr/bin/env node

const program = require('commander');
const { prompt } = require('inquirer');
const { Game } = require('./lib/game');
const { set_colours } = require('./config/config');

const new_game = (cpus, humans, stake) => {
    new Game(cpus, humans, stake);
};

program.version('0.0.1').description('Welcome to Shell Blackjack!');

const play_questions = [
    {
        type: 'list',
        name: 'stake',
        message: 'Choose the table stake',
        choices: [
            { value: 15, name: '$15' },
            { value: 50, name: '$50' },
            { value: 100, name: '$100' },
            { value: 500, name: '$500' },
        ],
        default: 15,
    },
    {
        type: 'list',
        name: 'humans',
        message: 'How many human players?',
        choices: [
            { value: 1, name: '1' },
            { value: 2, name: '2' },
            { value: 3, name: '3' },
            { value: 4, name: '4' },
        ],
        default: 0,
    },
    {
        type: 'list',
        name: 'cpus',
        message: 'How many cpu players?',
        choices: [
            { value: 0, name: '0' },
            { value: 1, name: '1' },
            { value: 2, name: '2' },
            { value: 3, name: '3' },
            { value: 4, name: '4' },
        ],
        default: 0,
    },
];

program
    .command('play')
    .description('Start a new game of blackjack')
    .action(() => {
        prompt(play_questions).then(answers =>
            new_game(answers.cpus, answers.humans, answers.stake)
        );
    });

program
    .command('config <setting>')
    .description('Configure the settings of the games')
    .action(setting => {
        switch (setting) {
            case 'color':
            case 'colour':
                set_colours();
                break;
            default:
                program.outputHelp();
                break;
        }
    });

program.parse(process.argv);
