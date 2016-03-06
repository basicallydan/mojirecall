var bind = require('lodash/bind');
var sampleSize = require('lodash/sampleSize');

var emoticonsRange = [0x1F601, 0x1F64F];
var dingbatsRange = [0x2702, 0x27B0];
var transportMapsRange = [0x1F680, 0x1F6C0];
var tailRange = [0x2668, 0xF5FF];
var thinkingEmoji = 0x1F914;

allEmoji = require('./createEmojiArray')([emoticonsRange, transportMapsRange]);

function Game() {
	var currentRoundNumber = 0;
	var startingRecallCount = 2;
	this.recallCount = startingRecallCount;
	// At the end of each round, the information about the round is put into
	// this array. Not before.
	this.rounds = [];

	this.generateRound = bind(function () {
		var numberOfChoices = Math.min(this.recallCount * 5, allEmoji.length);
		var choices = sampleSize(allEmoji, numberOfChoices);
		var stage = sampleSize(choices, this.recallCount);

		this.currentRound = {
			numberOfChoices: numberOfChoices,
			recallCount: this.recallCount,
			choices: choices,
			stage: stage,
			answer: [],
			startTime: Date()
		}

		return this.currentRound;
	}, this);
}

Game.prototype.finishCurrentRound = function () {
	var timeTaken = Date() - this.currentRound.startTime;

	this.currentRound.timeTaken = timeTaken;
	this.rounds.push(this.currentRound);
	this.currentRound = [];
	this.recallCount += 1;
}

module.exports = Game;
