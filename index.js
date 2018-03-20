"use strict";

const Discord = require('discord.js');
const client = new Discord.Client();
const fs = require('fs');
const auth = require("./auth.json");
// const commands = require("./commands.js");

var tictacgame, symbols = ["x","o"], botlines, nr, map = {};

class Command {
	
	constructor (message) {
	
        this._commandName = message.content.substring(1).split(' ')[0];
       
    }

	doCommand(message){
    	switch(this._commandName) {
        
            case 'ping':
            	message.reply('pong');
            	break; 
		    case 'encourage':
		    	message.reply(botlines.encourage[getRandomInt(9)]);
		    	break;
			case 'speak': 
				message.reply(botlines.speak[getRandomInt(14)]);
				break;
			case 'say':
				message.reply(message.content.substring(4));
				break;
			case 'commands':
				message.reply("the commands are: \0 >ping; \0 >encourage \0 >speak \0 >say \0 >tictactoe \0 >commands");
				break;	
			case 'tictactoe': 
				tictacgame = new TicTacToe(message);
				tictacgame.startGame(message);
				break;
			case 'mark':
				if(tictacgame == undefined)
					message.reply("there is no ongoing tic tac toe game in this channel, dummy.");
				if(message.content.substring(1).split(' ').length != 3 || 
						 ( message.content.substring(1).split(' ')[1] != 0 && 
						   message.content.substring(1).split(' ')[1] != 1 &&
						   message.content.substring(1).split(' ')[1] != 2 
					) || ( message.content.substring(1).split(' ')[2] != 0 && 
						   message.content.substring(1).split(' ')[2] != 1 &&
						   message.content.substring(1).split(' ')[2] != 2
					)
				) 
					message.reply("wrong move, expected coordinates between 0 and 2. Try again.");
				else tictacgame.playGame(message);
				// if(tictacgame.endGame(message)){
				// 	tictacgame = null;
				// 	delete tictacgame;
				// }
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
		
		for (var i in map) {
			if(i == this._gameChannel && map[i] == "tictactoe"){
				message.reply("there's already an ongoing game in this channel.");
				return;
			}
			
		}

		map[this._gameChannel] = "tictactoe";

		if(this._players[1][0] != '<' && this._players[1][1] != '@'){

			message.reply("wrong command, you dummy. Expected >tictactoe @<username>, got something else.");
			return;
		}

		this._players[1] = this._players[1].slice(2,20);
	
		message.reply("you started a game with <@" + this._players[1] + ">. <@" + this._players[0] + ">, make your first move.");
		 
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

	endGame (message) {

		for (var i in map){
			if(i==this._gameChannel && map[i] == "tictactoe")
				map[i] = "";
		}
		
		message.reply("The game has ended");

		map[this._gameChannel] = "";

		return true;

	}

	didTheGameEnd (i,j) {

		if ((this._gameBoard[0][j] != '-' && this._gameBoard[0][j] == this._gameBoard[1][j] && this._gameBoard[1][j] == this._gameBoard[2][j]) ||
			(this._gameBoard[i][0] != '-' && this._gameBoard[i][0] == this._gameBoard[i][1] && this._gameBoard[i][1] == this._gameBoard[i][2]) ||
			(this._gameBoard[0][0] != '-' && this._gameBoard[0][0] == this._gameBoard[1][1] && this._gameBoard[1][1] == this._gameBoard[2][2]) ||
			(this._gameBoard[0][2] != '-' && this._gameBoard[0][2] == this._gameBoard[1][1] && this._gameBoard[1][1] == this._gameBoard[2][0]))
			return true;

		for(var x=0;x<2;x++)
			for(var y=0;y<2;y++)
				if(this._gameBoard[x][y] == '-')
					return false;

		return true;

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

		if(this.didTheGameEnd(i,j)){
			message.channel.send("Game ended.");
			return;
		}

		message.channel.send("<@" + this._players[this._turn] + ">, make your move.");
	}

}

fs.readFile('./botlines.json', 'utf8', function (err, data) {
	if (err) return console.error(err);
	botlines = JSON.parse(data);
});

function getRandomInt(max) {
	return Math.floor(Math.random() * Math.floor(max));
}

client.on('ready', function() {
	console.log('I am ready!');
	
});

client.on('message', async function(message) {
	
	if(message.author.bot) return;

	if (message.content.substring(0, 1) == '>') {           	
		var command = new Command(message);
		command.doCommand(message);
	}
});

client.login(auth.token);