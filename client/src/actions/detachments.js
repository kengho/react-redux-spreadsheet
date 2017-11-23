// Changing this state branch props doesn't affects on Spreadsheet re-render via connect().
// Such changes could be handeled only in middleware.
// (using in client/src/store/middleware/saveEditingCellValueOnPointerMove.js)

import * as ActionTypes from '../actionTypes';

export function setCurrentCellValue(currentCellValue) { // eslint-disable-line import/prefer-default-export
  return {
    type: ActionTypes.SET_CURRENT_CELL_VALUE,
    currentCellValue,
  };
}
