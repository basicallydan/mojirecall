var sampleSize = require('lodash/sampleSize');
var delay = require('lodash/delay');
var difference = require('lodash/difference');
var bonzo = require('bonzo');

// Build up the emoji list
var emoticonsRange = [0x1F601, 0x1F64F];
var dingbatsRange = [0x2702, 0x27B0];
var transportMapsRange = [0x1F680, 0x1F6C0];
var tailRange = [0x2668, 0xF5FF];
var thinkingEmoji = 0x1F914;

var isEmojiSupported = require('./isEmojiSupported');

allEmoji = require('./createEmojiArray')([emoticonsRange, transportMapsRange]);

var recallCount = 1;
var currentAnswer = [];

var startRecallExperiment = document.getElementById('startRecallExperiment');
var startRecallForm = document.getElementById('startRecallForm');
var instructionPanel = document.getElementById('instructions');
var resultsPanel = document.getElementById('resultsPanel');
var tryAgainButton = document.getElementById('tryAgain');
var resultsSummary = document.getElementById('resultsSummary');
var recallChoices = document.getElementById('recallChoices');
var recallSelection = document.getElementById('recallSelection');
var currentTestPanel = document.getElementById('currentTestPanel');

var $startRecallForm = bonzo(startRecallForm);
var $instructionPanel = bonzo(instructionPanel);
var $resultsPanel = bonzo(resultsPanel);
var $resultsSummary = bonzo(resultsSummary);
var $recallChoices = bonzo(recallChoices);
var $recallSelection = bonzo(recallSelection);
var $currentTestPanel = bonzo(currentTestPanel);

function randomlySelectFromArray(ar) {
	var item = items[Math.floor(Math.random() * ar.length)];
}

function resetUI() {
	recallCount = 1;
	$resultsPanel.addClass('hidden');
	$instructionPanel.addClass('hidden');
	$startRecallForm.removeClass('hidden');
}

function showInstructionText(text) {
	$instructionPanel.removeClass('hidden');
	$instructionPanel.html(text);
}

function showGameOver() {
	$resultsSummary.text('The best you can recall is ' + (recallCount - 1));
	tryAgainButton.addEventListener('click', resetUI, false);
	$instructionPanel.addClass('hidden');
	$resultsPanel.removeClass('hidden');
	$currentTestPanel.addClass('hidden');
	$recallChoices.empty();
	$recallSelection.empty();
}

function addSelection(emojiText) {
	var $selectionSpan = bonzo(recallSelection.children).first();
	currentAnswer.push(emojiText);

	while (!$selectionSpan.hasClass('emoji-selection-empty')) {
		$selectionSpan = $selectionSpan.next();
	}

	$selectionSpan.removeClass('emoji-selection-empty');
	$selectionSpan.addClass('emoji-selection');
	$selectionSpan.text(emojiText);
}

function verifyChoices(stage) {
	if (currentAnswer.length === recallCount) {
		if (difference(currentAnswer, stage).length === 0) {
			alert('Correct!');
			recallCount += 1;
			nextStage();
		} else {
			alert('Nope. You were shown:\n' + stage.join(' ') + '\nBut your answer was:\n' + currentAnswer.join(' ') + '\n\nBetter luck next time.');
			showGameOver();
		}
	}
}

function showChoices(choices, stage) {
	var m = 0;
	var b = 0;
	var choiceButton, emptySelection;

	for (b = 0; b < recallCount; b++) {
		emptySelection = document.createElement('span');
		bonzo(emptySelection).addClass('emoji emoji-selection-empty');
		bonzo(emptySelection).text('?');
		$recallSelection.append(emptySelection);
	}

	for (m = choices.length - 1; m >= 0; m--) {
		choiceButton = document.createElement('a');
		bonzo(choiceButton).addClass('emoji emoji-choice');
		bonzo(choiceButton).text(choices[m]);
		// TODO: Unbind these puppies
		choiceButton.addEventListener('click', function(event) {
			var emojiText = bonzo(this).text();
			addSelection(emojiText);
			verifyChoices(stage);
		}, false);
		$recallChoices.append(choiceButton);
	}

	$currentTestPanel.removeClass('hidden');
	$instructionPanel.addClass('hidden');
}

function nextStage() {
	var numberOfChoices = Math.min(recallCount * 5, allEmoji.length);
	var choices = sampleSize(allEmoji, numberOfChoices);
	var stage = sampleSize(choices, recallCount);
	currentAnswer = [];
	var m = 0;

	// Reset for the next level
	$currentTestPanel.addClass('hidden');
	$recallChoices.empty();
	$recallSelection.empty();
	$startRecallForm.addClass('hidden');

	delay(showInstructionText, 0, '3');
	delay(showInstructionText, 1000, '2');
	delay(showInstructionText, 2000, '1');
	delay(showInstructionText, 3000, 'GO!');
	for (m = 0; m < recallCount; m++) {
		delay(showInstructionText, 3000 + (m * 1000), stage[m]);
	}
	delay(showInstructionText, 3000 + (m++ * 1000), 'Done.');
	delay(showChoices, 3000 + (m * 1000), choices, stage);
}

tests = [];

startRecallExperiment.addEventListener('click', function( event ) {
	// recallCount = 1;
	nextStage();
}, false);

function debug() {
	var numberOfChoices = Math.min(recallCount * 5, allEmoji.length);
	var choices = sampleSize(allEmoji, numberOfChoices);
	var stage = sampleSize(choices, recallCount);
	showChoices(choices, stage);
}

if (!isEmojiSupported(thinkingEmoji)) {
	bonzo(document.getElementById('emojiThinkingHeader')).remove()
}

// debug();