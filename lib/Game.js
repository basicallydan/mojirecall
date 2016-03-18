var bind = require('lodash/bind');
var sampleSize = require('lodash/sampleSize');

var emoticonsRange = [0x1F601, 0x1F64F];
var dingbatsRange = [0x2702, 0x27B0];
var transportMapsRange = [0x1F680, 0x1F6C0];
var tailRange = [0x2668, 0x3299];
var tailRange2 = [0x1F004, 0x1F5FF];
var thinkingEmoji = 0x1F914;

var allEmoji = require('./createEmojiArray')([emoticonsRange, transportMapsRange]);

function Game() {
	var startingRecallCount = 2;
	this.askStoriesAfterRecallCount = 3;
	this.recallCount = startingRecallCount;
	this.currentRoundNumber = 0;
	// At the end of each round, the information about the round is put into
	// this array. Not before.
	this.rounds = [];

	this.generateRound = bind(function () {
		var numberOfChoices = Math.min(this.recallCount * 5, allEmoji.length);
		var choices = sampleSize(allEmoji, numberOfChoices);
		var stage = sampleSize(choices, this.recallCount);
		++this.currentRoundNumber;

		this.currentRound = {
			numberOfChoices: numberOfChoices,
			recallCount: this.recallCount,
			choices: choices,
			stage: stage,
			answer: [],
			startTime: Date(),
			stageCounter: 0,
			allShown: false
		};


		this.currentRound.getNextEmoji = function () {
			if (!this.stage[this.stageCounter]) {
				this.allShown = true;
			}
			return this.stage[this.stageCounter++];
		}.bind(this.currentRound);

		return this.currentRound;
	}, this);
}

Game.prototype.finishCurrentRound = function (callback) {
	var timeTaken = Date() - this.currentRound.startTime;

	this.currentRound.timeTaken = timeTaken;
	if (callback) {
		callback(this.currentRound);
	}
	this.rounds.push(this.currentRound);
	this.currentRound = null;
	this.recallCount += 1;
};

module.exports = Game;
