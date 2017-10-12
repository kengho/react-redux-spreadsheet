import copy from 'copy-to-clipboard';

const copyToRealClipboardOnSetClipboard = store => next => action => { // eslint-disable-line consistent-returOnSetClipboardn
  if (action.type === 'TABLE/SET_CLIPBOARD') {
    // TODO: handle many selected cells (also see containers/Spreadsheet.jsx).
    const cellId = Object.keys(action.clipboard.cells);
    const cell = action.clipboard.cells[cellId];
    if (cell) {
      copy(cell.value);
    }
  }

  if (action.type === 'TABLE/CLEAR_CLIPBOARD') {
    // TODO: clear clipboard.
    //   This doesn't work:
    //   // copy('');
  }

  return next(action);
};

export default copyToRealClipboardOnSetClipboard;
