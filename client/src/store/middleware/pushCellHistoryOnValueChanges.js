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

  const historyValue = store.getState().get('table').present.getIn(
    ['data', 'cells', action.cellId, 'value']
  );

  const time = Date.now();
  store.dispatch(pushCellHistory(action.cellId, historyValue, time));

  return next(action);
};

export default pushCellHistoryOnValueChanges;
