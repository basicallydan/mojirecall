/*
Adapted from code by @mwunsch at https://gist.github.com/mwunsch/4710561
*/
function isEmojiSupported(code) {
    var emojiToTest;
    // This test will not work if they can't use canvas.
    // They probably don't support emoji.
    if (!document.createElement('canvas').getContext) return false;

    if (!isEmojiSupported.context) {
        isEmojiSupported.context = document.createElement('canvas').getContext('2d');        
    }

    if (typeof isEmojiSupported.context.fillText != 'function') return false;

    emojiToTest = String.fromCodePoint(code);

    isEmojiSupported.context.textBaseline = "top";
    isEmojiSupported.context.font = "32px Arial";
    isEmojiSupported.context.fillText(emojiToTest, 0, 0);
    return isEmojiSupported.context.getImageData(16, 16, 1, 1).data[0] !== 0;
}

module.exports = isEmojiSupported;