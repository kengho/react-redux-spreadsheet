import { tablePushCellHistory } from '../../actions/table';

const pushCellHistoryOnValueChanges = store => next => action => { // eslint-disable-line consistent-return
  if (
    // Only cells' values are saving.
    action.prop !== 'value' &&
    action.type !== 'TABLE/SET_PROP' &&
    action.type !== 'TABLE/DELETE_PROP'
  ) {
    return next(action);
  }

  const historyValue = store.getState().get('table').present.getIn(
    ['data', 'cells', action.cellId, 'value']
  );

  const time = Math.floor(Date.now());
  store.dispatch(tablePushCellHistory(action.cellId, historyValue, time));

  return next(action);
};

export default pushCellHistoryOnValueChanges;
