// Inserts text to input at current cursor.
//   Some code from:
//   http://stackoverflow.com/a/11077016/6376451
const insertText = (input, text) => {
  if (input.selectionStart || input.selectionStart === 0) {
    const startPos = input.selectionStart;
    const endPos = input.selectionEnd;
    const textBeforeCursor = input.value.substring(0, startPos);
    const textAfterCursor = input.value.substring(endPos, input.value.length);
    input.value = `${textBeforeCursor}${text}${textAfterCursor}`;

    // Update cursor.
    input.selectionStart = startPos + text.length;
    input.selectionEnd = input.selectionStart;
  } else {
    input.value += text;
  }
};

export default insertText;
