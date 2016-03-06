var isEmojiSupported = require('./isEmojiSupported');

module.exports = function (ranges) {
	var emoji = [];
	var emojiCodePoint;
	var i;

	for (i = ranges.length - 1; i >= 0; i--) {
		emojiCodePoint = ranges[i][0];
		while (emojiCodePoint !== ranges[i][1]) {
			if (isEmojiSupported(emojiCodePoint)) {
				// Add the emoji from code point then increment
				emoji.push(String.fromCodePoint(emojiCodePoint++));
			} else {
				// Not this one. Next!
				++emojiCodePoint;
			}
		}
	}

	return emoji;
}