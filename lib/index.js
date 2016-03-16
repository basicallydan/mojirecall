var delay = require('lodash/delay');
var difference = require('lodash/difference');
var pull = require('lodash/pull');
var forEach = require('lodash/forEach');
var bonzo = require('bonzo');
var request = require('request');
var Firebase = require('firebase');

var database = new Firebase('https://sizzling-heat-2008.firebaseio.com/');
var dataStore = database.child('moji-stories');

var thinkingEmoji = 0x1F914;

var isEmojiSupported = require('./isEmojiSupported');

var timeChoicesShown;
var currentGame;
var games = [];

var Game = require('./Game');

var startRecallExperiment = document.getElementById('startRecallExperiment');
var startRecallForm = document.getElementById('startRecallForm');
var instructionPanel = document.getElementById('instructions');
var resultsPanel = document.getElementById('resultsPanel');
var tryAgainButton = document.getElementById('tryAgain');
var resultsSummary = document.getElementById('resultsSummary');
var roundResults = document.getElementById('roundResults');
var recallChoices = document.getElementById('recallChoices');
var recallSelection = document.getElementById('recallSelection');
var currentTestPanel = document.getElementById('currentTestPanel');
var currentRoundResult = document.getElementById('currentRoundResult');
var nextRoundButton = document.getElementById('nextRoundButton');
var noStoryNextRoundButton = document.getElementById('noStoryNextRoundButton');
var submitStoryButton = document.getElementById('submitStoryButton');
var storyForm = document.getElementById('storyForm');
var storyInputAuthor = document.getElementById('storyInputAuthor');
var storyInputContent = document.getElementById('storyInputContent');

var $startRecallForm = bonzo(startRecallForm);
var $instructionPanel = bonzo(instructionPanel);
var $resultsPanel = bonzo(resultsPanel);
var $resultsSummary = bonzo(resultsSummary);
var $roundResults = bonzo(roundResults);
var $recallChoices = bonzo(recallChoices);
var $recallSelection = bonzo(recallSelection);
var $currentTestPanel = bonzo(currentTestPanel);
var $currentRoundResult = bonzo(currentRoundResult);
var $storyForm = bonzo(storyForm);
var $storyInputAuthor = bonzo(storyInputAuthor);
var $storyInputContent = bonzo(storyInputContent);

function resetUI() {
	$resultsPanel.addClass('hidden');
	$instructionPanel.addClass('hidden');
	$startRecallForm.removeClass('hidden');
}

function showInstructionHTML(text) {
	$instructionPanel.removeClass('hidden');
	$instructionPanel.html(text);
}

function showGameOver() {
	var h = 0;
	$resultsSummary.text('The best you can recall is ' + (currentGame.recallCount - 1));

	for (h = 0; h < currentGame.rounds.length; h++) {
		$roundResults.append(
			`<h3>Round ${(h + 2)} </h3>` +
			'<h4>You were shown:</h4>' +
			`<div class="emoji-list">${(currentGame.rounds[h].stage.join(' '))}</div>` +
			'<h4>You answered:</h4>' +
			`<div class="emoji-list">${(currentGame.rounds[h].answer.join(' '))}</div>`
		);
	}

	games.push(currentGame);

	tryAgainButton.addEventListener('click', resetUI, false);
	$instructionPanel.addClass('hidden');
	$resultsPanel.removeClass('hidden');
	$currentTestPanel.addClass('hidden');
	$recallChoices.empty();
	$recallSelection.empty();
}

function addSelection(emojiText) {
	var $selectionSpan = bonzo(recallSelection.children).first();
	var round = currentGame.currentRound;
	round.answer.push(emojiText);

	while (!$selectionSpan.hasClass('emoji-selection-empty')) {
		$selectionSpan = $selectionSpan.next();
	}

	$selectionSpan.removeClass('emoji-selection-empty');
	$selectionSpan.addClass('emoji-selection');
	$selectionSpan.text(emojiText);

	$selectionSpan[0].addEventListener('click', removeSelection, false);
}

function removeSelection() {
	var round = currentGame.currentRound;
	$this = bonzo(this);

	pull(round.answer, $this.text());

	if ($this.next().hasClass('emoji-selection-empty')) {
		$this.text('?');
		$this.addClass('emoji-selection-empty');
		$this.removeClass('emoji-selection');
	} else {
		$this.text('?');
		$this.addClass('emoji-selection-empty');
		$this.removeClass('emoji-selection');
		$this.remove().appendTo($recallSelection);
	}
}

function showStoryForm() {
	$storyForm.removeClass('hidden');
}

function showCorrectMessage() {
	$currentRoundResult.removeClass('hidden');
}

function verifyChoices() {
	var round = currentGame.currentRound;
	if (round.answer.length === currentGame.recallCount) {
		if (difference(round.answer, round.stage).length === 0) {
			if (round.recallCount >= currentGame.askStoriesAfterRecallCount) {
				showStoryForm();
			} else {
				showCorrectMessage();
			}
		} else {
			alert('Nope. You were shown:\n' + round.stage.join(' ') + '\nBut your answer was:\n' + round.answer.join(' ') + '\n\nBetter luck next time.');
			showGameOver();
		}
	}
}

function showChoices() {
	var m = 0;
	var b = 0;
	var choiceButton, emptySelection;

	timeChoicesShown = Date();

	for (b = 0; b < currentGame.recallCount; b++) {
		emptySelection = document.createElement('span');
		bonzo(emptySelection).addClass('emoji emoji-selection-empty');
		bonzo(emptySelection).text('?');
		$recallSelection.append(emptySelection);
	}

	for (m = currentGame.currentRound.choices.length - 1; m >= 0; m--) {
		choiceButton = document.createElement('a');
		bonzo(choiceButton).addClass('emoji emoji-choice');
		bonzo(choiceButton).text(currentGame.currentRound.choices[m]);
		// TODO: Unbind these puppies
		choiceButton.addEventListener('click', function() {
			var emojiText = bonzo(this).text();
			addSelection(emojiText);
			verifyChoices();
		}, false);
		$recallChoices.append(choiceButton);
	}

	$currentTestPanel.removeClass('hidden');
	$instructionPanel.addClass('hidden');
}

function nextStage() {
	var round = currentGame.generateRound();

	// Reset for the next level
	$currentTestPanel.addClass('hidden');
	$recallChoices.empty();
	$recallSelection.empty();
	$startRecallForm.addClass('hidden');
	$currentRoundResult.addClass('hidden');
	$storyForm.addClass('hidden');

	delay(showInstructionHTML, 0, '<span class="large-central-instruction">3</span>');
	delay(showInstructionHTML, 1000, '<span class="large-central-instruction">2</span>');
	delay(showInstructionHTML, 2000, '<span class="large-central-instruction">1</span>');
	delay(showInstructionHTML, 3000, '<span class="large-central-instruction">GO!</span>');

	forEach(round.stage, function (moji, index) {
		delay(
			showInstructionHTML,
			3000 + (index * 1000),
			'<span class="emoji emoji-flash">' + moji + '</a>'
		);
	});

	delay(showInstructionHTML, 3000 + (round.stage.length * 1000), '<span class="large-central-instruction">Done.</span>');
	delay(showChoices, 3000 + ((round.stage.length + 1) * 1000));
}

startRecallExperiment.addEventListener('click', function() {
	currentGame = new Game();
	nextStage();
}, false);

nextRoundButton.addEventListener('click', function() {
	currentGame.finishCurrentRound();
	nextStage();
}, false);

noStoryNextRoundButton.addEventListener('click', function() {
	currentGame.finishCurrentRound();
	nextStage();
}, false);

submitStoryButton.addEventListener('click', function() {
	var round = currentGame.currentRound;
	var data = {
		story: $storyInputContent.val(),
		round: round.stage
	};
	if ($storyInputAuthor.val()) {
		data.twitter = $storyInputAuthor.val();
	}
	dataStore.push(data);
	currentGame.finishCurrentRound();
	nextStage();
}, false);

if (!isEmojiSupported(thinkingEmoji)) {
	bonzo(document.getElementById('emojiThinkingHeader')).remove();
}
