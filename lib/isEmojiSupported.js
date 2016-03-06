/*
Adapted from code by @mwunsch at https://gist.github.com/mwunsch/4710561

The rule is:
If you have the smiling emoji in Canvas draw
  Try to prune the ones you DON'T have
Else if you don't, or you're in firefox
  Don't try to prune
  This means you may end up with loads of squares
*/
var smilingEmoji = 0x1F604;

function isSmileSupported() {
    if (!document.createElement('canvas').getContext) return false;

    if (!isEmojiSupported.canvas) {
        isEmojiSupported.canvas = document.createElement('canvas');
        isEmojiSupported.context = isEmojiSupported.canvas.getContext('2d');        
    }

    isEmojiSupported.context.clearRect(
        0,
        0,
        isEmojiSupported.canvas.width,
        isEmojiSupported.canvas.height
    );

    if (typeof isEmojiSupported.context.fillText != 'function') return false;

    isEmojiSupported.context.textBaseline = "top";
    isEmojiSupported.context.font = "32px Arial";
    isEmojiSupported.context.fillText(String.fromCodePoint(smilingEmoji), 0, 0);
    return isEmojiSupported.context.getImageData(16, 16, 1, 1).data[0] !== 0;
}

function isEmojiSupported(code) {
    var emojiToTest;
    var firefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
    // This test will not work if they can't use canvas.
    // They probably don't support emoji.

    if (firefox || !isSmileSupported()) {
        // Firefox doesn't support canvas emoji stuff so we should assume it will work.
        return true;
    }

    if (!document.createElement('canvas').getContext) return false;

    if (!isEmojiSupported.canvas) {
        isEmojiSupported.canvas = document.createElement('canvas');
        isEmojiSupported.context = isEmojiSupported.canvas.getContext('2d');        
    }

    isEmojiSupported.context.clearRect(
        0,
        0,
        isEmojiSupported.canvas.width,
        isEmojiSupported.canvas.height
    );

    if (typeof isEmojiSupported.context.fillText != 'function') return false;

    emojiToTest = String.fromCodePoint(code);

    isEmojiSupported.context.textBaseline = "top";
    isEmojiSupported.context.font = "32px Arial";
    isEmojiSupported.context.fillText(emojiToTest, 0, 0);
    return isEmojiSupported.context.getImageData(16, 16, 1, 1).data[0] !== 0;
}

module.exports = isEmojiSupported;