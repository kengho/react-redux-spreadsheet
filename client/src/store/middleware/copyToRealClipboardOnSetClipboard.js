import copy from 'copy-to-clipboard';

import {
  COLUMN,
  ROW,
} from '../../constants';
import * as ActionTypes from '../../actionTypes';

export default store => next => action => {
  if (action.type !== ActionTypes.SET_CLIPBOARD) {
    return next(action);
  }

  if (!action.clipboard[ROW].index && !action.clipboard[COLUMN].index) { // could happen in clearing clipboard action
    return next(action);
  }

  // TODO: handle many selected cells (also see containers/Spreadsheet.jsx).
  const cell = action.clipboard.cells[0][0];
  if (!cell) {
    return next(action);
  }

  const value = cell.value || '';

  // TODO: in FF 59 on Linux popup appears if user clicks "Copy" in CellMenu.
  //   Target file: "client/node_modules/copy-to-clipboard/index.js".
  //   It works if user presses Ctrl+C though the code is the same.
  //   Should figure it out. Tried setTimeout(), no help.
  //   Commenting "closePopup()" in CellMenu does the same (nothing).
  //   body's "overflow: scroll !important;" css isn't responsible.
  // copy(value, { debug: true });
  copy(value);

  // if (action.type === ActionTypes.CLEAR_CLIPBOARD) {
  // TODO: clear clipboard.
  //   This doesn't work:
  //   // copy('');
  // }

  return next(action);
};
