"use strict";

const Discord = require('discord.js');
const client = new Discord.Client();
const fs = require('fs');
const auth = require("./auth.json");
//var commands = require("./commands.js");

var botlines, tictacgame, symbols = ["x","o"],  map = {}, nr;

class Command {
	
	constructor (message) {
	
		this._commandName = message.content.substring(1).split(' ')[0];
		this._argsNumber = message.content.substring(1).split(' ').length - 1;
		this._commandArgs = [];
		for(var i = 1; i <= this._argsNumber; i++ ){
			this._commandArgs[i-1] = message.content.substring(1).split(' ')[i];
		}
		this._commandChannel = message.channel.id;

	}

	doCommand (message) {

    	switch(this._commandName) {
        
            case 'ping': message.reply('pong'); break; 
		    case 'encourage': message.reply(botlines.encourage[getRandomInt(9)]); break;
			case 'speak': message.channel.send(botlines.speak[getRandomInt(14)]); break;
			case 'say': message.channel.send(message.content.substring(4)); break;
			case 'commands': message.channel.send("the commands are: ping, encourage, speak, say, tictactoe, mark, mastermind, guess, commands"); break;	
			case 'tictactoe':

				if( this._argsNumber != 1) {

					message.reply("wrong command, you dummy. Expected >tictactoe @<username>, got something else.");
					return;
				}

				var player2 = this._commandArgs[0].slice(2);
				player2 = player2.slice(0,player2.length - 1);

				var membersArray = message.guild.members.array();
				var player2IsMember = false;

				for(var i in membersArray){
					if(message.guild.members.array()[i].user.id === player2)
						player2IsMember = true;
				}

				if(!player2IsMember){
					message.reply("wrong command, you dummy. Expected >tictactoe @<username>, got something else.");
					return;
				}

				if(map[this._commandChannel]){

					message.reply("there's already an ongoing game in this channel.");
					return;

				}
				
				map[this._commandChannel] = new TicTacToe(message);
				map[this._commandChannel].startGame(message);
				break;
			case 'mastermind':
				for (var i in map) {
					if(map[message.channel.id]){
						message.reply("there's already an ongoing game in this channel.");
						return;
					}
				}

				map[message.channel.id] = new Mastermind(message);
				map[message.channel.id].startGame(message);
				break;
			case 'guess':
				if(!map[message.channel.id]){
						message.reply("there is no ongoing mastermind game in this channel, dummy.");
						return;
					}

					if( this._argsNumber != 1) {

						message.reply("wrong command, you dummy. Expected >tictactoe @<username>, got something else.");
						return;
					}

				map[message.channel.id].playGame(message);
				break;
			case 'mark':
				if(!map[message.channel.id]){
						message.reply("there is no ongoing tic-tac-toe game in this channel, dummy.");
						return;
					}
				if(message.content.substring(1).split(' ').length != 3 || 
						 ( message.content.substring(1).split(' ')[1] != 0 && 
						   message.content.substring(1).split(' ')[1] != 1 &&
						   message.content.substring(1).split(' ')[1] != 2 
					) || ( message.content.substring(1).split(' ')[2] != 0 && 
						   message.content.substring(1).split(' ')[2] != 1 &&
						   message.content.substring(1).split(' ')[2] != 2
					)
				) {
					message.reply("wrong move, expected coordinates between 0 and 2. Try again.");
				return;
				}
				else map[message.channel.id].playGame(message);
				break;
			break;
		}
	}
}

class Game {

	constructor (){
		this._gameChannel = 0;
		this._players = [];
	}

	startGame(message){}
	endGame(message){}
	playGame(message){}
}

class TicTacToe extends Game {
	
	constructor (message) {
		super();
		this._gameChannel = message.channel.id;
		this._players[0] = message.author.id;
		this._players[1] =  message.content.substring(1).split(' ')[1];
		this._turn = 0;
		this._gameBoard = [ [..."---"],
							[..."---"],
							[..."---"]
						  ];
	}

	startGame (message) {

		this._players[1] = this._players[1].slice(2,20);
	
		message.reply("you started a game of tic-tac-toe with <@" + this._players[1] + ">. Say >mark <row> <column> to make your first move.");
		 
		message.channel.send(this._gameBoard[0][0] + " " +
							 this._gameBoard[0][1] + " " +
							 this._gameBoard[0][2] + " \n" +
							 this._gameBoard[1][0] + " " +
							 this._gameBoard[1][1] + " " +
							 this._gameBoard[1][2] + " \n" +
							 this._gameBoard[2][0] + " " +
							 this._gameBoard[2][1] + " " +
							 this._gameBoard[2][2] + " ");
	}

	endGameWin (message) {

		for (var i in map){
			if(i==this._gameChannel && map[i] == "tictactoe")
				map[i] = "";
		}
		
		message.channel.send("<@" + this._players[this._turn] + "> won. Great moves, keep it up, proud of ya!");

		map[this._gameChannel] = "";

		return true;

	}

	endGameDraw (message) {
		
		message.channel.send("It's a draw. Wah-wah.");

		map[this._gameChannel] = "";

		return true;

	}

	isItADraw () {
		for(var x=0;x<3;x++)
			for(var y=0;y<3;y++)
				if(this._gameBoard[x][y] == '-')
					return false;

		return true;
	}

	isItAWin (i,j) {
		if ((this._gameBoard[0][j] != '-' && this._gameBoard[0][j] == this._gameBoard[1][j] && this._gameBoard[1][j] == this._gameBoard[2][j]) ||
			(this._gameBoard[i][0] != '-' && this._gameBoard[i][0] == this._gameBoard[i][1] && this._gameBoard[i][1] == this._gameBoard[i][2]) ||
			(this._gameBoard[0][0] != '-' && this._gameBoard[0][0] == this._gameBoard[1][1] && this._gameBoard[1][1] == this._gameBoard[2][2]) ||
			(this._gameBoard[0][2] != '-' && this._gameBoard[0][2] == this._gameBoard[1][1] && this._gameBoard[1][1] == this._gameBoard[2][0]))
			return true;
		return false;
	}

	playGame (message) {

		if(message.author.id != this._players[this._turn]){
			message.reply("not your turn. Cease immediately. Or else.");
			return;
		}

		var i = message.content.substring(1).split(' ')[1];
		var j = message.content.substring(1).split(' ')[2];

		if(i <0 || i>2 || j<0 || j>2) {
			message.reply("wrong move, expected coordinates between 0 and 2. Try again.");
			return;
		}

		if(this._gameBoard[i][j] != "-") {
			message.reply("wrong move, that position's taken. Find somewhere else to go.");
			return;
		}

		this._gameBoard[i][j] = symbols[this._turn];

		message.channel.send(this._gameBoard[0][0] + " " +
							 this._gameBoard[0][1] + " " +
							 this._gameBoard[0][2] + " \n" +
							 this._gameBoard[1][0] + " " +
							 this._gameBoard[1][1] + " " +
							 this._gameBoard[1][2] + " \n" +
							 this._gameBoard[2][0] + " " +
							 this._gameBoard[2][1] + " " +
							 this._gameBoard[2][2] + " ");

		this._turn = this._turn == 1 ? 0 : 1;

		if(this.isItADraw()){
			this.endGameDraw(message);
			return;
		}

		if(this.isItAWin(i,j)){
			this.endGameWin(message);
			return;
		}

		message.channel.send("<@" + this._players[this._turn] + ">, make your move.");
	}

}

class Mastermind extends Game {

	constructor (message) {
		super();
		this._gameChannel = message.channel.id;
		this._players[0] = message.author.id;
		this._numberToGuess = "";
		this._nrOfDigits = 5;
		this._gameBoard = [];
		this._guesses = 0;
	}

	startGame(message) {

			message.reply("you started a game of mastermind. I'm thinking of a number...");

			this._numberToGuess = getRandomIntInclusive(10000,99999).toString();

			message.channel.send("I thought of a " + this._nrOfDigits + " digit number. Say >guess <number> to make your first guess!");

			message.channel.send("_ _ _ _ _");

			this._gameBoard = [];

	}

	playGame(message) {

		if(message.author.id != this._players[0]){
			message.reply("not your turn. Cease immediately. Or else.");
			return;
		}

		var number = message.content.substring(1).split(' ')[1];

		if(number.length != this._nrOfDigits || isNaN(parseInt(number, 10)) ) {
			message.reply("not a valid number. Give a number with " + this._nrOfDigits + " digits.");
			return;
		}

		this._gameBoard[this._guesses + 1] = number;
		this._guesses = this._guesses + 1;

		if(this._guesses == 20 && this._gameBoard[this._guesses] != this._numberToGuess) {
			message.reply("you guessed 20 times already and you didn't get it right. You lost. The number was " + this._numberToGuess + ".");
			map[this._gameChannel] = "";
			return;
		}

		if(this._gameBoard[this._guesses] == this._numberToGuess) {
			message.reply("you guessed it right! You won. The number was " + this._numberToGuess + ".");
			map[this._gameChannel] = "";
			return;
		}
		
		var digitsOnPosition = 0, digitsNotOnPosition = 0;

		for(var i=0; i<this._nrOfDigits; i++) {
			if (this._gameBoard[this._guesses][i] == this._numberToGuess[i])
				digitsOnPosition = digitsOnPosition + 1;
			else if (this._gameBoard[this._guesses].indexOf(this._numberToGuess[i]) != -1 )
				digitsNotOnPosition = digitsNotOnPosition + 1;
		}

		message.channel.send("You got " + digitsOnPosition + " digits on their position and " + digitsNotOnPosition + " digits that aren't on their position. Take another guess.")

	}
}

fs.readFile('./botlines.json', 'utf8', function (err, data) {
	if (err) return console.error(err);
	botlines = JSON.parse(data);
});

function getRandomInt(max) {
	return Math.floor(Math.random() * Math.floor(max));
}

function getRandomIntInclusive(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

client.on('ready', function() {
	console.log('I am ready!');
	client.user.setUsername("ecksdeeBot");
	
});

client.on('message', async function(message) {
	
	if(message.author.bot) return;

	if (message.content.substring(0, 1) == '>') {           	
		var command = new Command(message);
		command.doCommand(message);
	}
});

client.login(auth.token);