import { ActionCreators as UndoActionCreators } from 'redux-undo';

import { setPointerModifiers } from '../../actions/table';

// HACK: after actions sequence SET_POINTER (edit: true), SET_PROP, (MOVE_POINTER)
//   state with 'pointer.modifiers.edit === true' adds to history, thus pressing Ctrl+Z enters DataCell.
//   But Ctrl+Z won't work while you are in DataCell, and next Ctrl+Z won't work until you press Esc,
//   which is uncomfortable.
//   So, this middleware deletes 'edit: true' from pointer's modifiers after undo/redo.
// REVIEW: could it be done by undoable() filter or groupBy?
//   We need to insert state without pointer to history somehow.
const handleUndoRedo = store => next => action => { // eslint-disable-line consistent-return
  if (action.type === UndoActionCreators.undo().type || action.type === UndoActionCreators.redo().type) {
    const nextAction = next(action);
    const pointer = store.getState().get('table').present.getIn(['session', 'pointer']).toJS();
    if (pointer.cellId) {
      store.dispatch(setPointerModifiers({}));
    }

    return nextAction;
  }

  return next(action);
};

export default handleUndoRedo;
