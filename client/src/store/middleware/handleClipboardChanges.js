import copy from 'copy-to-clipboard';

const handleClipboardChanges = store => next => action => { // eslint-disable-line consistent-return
  if (action.type === 'SET_CLIPBOARD') {
    // TODO: handle many selected cells (also see containers/Spreadsheet.jsx).
    const cellId = Object.keys(action.clipboard.cells);
    const cellValue = action.clipboard.cells[cellId].value;
    copy(cellValue);
  }

  if (action.type === 'CLEAR_CLIPBOARD') {
    // TODO: clear clipboard.
    //   This doesn't work:
    //   // copy('');
  }

  return next(action);
};

export default handleClipboardChanges;
