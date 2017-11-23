import * as ActionTypes from '../../actionTypes';
import { setCurrentCellValue } from '../../actions/detachments';

// Clear currentCellValue in detachments so saveEditingCellValueIfNeeded
// middleware won't run again after after several consecutive pointer changes
// without any text typing (including actions sequences like
// "Edit some text" => Enter => Enter => Click).
const clearDetachmentsCurrentCellValueOnPointerMove = store => next => action => { // eslint-disable-line consistent-return
  // TODO: doesn't work with SET_POINTER fsr.
  if (action.type !== ActionTypes.MOVE_POINTER) {
    return next(action);
  }

  store.dispatch(setCurrentCellValue(null));

  return next(action);
};

export default clearDetachmentsCurrentCellValueOnPointerMove;
