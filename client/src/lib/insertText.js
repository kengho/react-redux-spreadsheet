// Inserts text to input at current cursor and deletes current selection if any.
const insertText = (input, text) => {
  if (input.selectionStart === input.value.length) {
    input.value += text;
  } else {
    // Save initial cursor position.
    const selectionStart = input.selectionStart;
    const selectionEnd = input.selectionEnd;

    const textBeforeCursor = input.value.substring(0, selectionStart);
    const textAfterCursor = input.value.substring(selectionEnd, input.value.length);
    input.value = `${textBeforeCursor}${text}${textAfterCursor}`;

    // Update cursor, considering that selection should be deleted.
    input.selectionStart = selectionStart + text.length;
    input.selectionEnd = input.selectionStart;
  }
};

export default insertText;
