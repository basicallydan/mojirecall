var sampleSize = require('lodash/sampleSize');
var delay = require('lodash/delay');
var bonzo = require('bonzo');

allEmoji = [];

// Build up the emoji list
var emoticonsRange = [0x1F601, 0x1F64F];
var dingbatsRange = [0x2702, 0x27B0];
var transportMapsRange = [0x1F680, 0x1F6C0];
var tailRange = [0x2668, 0xF5FF];

var currentEmoji = emoticonsRange[0];

while (currentEmoji !== emoticonsRange[1]) {
	// Add the emoji from code point then increment
	allEmoji.push(String.fromCodePoint(currentEmoji++));
}

var recallCount = 5;

var startRecallExperiment = document.getElementById('startRecallExperiment');
var startRecallForm = document.getElementById('startRecallForm');
var instructionArea = document.getElementById('instructions');
var $instructionArea = bonzo(instructionArea);
var $startRecallForm = bonzo(startRecallForm);

function randomlySelectFromArray(ar) {
	var item = items[Math.floor(Math.random() * ar.length)];
}

function resetUI() {
	$startRecallForm.removeClass('hidden');
}

function showInstructionText(text) {
	$instructionArea.removeClass('hidden');
	$instructionArea.html(text);
}

function verifyChoices(choices, stage) {
	var m = 0;
	var heading = "<h2>These were the choices. Click to put them in the text box.</h2>"
	$instructionArea.html(heading);
	for (m = choices.length - 1; m >= 0; m--) {
		$instructionArea.append('<a href="#">' + choices[m] + '</a>');
	}
}

function nextStage() {
	var numberOfChoices = Math.min(recallCount * 5, allEmoji.length);
	var choices = sampleSize(allEmoji, numberOfChoices);
	var stage = sampleSize(choices, recallCount);
	var m = 0;
	$startRecallForm.addClass('hidden');
	delay(showInstructionText, 0, '3');
	delay(showInstructionText, 1000, '2');
	delay(showInstructionText, 2000, '1');
	delay(showInstructionText, 3000, 'GO!');
	for (m = 0; m < recallCount; m++) {
		delay(showInstructionText, 3000 + (m * 1000), stage[m]);
	}
	delay(showInstructionText, 3000 + (m++ * 1000), 'Done.');
	delay(verifyChoices, 3000 + (m * 1000), choices, stage);
	recallCount += 1;
}

tests = [];

startRecallExperiment.addEventListener('click', function( event ) {
	// recallCount = 1;
	nextStage();
}, false);