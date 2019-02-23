# Blackjack CLI

A completly CLI implementation of the classic game Blackjack, written in Node.JS. The project is fully object-oriented and follows strict linting and documentation practises.

## Installation
1. Clone this repo
2. `npm install`

## Usage
```
Usage: blackjack [options] [command]

Welcome to Shell Blackjack!

Options:
  -V, --version     output the version number
  -h, --help        output usage information

Commands:
  play              Start a new game of blackjack
  config <setting>  Configure the settings of the games
```

### Playing a game
$ `blackjack play`

There will be some config prompts where you can choose the table stake, decide how many human and cpu players, and name the human players.

After these prompts you are now in the game. 

**Game process:**
1. Every round starts with a choice of how many hands you want to play
2. After choosing the amount of hands you enter a stake for each hand
3. When all hands have had a stake attached the game will begin
4. The cards will be dealt. As per the rules of blackjack you will be able to see only one of the dealer's two cards. Your cards will be displayed and you will have an option to *hit*, *stand* or *double down*
5. After every hand is played (either the player stands or busts) the dealer will reveal his face-down card and then either stand or hit based on the rules of blackjack.
6. After the dealer's actions, all payouts are made. The next round now starts.

### Customisation
In the config.yml file you are able to choose the foreground and background colours for  each suit. Please note these must be ANSI colors, and have been defined in colors.js
```yaml
colours:
  diamonds:
    fg: blue
  hearts:
    fg: red
  clubs:
    fg: black
    bg: white
  spades:
    fg: green
```

These colours can be edited from the CLI, using the `blackjack config color` command.

### Example output

```
Dealer has: 
  ♠9 - (9)
 
Alex: 
  ♥5 ♥6 - (11)

? hit

Dealer has: 
  ♠9 - (9)
 
Alex: 
  ♥5 ♥6 ♣9 - (20)

 (Use arrow keys)
  hit 
❯ stand 
  double down 

```