import { detachmentsSetCurrentCellValue } from '../../actions/detachments';

// Clear currentCellValue in detachments so tableSaveEditingCellValueIfNeeded
// middleware won't run again after after several consecutive pointer changes
// without any text typing (including actions sequences like
// "Edit some text" => Enter => Enter => Click).
const clearDetachmentsCurrentCellValueOnPointerMove = store => next => action => { // eslint-disable-line consistent-return
  if (action.type !== 'TABLE/MOVE_POINTER') {
    return next(action);
  }

  store.dispatch(detachmentsSetCurrentCellValue(null));

  return next(action);
};

export default clearDetachmentsCurrentCellValueOnPointerMove;
