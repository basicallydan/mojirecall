module.exports = function (ranges) {
	var emoji = [];
	var emojiCodePoint;
	var i;

	for (i = ranges.length - 1; i >= 0; i--) {
		emojiCodePoint = ranges[i][0];
		while (emojiCodePoint !== ranges[i][1]) {
			// Add the emoji from code point then increment
			emoji.push(String.fromCodePoint(emojiCodePoint++));
		}
	}

	return emoji;
}