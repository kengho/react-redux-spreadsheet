import * as ActionTypes from '../../actionTypes';
import { pushCellHistory } from '../../actions/table';

const pushCellHistoryOnValueChanges = store => next => action => { // eslint-disable-line consistent-return
  if (
    // Only cells' values are saving.
    action.prop !== 'value' &&
    action.type !== ActionTypes.SET_PROP &&
    action.type !== ActionTypes.DELETE_PROP
  ) {
    return next(action);
  }

  // REVIEW: should setting autoSaveHistory to false clear all cells' history?
  // REVIEW: should be 'show history button' in cell menu visible when !autoSaveHistory?
  const autoSaveHistory = store.getState().getIn(['settings', 'autoSaveHistory']);
  if (!autoSaveHistory) {
    return next(action);
  }

  const historyValue = store.getState().get('table').present.getIn(
    ['data', 'cells', action.cellId, 'value']
  );

  // Middleware should apply after dispatcher changes state
  // in order to handle redo/undo correctly.
  const nextAction = next(action);

  const time = Date.now();
  store.dispatch(pushCellHistory(action.cellId, historyValue, time));

  return nextAction;
};

export default pushCellHistoryOnValueChanges;
