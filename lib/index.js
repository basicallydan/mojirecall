var difference = require('lodash/difference');
var pull = require('lodash/pull');
var bonzo = require('bonzo');
var Cookie = require('js-cookie');
var GetAPI = require('./getapi');
var useOpenSansEmoji = false;
var emojiClass = 'emoji';
var emojiListClass = 'emoji-list';

var existingScoreData;

var database = new GetAPI('http://mojirecall.getapi.dev:3030');
var storyDataStore = database.child('moji-stories');
var scoresDataStore = database.child('moji-scores');

var timeChoicesShown;
var currentGame;
var games = [];
var spacebarTimeout;

var Game = require('./Game');

var startRecallExperiment = document.getElementById('startRecallExperiment');
var startRecallForm = document.getElementById('startRecallForm');
var instructionPanel = document.getElementById('instructions');
var resultsPanel = document.getElementById('resultsPanel');
var tryAgainTopButton = document.getElementById('tryAgainTop');
var tryAgainBottomButton = document.getElementById('tryAgainBottom');
var resultsSummary = document.getElementById('resultsSummary');
var roundResults = document.getElementById('roundResults');
var recallChoices = document.getElementById('recallChoices');
var recallSelection = document.getElementById('recallSelection');
var currentTestPanel = document.getElementById('currentTestPanel');
var currentRoundResult = document.getElementById('currentRoundResult');
var nextRoundButton = document.getElementById('nextRoundButton');
var storyForm = document.getElementById('storyForm');
var storyInputAuthor = document.getElementById('storyInputAuthor');
var storyInputContent = document.getElementById('storyInputContent');
var finalRoundResults = document.getElementById('finalRoundResults');
var failedRoundResult = document.getElementById('failedRoundResult');
var showFullResults = document.getElementById('showFullResults');
var topScoreContainer = document.getElementById('topScoreContainer');
var topScore = document.getElementById('topScore');

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
var $finalRoundResults = bonzo(finalRoundResults);
var $failedRoundResult = bonzo(failedRoundResult);
var $topScoreContainer = bonzo(topScoreContainer);
var $topScore = bonzo(topScore);
var $document = bonzo(document.documentElement);

function resetUI() {
	$resultsPanel.addClass('hidden');
	$instructionPanel.addClass('hidden');
	$failedRoundResult.addClass('hidden');
	$finalRoundResults.html('');
	$startRecallForm.removeClass('hidden');
}

function showInstructionHTML(text) {
	$instructionPanel.removeClass('hidden');
	$instructionPanel.html(text);
}

function showGameOver() {
	var h = 0, score = currentGame.recallCount - 1;
	currentGame.finishCurrentRound();
	$resultsSummary.text(`The best you can recall is ${score}`);

	for (h = 0; h < currentGame.rounds.length; h++) {
		$roundResults.append(
			'<div class="round-result">' +
			`<h3>Round ${(h + 1)} </h3>` +
			'<h4>You were shown:</h4>' +
			`<div class="${emojiListClass}">${(currentGame.rounds[h].stage.join(' '))}</div>` +
			'<h4>You answered:</h4>' +
			`<div class="${emojiListClass}">${(currentGame.rounds[h].answer.join(' '))}</div>` +
			'</div>'
		);
	}

	games.push(currentGame);

	tryAgainTopButton.addEventListener('click', resetUI, false);
	tryAgainBottomButton.addEventListener('click', resetUI, false);
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
	var $this = bonzo(this);

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
	currentGame.finishCurrentRound();
	$currentRoundResult.removeClass('hidden');
}

function showIncorrectMessage() {
	var round = currentGame.currentRound;
	var score = round.recallCount;
	$finalRoundResults.html(
		'<div class="round-result">' +
		`<h3>You got to round ${currentGame.currentRoundNumber}!</h3>` +
		'<h4>You were shown:</h4>' +
		`<div class="${emojiListClass}">${(round.stage.join(' '))}</div>` +
		'<h4>You answered:</h4>' +
		`<div class="${emojiListClass}">${(round.answer.join(' '))}</div>` +
		'</div>'
	);
	$failedRoundResult.removeClass('hidden');

	saveScore(score);
}

function verifyChoices() {
	var round = currentGame.currentRound;
	if (round.answer.length === currentGame.recallCount) {
		if (difference(round.answer, round.stage).length === 0) {
			showCorrectMessage();
			if (round.recallCount >= currentGame.askStoriesAfterRecallCount) {
				showStoryForm();
			}
		} else {
			showIncorrectMessage();
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
		bonzo(emptySelection).addClass(`${emojiClass} emoji-selection-empty`);
		bonzo(emptySelection).text('?');
		$recallSelection.append(emptySelection);
	}

	for (m = currentGame.currentRound.choices.length - 1; m >= 0; m--) {
		choiceButton = document.createElement('a');
		bonzo(choiceButton).addClass(`${emojiClass} emoji-choice`);
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
	currentGame.generateRound();

	// Reset for the next level
	$currentTestPanel.addClass('hidden');
	$recallChoices.empty();
	$recallSelection.empty();
	$startRecallForm.addClass('hidden');
	$currentRoundResult.addClass('hidden');
	$storyForm.addClass('hidden');
	$storyInputContent.val('');

	var start = `<span class="large-central-instruction">Round ${currentGame.currentRoundNumber}</span>`;
	start += `\n<span class="medium-central-instruction"><span class="mouse-only">Hit <kbd>spacebar</kbd> to start</span><span class="touch-only">Tap here to start</span></span>`;

	showInstructionHTML(start);
}

function handleSpacebarOrTap(type) {
	type = type || 'space';
	if (spacebarTimeout) {
		clearTimeout(spacebarTimeout);
		spacebarTimeout = null;
	}

	if (!currentGame) {
		return startGame();
	}

	var html;

	var round = currentGame.currentRound;

	if (document.activeElement === storyInputAuthor ||
		document.activeElement === storyInputContent) {
		return;
	}

	if (round.allShown && type === 'space') {
		saveAndGoToNextRound();
		return;
	} else if(round.allShown) {
		// It's a tap. We should not continue here.
		return;
	}

	var moji = round.getNextEmoji();


	if (moji) {
		html = `<span class="${emojiClass} emoji-flash">${moji}</span>`;
		if (round.recallCount > 2) {
			html += '<span id="hit-spacebar-hint" class="hint-below-emoji hidden"><span class="mouse-only">Hit <kbd>spacebar</kbd> to continue</span><span class="touch-only">Tap here to continue</span></span>';
			spacebarTimeout = setTimeout(function () {
				var spHint = document.getElementById('hit-spacebar-hint');
				bonzo(spHint).removeClass('hidden');
			}, 5000);
		} else {
			html += '<span id="hit-spacebar-hint" class="hint-below-emoji"><span class="mouse-only">Hit <kbd>spacebar</kbd> to continue</span><span class="touch-only">Tap here to continue</span></span>';
		}
		showInstructionHTML(html);
	} else {
		showChoices();
	}

	return false;
}

function handleReturn() {
	if (!currentGame) {
		return true;
	}

	if (document.activeElement === storyInputAuthor ||
		document.activeElement === storyInputContent) {
		saveAndGoToNextRound();
	return false;
	}

	return true;
}

function startGame() {
	currentGame = new Game();
	nextStage();
}

startRecallExperiment.addEventListener('click', startGame, false);

function saveAndGoToNextRound() {
	var round = currentGame.currentRound;
	var storyContent = $storyInputContent.val().trim();
	saveRound(
		storyContent,
		round.recallCount,
		round.stage.join(''),
		round.timeTaken,
		$storyInputAuthor.val()
	);
	nextStage();
}

function saveRound(storyContent, length, stage, timeTaken, twitterHandle) {
	var data = {
		recallCount:length,
		stage:stage,
		timeTaken:timeTaken,
	};
	if (storyContent) {
		data.story = storyContent;
	}
	if (twitterHandle) {
		data.twitter = twitterHandle;
	}
	storyDataStore.push(data);
}

function updateTopScore() {
	if (!existingScoreData) {
		$topScoreContainer.addClass('hidden');
		return console.warn("The top score function is being called for some reason even though there isn't a top score");
	}

	$topScore.text(existingScoreData.content.topScore.score);
	$topScoreContainer.removeClass('hidden');
}

function getExistingScoreData() {
	var scoreLink = Cookie.get('scoreLink');
	if (scoreLink) {
		database.getURL(scoreLink, function (err, resp, body) {
			if (err) {
				console.warn('Had some trouble getting score data:');
				console.warn(err);
				return;
			}

			existingScoreData = body;
			updateTopScore();
		});
	}
}

function saveScore(score) {
	var latestScoreData = {
		date: Date.parse(new Date())/1000,
		score: score
	};
	if (!existingScoreData) {
		existingScoreData = {
			content: {}
		};
	}
	if (!existingScoreData.content.scores) {
		existingScoreData.content.scores = [];
	}

	if (!existingScoreData.content.topScore ||
		latestScoreData.score > existingScoreData.content.topScore) {
		existingScoreData.content.topScore = latestScoreData;
	}

	existingScoreData.content.scores.push(latestScoreData);

	scoresDataStore.updateOrPush(existingScoreData, function (err, resp, body) {
		if (err) {
			console.warn('Had some trouble saving score:');
			console.warn(err);
			return;
		}

		existingScoreData = body;
		updateTopScore();
		Cookie.set('scoreLink', body.links.self);
	});
}

nextRoundButton.addEventListener('click', saveAndGoToNextRound, false);

showFullResults.addEventListener('click', showGameOver, false);

document.body.onkeyup = function(e) {
    if (e.keyCode == 32) {
        handleSpacebarOrTap();
    } else if (e.keyCode == 13) {
        handleReturn();
    }
};

function handleTap(e) {
	e.preventDefault();
	e.stopPropagation();
	handleSpacebarOrTap('tap');
}

if ('ontouchend' in document.documentElement) {
	instructionPanel.addEventListener('touchend', handleTap, false);
	document.documentElement.className += ' touch';
} else {
	document.documentElement.className += ' no-touch';
}

if (useOpenSansEmoji || (navigator.userAgent.match(/linux/i) && !navigator.userAgent.match(/android/i))) {
   // Looks like we've got a non-Android linux client
   emojiClass = 'emoji accessible';
   emojiListClass = 'emoji-list accessible';
   bonzo(document.getElementsByClassName('emoji')).addClass('accessible');
}

getExistingScoreData();
