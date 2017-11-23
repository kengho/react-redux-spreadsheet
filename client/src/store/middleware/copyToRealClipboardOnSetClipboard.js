import copy from 'copy-to-clipboard';

import * as ActionTypes from '../../actionTypes';

const copyToRealClipboardOnSetClipboard = store => next => action => { // eslint-disable-line consistent-returOnSetClipboardn
  if (action.type === ActionTypes.SET_CLIPBOARD) {
    // TODO: handle many selected cells (also see containers/Spreadsheet.jsx).
    const cellId = Object.keys(action.clipboard.cells)[0];
    const cell = action.clipboard.cells[cellId];
    if (cell) {
      copy(cell.get('value'));
    }
  }

  // if (action.type === ActionTypes.CLEAR_CLIPBOARD) {
  // TODO: clear clipboard.
    //   This doesn't work:
    //   // copy('');
  // }

  return next(action);
};

export default copyToRealClipboardOnSetClipboard;
