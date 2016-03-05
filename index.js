var sampleSize = require('lodash/sampleSize');
var delay = require('lodash/delay');
var bonzo = require('bonzo');

var emoji = [
	'👍',
	'⛵️'
];

var recallCount = 1;

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

function nextStage() {
	var stage = sampleSize(emoji, recallCount);
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
	delay(resetUI, 3000 + (m * 1000));
	recallCount += 1;
}

tests = [];

startRecallExperiment.addEventListener('click', function( event ) {
	// recallCount = 1;
	nextStage();
}, false);